import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { expenseCategories } from "@/db/schema";

export async function getExpenseCategoryById(id: number) {
  const category = await db
    .select({
      id: expenseCategories.id,
      name: expenseCategories.name,
      description: expenseCategories.description,
      isSystem: expenseCategories.isSystem,
      isActive: expenseCategories.isActive,
      createdAt: expenseCategories.createdAt,
      updatedAt: expenseCategories.updatedAt,
      deletedAt: expenseCategories.deletedAt,
    })
    .from(expenseCategories)
    .where(eq(expenseCategories.id, id))
    .limit(1);

  return category[0] || null;
}
