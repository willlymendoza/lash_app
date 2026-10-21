"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appointments, paymentMethods, services } from "@/db/schema";
import { syncAppointmentDepositInExecutor } from "@/modules/deposits/server/actions/deposit-mutations";
import { validateDepositByPaymentMethod } from "@/modules/deposits/server/actions/payment-method-deposit-validation";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { checkOverlap } from "../queries/check-overlap";
import { createAppointmentSchema } from "../../schemas/appointment.schema";

function mapDepositFieldErrorsForAppointmentForm(
  fieldErrors: Partial<Record<string, string[]>>,
): CreateAppointmentFieldErrors {
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

  return mapped as CreateAppointmentFieldErrors;
}

type CreateAppointmentFieldErrors = Partial<
  Record<keyof z.infer<typeof createAppointmentSchema>, string[]>
>;

export type CreateAppointmentResult =
  | {
      ok: true;
      message: string;
      warningMessage?: string;
      appointment: { id: number };
    }
  | { ok: false; message: string; fieldErrors?: CreateAppointmentFieldErrors };

export type CreateAppointmentFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  warningMessage?: string;
  fieldErrors?: CreateAppointmentFieldErrors;
  values?: {
    clientId: string;
    lashistUserId: string;
    serviceId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: string;
    notes: string;
    hasDeposit: string;
    depositAmount: string;
    depositPaymentMethodId: string;
    depositReferenceNumber: string;
    depositReferenceDate: string;
    depositBankName: string;
    depositAccountHolderName: string;
    depositDestinationAccountLastFour: string;
    depositReferenceNote: string;
  };
};

export async function createAppointment(
  input: unknown,
): Promise<CreateAppointmentResult> {
  await requirePermission("appointments.create");

  const parsedInput = createAppointmentSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for creating the appointment.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as CreateAppointmentFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
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
    hasDeposit,
    depositAmount,
    depositPaymentMethodId,
    depositReferenceNumber,
    depositReferenceDate,
    depositBankName,
    depositAccountHolderName,
    depositDestinationAccountLastFour,
    depositReferenceNote,
  } = parsedInput.data;

  if (hasDeposit) {
    await requirePermission("appointment-advances.create");

    if (!depositPaymentMethodId) {
      return {
        ok: false,
        message: "The deposit payment method is required.",
        fieldErrors: {
          depositPaymentMethodId: ["The deposit payment method is required."],
        },
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
        },
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

  // Get the service to create snapshots
  const [service] = await db
    .select({
      name: services.name,
      basePrice: services.basePrice,
      estimatedDurationMinutes: services.estimatedDurationMinutes,
    })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  if (!service) {
    return { ok: false, message: "The specified service does not exist." };
  }

  // Check for overlapping appointments
  const hasOverlap = await checkOverlap({
    lashistUserId,
    appointmentDate, // Ya viene en formato YYYY-MM-DD desde el frontend (Guatemala)
    startTime,
    endTime,
  });

  const warningMessage = hasOverlap
    ? "The appointment was saved, but it overlaps another appointment for the same lash artist."
    : undefined;

  const insertValues = {
    clientId,
    lashistUserId,
    serviceId,
    appointmentDate, // Ya viene en formato YYYY-MM-DD desde el frontend (Guatemala)
    startTime,
    endTime,
    durationMinutes,
    notes: notes || null,
    serviceNameSnapshot: service.name,
    servicePriceSnapshot: service.basePrice,
    estimatedDurationSnapshot: service.estimatedDurationMinutes,
    createdByUserId: currentActiveUser.id,
    updatedByUserId: currentActiveUser.id,
  };

  const newAppointment = await db.transaction(async (tx) => {
    const [createdAppointment] = await tx
      .insert(appointments)
      .values(insertValues)
      .returning({
        id: appointments.id,
      });

    if (!createdAppointment) {
      return null;
    }

    if (hasDeposit) {
      await syncAppointmentDepositInExecutor(tx, {
        appointmentId: createdAppointment.id,
        clientId,
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
      });
    }

    return createdAppointment;
  });

  if (!newAppointment) {
    return { ok: false, message: "Error creating the appointment." };
  }

  return {
    ok: true,
    message: "Appointment created successfully.",
    warningMessage,
    appointment: newAppointment,
  };
}

export async function createAppointmentFromForm(
  _prevState: CreateAppointmentFormState,
  formData: FormData,
): Promise<CreateAppointmentFormState> {
  const clientId = Number(formData.get("clientId") ?? "");
  const lashistUserId = Number(formData.get("lashistUserId") ?? "");
  const serviceId = Number(formData.get("serviceId") ?? "");
  const appointmentDate = String(formData.get("appointmentDate") ?? "");
  const startTime = String(formData.get("startTime") ?? "");
  const endTime = String(formData.get("endTime") ?? "");
  const durationMinutes = Number(formData.get("durationMinutes") ?? "");
  const notes = String(formData.get("notes") ?? "");
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

  const result = await createAppointment({
    clientId,
    lashistUserId,
    serviceId,
    appointmentDate,
    startTime,
    endTime,
    durationMinutes,
    notes,
    hasDeposit,
    depositAmount: hasDeposit ? depositAmount : undefined,
    depositPaymentMethodId: hasDeposit ? depositPaymentMethodId : undefined,
    depositReferenceNote: hasDeposit ? depositReferenceNote : undefined,
    depositReferenceNumber: hasDeposit ? depositReferenceNumber : undefined,
    depositReferenceDate: hasDeposit ? depositReferenceDate : undefined,
    depositBankName: hasDeposit ? depositBankName : undefined,
    depositAccountHolderName: hasDeposit ? depositAccountHolderName : undefined,
    depositDestinationAccountLastFour: hasDeposit
      ? depositDestinationAccountLastFour
      : undefined,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        clientId: String(clientId),
        lashistUserId: String(lashistUserId),
        serviceId: String(serviceId),
        appointmentDate,
        startTime,
        endTime,
        durationMinutes: String(durationMinutes),
        notes,
        hasDeposit: String(hasDeposit),
        depositAmount,
        depositPaymentMethodId: depositPaymentMethodIdRaw,
        depositReferenceNumber,
        depositReferenceDate,
        depositBankName,
        depositAccountHolderName,
        depositDestinationAccountLastFour,
        depositReferenceNote,
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
