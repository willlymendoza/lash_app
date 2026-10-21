"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { expenseCategories } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import {
  createExpenseCategorySchema,
  type CreateExpenseCategoryInput,
} from "@/modules/expense-categories/schemas/expense-category.schema";

type CreateExpenseCategoryFieldErrors = Partial<
  Record<keyof z.infer<typeof createExpenseCategorySchema>, string[]>
>;

export type CreateExpenseCategoryResult =
  | {
      ok: true;
      message: string;
      category: { id: number; name: string };
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: CreateExpenseCategoryFieldErrors;
    };

export type CreateExpenseCategoryFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: CreateExpenseCategoryFieldErrors;
  values?: {
    name: string;
    description: string;
  };
};

export async function createExpenseCategory(
  input: unknown,
): Promise<CreateExpenseCategoryResult> {
  await requirePermission("expense-categories.create");

  const parsedInput = createExpenseCategorySchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for creating the expense category.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as CreateExpenseCategoryFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { name, description } = parsedInput.data;

  try {
    const [newCategory] = await db
      .insert(expenseCategories)
      .values({
        name,
        description: description || null,
        isSystem: false,
        createdByUserId: currentActiveUser.id,
        updatedByUserId: currentActiveUser.id,
      })
      .returning({
        id: expenseCategories.id,
        name: expenseCategories.name,
      });

    if (!newCategory) {
      return { ok: false, message: "Error creating the expense category." };
    }

    return {
      ok: true,
      message: `Category "${name}" created successfully.`,
      category: newCategory,
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
      message: "Error creating the expense category.",
    };
  }
}

export async function createExpenseCategoryFromForm(
  _prevState: CreateExpenseCategoryFormState,
  formData: FormData,
): Promise<CreateExpenseCategoryFormState> {
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");

  const result = await createExpenseCategory({
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
