"use server";

import { revalidatePath } from "next/cache";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { expenseCategories } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";

export type RemoveExpenseCategoryResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type RemoveExpenseCategoryFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function removeExpenseCategory(
  id: number,
): Promise<RemoveExpenseCategoryResult> {
  await requirePermission("expense-categories.remove");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const existingCategory = await db
    .select({
      isSystem: expenseCategories.isSystem,
      name: expenseCategories.name,
    })
    .from(expenseCategories)
    .where(eq(expenseCategories.id, id))
    .limit(1);

  if (!existingCategory[0]) {
    return { ok: false, message: "Expense category not found." };
  }

  if (existingCategory[0].isSystem) {
    return {
      ok: false,
      message: "System categories cannot be deleted.",
    };
  }

  const [deletedCategory] = await db
    .update(expenseCategories)
    .set({
      deletedAt: new Date(),
      deletedByUserId: currentActiveUser.id,
      updatedAt: new Date(),
    })
    .where(eq(expenseCategories.id, id))
    .returning({ name: expenseCategories.name });

  if (!deletedCategory) {
    return { ok: false, message: "Error deleting the expense category." };
  }

  revalidatePath("/expense-categories");

  return {
    ok: true,
    message: `Category "${deletedCategory.name}" deleted successfully.`,
  };
}

export async function removeExpenseCategoryFromForm(
  _prevState: RemoveExpenseCategoryFormState,
  formData: FormData,
): Promise<RemoveExpenseCategoryFormState> {
  const id = Number(formData.get("id"));

  const result = await removeExpenseCategory(id);

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
