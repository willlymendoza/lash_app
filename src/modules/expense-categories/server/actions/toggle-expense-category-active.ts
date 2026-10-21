"use server";

import { revalidatePath } from "next/cache";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { expenseCategories } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";

export type ToggleExpenseCategoryActiveResult =
  | { ok: true; message: string; isActive: boolean }
  | { ok: false; message: string };

export type ToggleExpenseCategoryActiveFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function toggleExpenseCategoryActive(
  id: number,
): Promise<ToggleExpenseCategoryActiveResult> {
  await requirePermission("expense-categories.toggle-active");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const existingCategory = await db
    .select({
      isActive: expenseCategories.isActive,
      name: expenseCategories.name,
    })
    .from(expenseCategories)
    .where(eq(expenseCategories.id, id))
    .limit(1);

  if (!existingCategory[0]) {
    return { ok: false, message: "Expense category not found." };
  }

  const newStatus = !existingCategory[0].isActive;

  const [updatedCategory] = await db
    .update(expenseCategories)
    .set({
      isActive: newStatus,
      updatedByUserId: currentActiveUser.id,
      updatedAt: new Date(),
    })
    .where(eq(expenseCategories.id, id))
    .returning({ isActive: expenseCategories.isActive });

  if (!updatedCategory) {
    return {
      ok: false,
      message: "Error updating the expense category status.",
    };
  }

  revalidatePath("/expense-categories");

  return {
    ok: true,
    message: `Category "${existingCategory[0].name}" ${newStatus ? "activated" : "deactivated"} successfully.`,
    isActive: updatedCategory.isActive,
  };
}

export async function toggleExpenseCategoryActiveFromForm(
  id: number,
  _prevState: ToggleExpenseCategoryActiveFormState,
  _formData: FormData,
): Promise<ToggleExpenseCategoryActiveFormState> {
  const result = await toggleExpenseCategoryActive(id);

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
