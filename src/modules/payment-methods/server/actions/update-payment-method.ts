"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { paymentMethods } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";
import { updatePaymentMethodSchema } from "@/modules/payment-methods/schemas/payment-method.schema";

type UpdatePaymentMethodFieldErrors = Partial<
  Record<keyof z.infer<typeof updatePaymentMethodSchema>, string[]>
>;

export type UpdatePaymentMethodResult =
  | { ok: true; message: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: UpdatePaymentMethodFieldErrors;
    };

export type UpdatePaymentMethodFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: UpdatePaymentMethodFieldErrors;
  values?: {
    description: string;
    sortOrder: string;
  };
};

export async function updatePaymentMethod(
  id: number,
  input: unknown,
): Promise<UpdatePaymentMethodResult> {
  await requirePermission("payment-methods.update");

  const parsedInput = updatePaymentMethodSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for updating the payment method.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as UpdatePaymentMethodFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const [existingPaymentMethod] = await db
    .select({ id: paymentMethods.id })
    .from(paymentMethods)
    .where(and(eq(paymentMethods.id, id), isNull(paymentMethods.deletedAt)))
    .limit(1);

  if (!existingPaymentMethod) {
    return { ok: false, message: "Payment method not found or deleted." };
  }

  const { description, sortOrder } = parsedInput.data;

  await db
    .update(paymentMethods)
    .set({
      description: description ?? undefined,
      sortOrder: sortOrder ? Number.parseInt(sortOrder, 10) : undefined,
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(paymentMethods.id, id));

  return {
    ok: true,
    message: "Payment method updated successfully.",
  };
}

export async function updatePaymentMethodFromForm(
  _prevState: UpdatePaymentMethodFormState,
  formData: FormData,
): Promise<UpdatePaymentMethodFormState> {
  const id = Number(formData.get("id"));
  const description = String(formData.get("description") ?? "");
  const sortOrder = String(formData.get("sortOrder") ?? "");

  const result = await updatePaymentMethod(id, {
    description,
    sortOrder,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        description,
        sortOrder,
      },
    };
  }

  revalidatePath("/payment-methods");

  return {
    status: "success",
    message: result.message,
  };
}
