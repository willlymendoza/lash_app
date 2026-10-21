"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentDeposits,
  appointments,
  paymentMethods,
  appointmentReschedules,
  appointmentStatusHistory,
} from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { syncAppointmentDepositInExecutor } from "@/modules/deposits/server/actions/deposit-mutations";
import { validateDepositByPaymentMethod } from "@/modules/deposits/server/actions/payment-method-deposit-validation";
import { checkOverlap } from "../queries/check-overlap";
import { getAppointmentById } from "../queries/get-appointment-by-id";
import { updateAppointmentSchema } from "../../schemas/appointment.schema";

function mapDepositFieldErrorsForAppointmentForm(
  fieldErrors: Partial<Record<string, string[]>>,
): UpdateAppointmentFieldErrors {
  const mapped: Record<string, string[]> = {};

  for (const [key, value] of Object.entries(fieldErrors)) {
    if (!value) {
      continue;
    }

    if (key === "paymentMethodId") {
      mapped.depositPaymentMethodId = value;
      continue;
    }

    const capitalizedKey = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
    mapped[`deposit${capitalizedKey}`] = value;
  }

  return mapped as UpdateAppointmentFieldErrors;
}

type UpdateAppointmentFieldErrors = Partial<
  Record<keyof z.infer<typeof updateAppointmentSchema>, string[]>
>;

export type UpdateAppointmentResult =
  | {
      ok: true;
      message: string;
      warningMessage?: string;
      appointment: { id: number };
    }
  | { ok: false; message: string; fieldErrors?: UpdateAppointmentFieldErrors };

export type UpdateAppointmentFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  warningMessage?: string;
  fieldErrors?: UpdateAppointmentFieldErrors;
  values?: {
    id: string;
    clientId: string;
    lashistUserId: string;
    serviceId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: string;
    notes: string;
    status: string;
    statusNote: string;
    rescheduleNote: string;
    hasDeposit: string;
    depositAmount: string;
    depositPaymentMethodId: string;
    depositReferenceNumber: string;
    depositReferenceDate: string;
    depositBankName: string;
    depositAccountHolderName: string;
    depositDestinationAccountLastFour: string;
    depositReferenceNote: string;
    depositVoidReason: string;
    manageDepositInAppointmentSubmit: string;
  };
};

export async function updateAppointment(
  id: number,
  input: unknown,
): Promise<UpdateAppointmentResult> {
  await requirePermission("appointments.update");

  const parsedInput = updateAppointmentSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for updating the appointment.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as UpdateAppointmentFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const existingAppointment = await getAppointmentById(id);

  if (!existingAppointment) {
    return { ok: false, message: "The appointment does not exist." };
  }

  const {
    clientId,
    lashistUserId,
    serviceId,
    appointmentDate,
    startTime,
    endTime,
    durationMinutes,
    notes,
    status,
    statusNote,
    rescheduleNote,
    manageDepositInAppointmentSubmit,
    hasDeposit,
    depositAmount,
    depositPaymentMethodId,
    depositReferenceNumber,
    depositReferenceDate,
    depositBankName,
    depositAccountHolderName,
    depositDestinationAccountLastFour,
    depositReferenceNote,
    depositVoidReason,
  } = parsedInput.data;

  const [activeDeposit] = await db
    .select({
      id: appointmentDeposits.id,
      status: appointmentDeposits.status,
      clientId: appointmentDeposits.clientId,
    })
    .from(appointmentDeposits)
    .where(
      and(
        eq(appointmentDeposits.appointmentId, id),
        eq(appointmentDeposits.status, "recorded"),
        isNull(appointmentDeposits.voidedAt),
      ),
    )
    .limit(1);

  if (manageDepositInAppointmentSubmit && hasDeposit) {
    await requirePermission("appointment-advances.create");

    if (activeDeposit) {
      await requirePermission("appointment-advances.void");
    }

    if (!depositPaymentMethodId) {
      return {
        ok: false,
        message: "The deposit payment method is required.",
        fieldErrors: {
          depositPaymentMethodId: ["The deposit payment method is required."],
        } as UpdateAppointmentFieldErrors,
      };
    }

    const [paymentMethod] = await db
      .select({
        code: paymentMethods.code,
        isActive: paymentMethods.isActive,
        deletedAt: paymentMethods.deletedAt,
      })
      .from(paymentMethods)
      .where(eq(paymentMethods.id, depositPaymentMethodId))
      .limit(1);

    if (!paymentMethod || paymentMethod.deletedAt || !paymentMethod.isActive) {
      return {
        ok: false,
        message: "The deposit payment method is not available.",
        fieldErrors: {
          depositPaymentMethodId: [
            "The deposit payment method is not available.",
          ],
        } as UpdateAppointmentFieldErrors,
      };
    }

    const conditionalValidation = validateDepositByPaymentMethod({
      paymentMethodCode: paymentMethod.code,
      amount: depositAmount,
      referenceNumber: depositReferenceNumber,
      referenceDate: depositReferenceDate,
      bankName: depositBankName,
      accountHolderName: depositAccountHolderName,
      destinationAccountLastFour: depositDestinationAccountLastFour,
      referenceNote: depositReferenceNote,
    });

    if (!conditionalValidation.ok) {
      return {
        ok: false,
        message: conditionalValidation.message,
        fieldErrors: mapDepositFieldErrorsForAppointmentForm(
          conditionalValidation.fieldErrors,
        ),
      };
    }
  }

  if (manageDepositInAppointmentSubmit && !hasDeposit && activeDeposit) {
    await requirePermission("appointment-advances.void");

    if (!depositVoidReason?.trim()) {
      return {
        ok: false,
        message: "The deposit void reason is required.",
        fieldErrors: {
          depositVoidReason: ["The void reason is required."],
        } as UpdateAppointmentFieldErrors,
      };
    }
  }

  const normalizeTime = (timeValue: string) =>
    timeValue.length >= 5 ? timeValue.slice(0, 5) : timeValue;

  const existingAppointmentDate = existingAppointment.appointmentDate as string;
  const existingStartTime = normalizeTime(existingAppointment.startTime);
  const existingEndTime = normalizeTime(existingAppointment.endTime);
  const normalizedStartTime = normalizeTime(startTime);
  const normalizedEndTime = normalizeTime(endTime);

  const nextAppointmentDate =
    appointmentDate || existingAppointmentDate;
  const nextClientId = clientId ?? existingAppointment.clientId;
  const nextLashistUserId = lashistUserId ?? existingAppointment.lashistUserId;
  const nextStartTime = normalizedStartTime || existingStartTime;
  const nextEndTime = normalizedEndTime || existingEndTime;
  const hasLashistChange = nextLashistUserId !== existingAppointment.lashistUserId;
  const hasClientChange = nextClientId !== existingAppointment.clientId;
  const hasDateOrTimeChanges =
    nextAppointmentDate !== existingAppointmentDate ||
    nextStartTime !== existingStartTime ||
    nextEndTime !== existingEndTime;
  const hasStatusChange = Boolean(status && status !== existingAppointment.status);

  if (hasDateOrTimeChanges && !rescheduleNote?.trim()) {
    return {
      ok: false,
      message:
        "A rescheduling note is required when changing the appointment's date or time.",
      fieldErrors: {
        rescheduleNote: ["The rescheduling note is required."],
      } as UpdateAppointmentFieldErrors,
    };
  }

  if (hasStatusChange && !statusNote?.trim()) {
    return {
      ok: false,
      message: "A status note is required when changing the appointment status.",
      fieldErrors: {
        statusNote: ["The status note is required."],
      } as UpdateAppointmentFieldErrors,
    };
  }

  let warningMessage: string | undefined;

  if (hasDateOrTimeChanges || hasLashistChange) {
    const hasOverlap = await checkOverlap({
      lashistUserId: nextLashistUserId,
      appointmentDate: nextAppointmentDate,
      startTime: nextStartTime,
      endTime: nextEndTime,
      excludeAppointmentId: id,
    });

    if (hasOverlap) {
      warningMessage =
        "The appointment was saved, but it overlaps another appointment for the same lash artist.";
    }
  }

  const updatedAt = new Date();

  const result = await db.transaction(async (tx) => {
    const [updatedAppointment] = await tx
      .update(appointments)
      .set({
        clientId: clientId ?? existingAppointment.clientId,
        // Deposit consistency is validated separately by syncAppointmentDepositInExecutor.
        lashistUserId: nextLashistUserId,
        serviceId: serviceId ?? existingAppointment.serviceId,
        appointmentDate: nextAppointmentDate,
        startTime: nextStartTime,
        endTime: nextEndTime,
        durationMinutes: durationMinutes ?? existingAppointment.durationMinutes,
        notes: notes ?? existingAppointment.notes,
        status: status ?? existingAppointment.status,
        updatedAt,
        updatedByUserId: currentActiveUser.id,
      })
      .where(eq(appointments.id, id))
      .returning({
        id: appointments.id,
      });

    if (!updatedAppointment) {
      return { ok: false as const, message: "Error updating the appointment." };
    }

    if (hasDateOrTimeChanges) {
      await tx.insert(appointmentReschedules).values({
        appointmentId: id,
        oldDate: existingAppointmentDate,
        oldStartTime: existingStartTime,
        oldEndTime: existingEndTime,
        newDate: nextAppointmentDate,
        newStartTime: nextStartTime,
        newEndTime: nextEndTime,
        note: rescheduleNote?.trim() || null,
        createdByUserId: currentActiveUser.id,
      });
    }

    if (hasStatusChange && status) {
      await tx.insert(appointmentStatusHistory).values({
        appointmentId: id,
        oldStatus: existingAppointment.status,
        newStatus: status,
        note: statusNote || null,
        changedByUserId: currentActiveUser.id,
      });
    }

    if (hasClientChange && activeDeposit && activeDeposit.status === "recorded") {
      await tx
        .update(appointmentDeposits)
        .set({
          clientId: nextClientId,
          updatedAt,
          updatedByUserId: currentActiveUser.id,
        })
        .where(eq(appointmentDeposits.id, activeDeposit.id));
    }

    if (manageDepositInAppointmentSubmit) {
      await syncAppointmentDepositInExecutor(tx, {
        appointmentId: id,
        clientId: nextClientId,
        hasDeposit,
        amount: depositAmount,
        paymentMethodId: depositPaymentMethodId,
        referenceNumber: depositReferenceNumber,
        referenceDate: depositReferenceDate,
        bankName: depositBankName,
        accountHolderName: depositAccountHolderName,
        destinationAccountLastFour: depositDestinationAccountLastFour,
        referenceNote: depositReferenceNote,
        currentUserId: currentActiveUser.id,
        voidReasonOnRemove: depositVoidReason?.trim()
          ? depositVoidReason.trim()
          : "Deposit voided while editing the appointment.",
        voidReasonOnReplace: "replaced after correction/edit",
      });
    }

    return {
      ok: true as const,
      appointment: updatedAppointment,
    };
  });

  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  return {
    ok: true,
    message: "Appointment updated successfully.",
    warningMessage: hasClientChange && activeDeposit
      ? warningMessage
        ? `${warningMessage} The active deposit was reassigned to the appointment's new client.`
        : "The active deposit was reassigned to the appointment's new client."
      : warningMessage,
    appointment: result.appointment,
  };
}

export async function updateAppointmentFromForm(
  _prevState: UpdateAppointmentFormState,
  formData: FormData,
): Promise<UpdateAppointmentFormState> {
  const id = Number(formData.get("id") ?? "");
  const clientId = Number(formData.get("clientId") ?? "");
  const lashistUserId = Number(formData.get("lashistUserId") ?? "");
  const serviceId = Number(formData.get("serviceId") ?? "");
  const appointmentDate = String(formData.get("appointmentDate") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const durationMinutes = Number(formData.get("durationMinutes") ?? "");
  const notes = String(formData.get("notes") ?? "");
  const status = String(formData.get("status") ?? "");
  const statusNote = String(formData.get("statusNote") ?? "");
  const rescheduleNote = String(formData.get("rescheduleNote") ?? "");
  const manageDepositInAppointmentSubmit =
    formData.get("manageDepositInAppointmentSubmit") === "true";
  const hasDeposit = formData.get("hasDeposit") === "true";
  const depositAmount = String(formData.get("depositAmount") ?? "");
  const depositPaymentMethodIdRaw = String(
    formData.get("depositPaymentMethodId") ?? "",
  );
  const depositPaymentMethodId = depositPaymentMethodIdRaw
    ? Number(depositPaymentMethodIdRaw)
    : undefined;
  const depositReferenceNote = String(formData.get("depositReferenceNote") ?? "");
  const depositReferenceNumber = String(
    formData.get("depositReferenceNumber") ?? "",
  );
  const depositReferenceDate = String(formData.get("depositReferenceDate") ?? "");
  const depositBankName = String(formData.get("depositBankName") ?? "");
  const depositAccountHolderName = String(
    formData.get("depositAccountHolderName") ?? "",
  );
  const depositDestinationAccountLastFour = String(
    formData.get("depositDestinationAccountLastFour") ?? "",
  );
  const depositVoidReason = String(formData.get("depositVoidReason") ?? "");

  const result = await updateAppointment(id, {
    clientId,
    lashistUserId,
    serviceId,
    appointmentDate,
    startTime,
    endTime,
    durationMinutes,
    notes,
    status: status || undefined,
    statusNote: statusNote || undefined,
    rescheduleNote: rescheduleNote || undefined,
    manageDepositInAppointmentSubmit,
    hasDeposit: manageDepositInAppointmentSubmit ? hasDeposit : true,
    depositAmount:
      manageDepositInAppointmentSubmit && hasDeposit ? depositAmount : undefined,
    depositPaymentMethodId:
      manageDepositInAppointmentSubmit && hasDeposit
        ? depositPaymentMethodId
        : undefined,
    depositReferenceNote:
      manageDepositInAppointmentSubmit && hasDeposit
        ? depositReferenceNote
        : undefined,
    depositReferenceNumber:
      manageDepositInAppointmentSubmit && hasDeposit
        ? depositReferenceNumber
        : undefined,
    depositReferenceDate:
      manageDepositInAppointmentSubmit && hasDeposit
        ? depositReferenceDate
        : undefined,
    depositBankName:
      manageDepositInAppointmentSubmit && hasDeposit
        ? depositBankName
        : undefined,
    depositAccountHolderName:
      manageDepositInAppointmentSubmit && hasDeposit
        ? depositAccountHolderName
        : undefined,
    depositDestinationAccountLastFour:
      manageDepositInAppointmentSubmit && hasDeposit
        ? depositDestinationAccountLastFour
        : undefined,
    depositVoidReason:
      manageDepositInAppointmentSubmit && !hasDeposit
        ? depositVoidReason
        : undefined,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        id: String(id),
        clientId: String(clientId),
        lashistUserId: String(lashistUserId),
        serviceId: String(serviceId),
        appointmentDate,
        startTime,
        endTime,
        durationMinutes: String(durationMinutes),
        notes,
        status,
        statusNote,
        rescheduleNote,
        hasDeposit: String(hasDeposit),
        depositAmount,
        depositPaymentMethodId: depositPaymentMethodIdRaw,
        depositReferenceNumber,
        depositReferenceDate,
        depositBankName,
        depositAccountHolderName,
        depositDestinationAccountLastFour,
        depositReferenceNote,
        depositVoidReason,
        manageDepositInAppointmentSubmit: String(
          manageDepositInAppointmentSubmit,
        ),
      },
    };
  }

  revalidatePath("/appointments");

  return {
    status: "success",
    message: result.message,
    warningMessage: result.warningMessage,
  };
}

