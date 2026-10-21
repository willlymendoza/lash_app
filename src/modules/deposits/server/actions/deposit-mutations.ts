import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentDeposits,
  appointments,
  paymentMethods,
} from "@/db/schema";
import { createPaymentMethodSnapshot } from "@/lib/utils/payment-method-snapshot";

type DbExecutor = Pick<typeof db, "select" | "insert" | "update">;

type SyncAppointmentDepositInput = {
  appointmentId: number;
  clientId: number;
  hasDeposit: boolean;
  amount?: string;
  paymentMethodId?: number;
  referenceNumber?: string;
  referenceDate?: string;
  bankName?: string;
  accountHolderName?: string;
  destinationAccountLastFour?: string;
  referenceNote?: string;
  currentUserId: number;
  voidReasonOnRemove?: string;
  voidReasonOnReplace?: string;
};

function normalizeAmount(amount: string) {
  return Number.parseFloat(amount).toFixed(2);
}

async function getActiveRecordedDeposit(
  executor: DbExecutor,
  appointmentId: number,
) {
  const [deposit] = await executor
    .select()
    .from(appointmentDeposits)
    .where(
      and(
        eq(appointmentDeposits.appointmentId, appointmentId),
        eq(appointmentDeposits.status, "recorded"),
        isNull(appointmentDeposits.voidedAt),
      ),
    )
    .limit(1);

  return deposit ?? null;
}

export async function syncAppointmentDepositInExecutor(
  executor: DbExecutor,
  input: SyncAppointmentDepositInput,
) {
  const {
    appointmentId,
    clientId,
    hasDeposit,
    amount,
    paymentMethodId,
    referenceNumber,
    referenceDate,
    bankName,
    accountHolderName,
    destinationAccountLastFour,
    referenceNote,
    currentUserId,
    voidReasonOnRemove = "Deposit removed from the appointment.",
    voidReasonOnReplace = "Deposit replaced from the appointment.",
  } = input;

  const [appointment] = await executor
    .select({
      id: appointments.id,
      clientId: appointments.clientId,
    })
    .from(appointments)
    .where(eq(appointments.id, appointmentId))
    .limit(1);

  if (!appointment) {
    throw new Error("The appointment linked to the deposit does not exist.");
  }

  if (appointment.clientId !== clientId) {
    throw new Error("The deposit client must match the appointment client.");
  }

  const activeDeposit = await getActiveRecordedDeposit(executor, appointmentId);

  if (!hasDeposit) {
    if (!activeDeposit) {
      return null;
    }

    if (activeDeposit.status === "applied") {
      throw new Error("An applied deposit cannot be removed.");
    }

    await executor
      .update(appointmentDeposits)
      .set({
        status: "voided",
        voidedAt: new Date(),
        voidedByUserId: currentUserId,
        voidReason: voidReasonOnRemove,
        updatedAt: new Date(),
        updatedByUserId: currentUserId,
      })
      .where(eq(appointmentDeposits.id, activeDeposit.id));

    return null;
  }

  if (!amount || !paymentMethodId) {
    throw new Error("Enter an amount and a payment method to record a deposit.");
  }

  const normalizedAmount = normalizeAmount(amount);

  const [paymentMethod] = await executor
    .select({
      id: paymentMethods.id,
      code: paymentMethods.code,
      name: paymentMethods.name,
      isActive: paymentMethods.isActive,
      deletedAt: paymentMethods.deletedAt,
    })
    .from(paymentMethods)
    .where(eq(paymentMethods.id, paymentMethodId))
    .limit(1);

  if (!paymentMethod || paymentMethod.deletedAt || !paymentMethod.isActive) {
    throw new Error("The selected payment method is not available.");
  }

  const nextReferenceNote = referenceNote?.trim() || null;
  const nextReferenceNumber = referenceNumber?.trim() || null;
  const nextReferenceDate = referenceDate?.trim()
    ? new Date(`${referenceDate.trim()}T00:00:00`)
    : null;
  const nextBankName = bankName?.trim() || null;
  const nextAccountHolderName = accountHolderName?.trim() || null;
  const nextDestinationAccountLastFour = destinationAccountLastFour?.trim() || null;

  if (activeDeposit) {
    if (activeDeposit.status === "applied") {
      throw new Error("An applied deposit cannot be replaced.");
    }

    const sameAmount = activeDeposit.amount === normalizedAmount;
    const samePaymentMethod = activeDeposit.paymentMethodId === paymentMethodId;
    const sameNote = (activeDeposit.referenceNote ?? null) === nextReferenceNote;
    const sameReferenceNumber =
      (activeDeposit.referenceNumber ?? null) === nextReferenceNumber;
    const sameReferenceDate =
      (activeDeposit.referenceDate ?? null)?.getTime?.() ===
      (nextReferenceDate ?? null)?.getTime?.();
    const sameBankName = (activeDeposit.bankName ?? null) === nextBankName;
    const sameAccountHolderName =
      (activeDeposit.accountHolderName ?? null) === nextAccountHolderName;
    const sameDestinationAccountLastFour =
      (activeDeposit.destinationAccountLastFour ?? null) ===
      nextDestinationAccountLastFour;

    if (
      sameAmount &&
      samePaymentMethod &&
      sameNote &&
      sameReferenceNumber &&
      sameReferenceDate &&
      sameBankName &&
      sameAccountHolderName &&
      sameDestinationAccountLastFour
    ) {
      return activeDeposit;
    }

    await executor
      .update(appointmentDeposits)
      .set({
        status: "voided",
        voidedAt: new Date(),
        voidedByUserId: currentUserId,
        voidReason: voidReasonOnReplace,
        updatedAt: new Date(),
        updatedByUserId: currentUserId,
      })
      .where(eq(appointmentDeposits.id, activeDeposit.id));
  }

  const snapshot = createPaymentMethodSnapshot(paymentMethod);

  const [newDeposit] = await executor
    .insert(appointmentDeposits)
    .values({
      appointmentId,
      clientId,
      amount: normalizedAmount,
      paymentMethodId: snapshot.paymentMethodId,
      paymentMethodCodeSnapshot: snapshot.paymentMethodCodeSnapshot,
      paymentMethodNameSnapshot: snapshot.paymentMethodNameSnapshot,
      referenceNumber: nextReferenceNumber,
      referenceDate: nextReferenceDate,
      bankName: nextBankName,
      accountHolderName: nextAccountHolderName,
      destinationAccountLastFour: nextDestinationAccountLastFour,
      referenceNote: nextReferenceNote,
      status: "recorded",
      createdByUserId: currentUserId,
      updatedByUserId: currentUserId,
    })
    .returning();

  return newDeposit ?? null;
}
