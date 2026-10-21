"use server";

import { revalidatePath } from "next/cache";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { paymentMethods } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";
import {
  upsertAppointmentDepositSchema,
  type UpsertAppointmentDepositInput,
} from "../../schemas/deposit.schema";
import { syncAppointmentDepositInExecutor } from "./deposit-mutations";
import { validateDepositByPaymentMethod } from "./payment-method-deposit-validation";

type UpsertDepositFieldErrors = Partial<
  Record<keyof UpsertAppointmentDepositInput, string[]>
>;

export type UpsertAppointmentDepositResult =
  | { ok: true; message: string; depositId: number | null }
  | {
      ok: false;
      message: string;
      fieldErrors?: UpsertDepositFieldErrors;
    };

export type UpsertAppointmentDepositFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: UpsertDepositFieldErrors;
  values?: {
    appointmentId: string;
    clientId: string;
    amount: string;
    paymentMethodId: string;
    referenceNumber: string;
    referenceDate: string;
    bankName: string;
    accountHolderName: string;
    destinationAccountLastFour: string;
    referenceNote: string;
  };
};

export async function upsertAppointmentDeposit(
  input: unknown,
): Promise<UpsertAppointmentDepositResult> {
  await requirePermission("appointment-advances.create");

  const parsedInput = upsertAppointmentDepositSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid deposit data.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as UpsertDepositFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const [paymentMethod] = await db
    .select({
      code: paymentMethods.code,
      isActive: paymentMethods.isActive,
      deletedAt: paymentMethods.deletedAt,
    })
    .from(paymentMethods)
    .where(eq(paymentMethods.id, parsedInput.data.paymentMethodId))
    .limit(1);

  if (!paymentMethod || paymentMethod.deletedAt || !paymentMethod.isActive) {
    return {
      ok: false,
      message: "The selected payment method is not available.",
      fieldErrors: {
        paymentMethodId: ["The selected payment method is not available."],
      },
    };
  }

  const conditionalValidation = validateDepositByPaymentMethod({
    paymentMethodCode: paymentMethod.code,
    amount: parsedInput.data.amount,
    referenceNumber: parsedInput.data.referenceNumber,
    referenceDate: parsedInput.data.referenceDate,
    bankName: parsedInput.data.bankName,
    accountHolderName: parsedInput.data.accountHolderName,
    destinationAccountLastFour: parsedInput.data.destinationAccountLastFour,
    referenceNote: parsedInput.data.referenceNote,
  });

  if (!conditionalValidation.ok) {
    return {
      ok: false,
      message: conditionalValidation.message,
      fieldErrors: conditionalValidation.fieldErrors as UpsertDepositFieldErrors,
    };
  }

  try {
    const deposit = await db.transaction((tx) =>
      syncAppointmentDepositInExecutor(tx, {
        ...parsedInput.data,
        hasDeposit: true,
        currentUserId: currentActiveUser.id,
      }),
    );

    return {
      ok: true,
      message: "Deposit saved successfully.",
      depositId: deposit?.id ?? null,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not save the deposit.",
    };
  }
}

export async function upsertAppointmentDepositFromForm(
  _prevState: UpsertAppointmentDepositFormState,
  formData: FormData,
): Promise<UpsertAppointmentDepositFormState> {
  const appointmentIdRaw = String(formData.get("appointmentId") ?? "");
  const clientIdRaw = String(formData.get("clientId") ?? "");
  const amount = String(formData.get("amount") ?? "");
  const paymentMethodIdRaw = String(formData.get("paymentMethodId") ?? "");
  const referenceNumber = String(formData.get("referenceNumber") ?? "");
  const referenceDate = String(formData.get("referenceDate") ?? "");
  const bankName = String(formData.get("bankName") ?? "");
  const accountHolderName = String(formData.get("accountHolderName") ?? "");
  const destinationAccountLastFour = String(
    formData.get("destinationAccountLastFour") ?? "",
  );
  const referenceNote = String(formData.get("referenceNote") ?? "");

  const appointmentId = Number(appointmentIdRaw);
  const clientId = Number(clientIdRaw);
  const paymentMethodId = Number(paymentMethodIdRaw);

  const result = await upsertAppointmentDeposit({
    appointmentId,
    clientId,
    amount,
    paymentMethodId,
    referenceNumber,
    referenceDate,
    bankName,
    accountHolderName,
    destinationAccountLastFour,
    referenceNote,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        appointmentId: appointmentIdRaw,
        clientId: clientIdRaw,
        amount,
        paymentMethodId: paymentMethodIdRaw,
        referenceNumber,
        referenceDate,
        bankName,
        accountHolderName,
        destinationAccountLastFour,
        referenceNote,
      },
    };
  }

  revalidatePath("/appointments");

  return {
    status: "success",
    message: result.message,
  };
}
