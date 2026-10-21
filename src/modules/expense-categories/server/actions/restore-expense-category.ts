"use server";

import { revalidatePath } from "next/cache";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { expenseCategories } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";

export type RestoreExpenseCategoryResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type RestoreExpenseCategoryFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function restoreExpenseCategory(
  id: number,
): Promise<RestoreExpenseCategoryResult> {
  await requirePermission("expense-categories.restore");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const existingCategory = await db
    .select({ name: expenseCategories.name })
    .from(expenseCategories)
    .where(eq(expenseCategories.id, id))
    .limit(1);

  if (!existingCategory[0]) {
    return { ok: false, message: "Expense category not found." };
  }

  const [restoredCategory] = await db
    .update(expenseCategories)
    .set({
      deletedAt: null,
      deletedByUserId: null,
      updatedByUserId: currentActiveUser.id,
      updatedAt: new Date(),
    })
    .where(eq(expenseCategories.id, id))
    .returning({ name: expenseCategories.name });

  if (!restoredCategory) {
    return { ok: false, message: "Error restoring the expense category." };
  }

  revalidatePath("/expense-categories");

  return {
    ok: true,
    message: `Category "${restoredCategory.name}" restored successfully.`,
  };
}

export async function restoreExpenseCategoryFromForm(
  _prevState: RestoreExpenseCategoryFormState,
  formData: FormData,
): Promise<RestoreExpenseCategoryFormState> {
  const id = Number(formData.get("id"));

  const result = await restoreExpenseCategory(id);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  return {
    status: "success",
    message: result.message,
  };
}
