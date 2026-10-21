"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { appointmentDeposits } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";
import {
  voidAppointmentDepositSchema,
  type VoidAppointmentDepositInput,
} from "../../schemas/deposit.schema";

type VoidDepositFieldErrors = Partial<
  Record<keyof VoidAppointmentDepositInput, string[]>
>;

export type VoidAppointmentDepositResult =
  | { ok: true; message: string; depositId: number }
  | { ok: false; message: string; fieldErrors?: VoidDepositFieldErrors };

export type VoidAppointmentDepositFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: VoidDepositFieldErrors;
  values?: {
    depositId: string;
    voidReason: string;
  };
};

export async function voidAppointmentDeposit(
  input: unknown,
): Promise<VoidAppointmentDepositResult> {
  await requirePermission("appointment-advances.void");

  const parsedInput = voidAppointmentDepositSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for voiding the deposit.",
      fieldErrors: parsedInput.error.flatten().fieldErrors as VoidDepositFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { depositId, voidReason } = parsedInput.data;

  const [activeDeposit] = await db
    .select({
      id: appointmentDeposits.id,
      status: appointmentDeposits.status,
      voidedAt: appointmentDeposits.voidedAt,
    })
    .from(appointmentDeposits)
    .where(
      and(
        eq(appointmentDeposits.id, depositId),
        isNull(appointmentDeposits.voidedAt),
      ),
    )
    .limit(1);

  if (!activeDeposit) {
    return { ok: false, message: "The deposit does not exist or has already been voided." };
  }

  if (activeDeposit.status === "applied") {
    return { ok: false, message: "An applied deposit cannot be voided." };
  }

  await db
    .update(appointmentDeposits)
    .set({
      status: "voided",
      voidedAt: new Date(),
      voidedByUserId: currentActiveUser.id,
      voidReason: voidReason.trim(),
      updatedAt: new Date(),
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(appointmentDeposits.id, depositId));

  return {
    ok: true,
    message: "Deposit voided successfully.",
    depositId,
  };
}

export async function voidAppointmentDepositFromForm(
  _prevState: VoidAppointmentDepositFormState,
  formData: FormData,
): Promise<VoidAppointmentDepositFormState> {
  const depositIdRaw = String(formData.get("depositId") ?? "");
  const voidReason = String(formData.get("voidReason") ?? "");
  const depositId = Number(depositIdRaw);

  const result = await voidAppointmentDeposit({
    depositId,
    voidReason,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        depositId: depositIdRaw,
        voidReason,
      },
    };
  }

  revalidatePath("/appointments");

  return {
    status: "success",
    message: result.message,
  };
}
