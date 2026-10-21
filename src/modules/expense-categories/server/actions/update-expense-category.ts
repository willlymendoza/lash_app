"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { expenseCategories } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import {
  updateExpenseCategorySchema,
  type UpdateExpenseCategoryInput,
} from "@/modules/expense-categories/schemas/expense-category.schema";

type UpdateExpenseCategoryFieldErrors = Partial<
  Record<keyof z.infer<typeof updateExpenseCategorySchema>, string[]>
>;

export type UpdateExpenseCategoryResult =
  | {
      ok: true;
      message: string;
      category: { id: number; name: string };
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: UpdateExpenseCategoryFieldErrors;
    };

export type UpdateExpenseCategoryFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: UpdateExpenseCategoryFieldErrors;
  values?: {
    name: string;
    description: string;
  };
};

export async function updateExpenseCategory(
  id: number,
  input: unknown,
): Promise<UpdateExpenseCategoryResult> {
  await requirePermission("expense-categories.update");

  const parsedInput = updateExpenseCategorySchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for updating the expense category.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as UpdateExpenseCategoryFieldErrors,
    };
  }

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
      message: "System categories cannot be edited.",
    };
  }

  const { name, description } = parsedInput.data;

  try {
    const [updatedCategory] = await db
      .update(expenseCategories)
      .set({
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description: description || null }),
        updatedByUserId: currentActiveUser.id,
        updatedAt: new Date(),
      })
      .where(eq(expenseCategories.id, id))
      .returning({
        id: expenseCategories.id,
        name: expenseCategories.name,
      });

    if (!updatedCategory) {
      return {
        ok: false,
        message: "Error updating the expense category.",
      };
    }

    return {
      ok: true,
      message: `Category "${name || existingCategory[0].name}" updated successfully.`,
      category: updatedCategory,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("duplicate key value")
    ) {
      return {
        ok: false,
        message: "A category with this name already exists.",
        fieldErrors: {
          name: ["A category with this name already exists."],
        },
      };
    }
    return {
      ok: false,
      message: "Error updating the expense category.",
    };
  }
}

export async function updateExpenseCategoryFromForm(
  id: number,
  _prevState: UpdateExpenseCategoryFormState,
  formData: FormData,
): Promise<UpdateExpenseCategoryFormState> {
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");

  const result = await updateExpenseCategory(id, {
    name,
    description,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        name,
        description,
      },
    };
  }

  revalidatePath("/expense-categories");

  return {
    status: "success",
    message: result.message,
  };
}
