"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { paymentMethods } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

export type TogglePaymentMethodActiveResult =
  | { ok: true; message: string; isActive: boolean }
  | { ok: false; message: string };

export type TogglePaymentMethodActiveFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function togglePaymentMethodActive(
  id: number,
): Promise<TogglePaymentMethodActiveResult> {
  await requirePermission("payment-methods.toggle-active");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  // Check if payment method exists and is not deleted
  const [existingPaymentMethod] = await db
    .select({
      id: paymentMethods.id,
      name: paymentMethods.name,
      isActive: paymentMethods.isActive,
    })
    .from(paymentMethods)
    .where(and(eq(paymentMethods.id, id), isNull(paymentMethods.deletedAt)))
    .limit(1);

  if (!existingPaymentMethod) {
    return { ok: false, message: "Payment method not found or deleted." };
  }

  const newStatus = !existingPaymentMethod.isActive;

  await db
    .update(paymentMethods)
    .set({
      isActive: newStatus,
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(paymentMethods.id, id));

  return {
    ok: true,
    message: `Payment method "${existingPaymentMethod.name}" ${
      newStatus ? "activated" : "deactivated"
    } successfully.`,
    isActive: newStatus,
  };
}

export async function togglePaymentMethodActiveFromForm(
  _prevState: TogglePaymentMethodActiveFormState,
  formData: FormData,
): Promise<TogglePaymentMethodActiveFormState> {
  const id = Number(formData.get("id"));

  const result = await togglePaymentMethodActive(id);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidatePath("/payment-methods");

  return {
    status: "success",
    message: result.message,
  };
}
