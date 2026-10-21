import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { expenseCategories } from "@/db/schema";

export async function getExpenseCategories(
  showDeleted: boolean = false,
  showInactive: boolean = false,
) {
  const whereClause = and(
    showDeleted ? undefined : isNull(expenseCategories.deletedAt),
    showInactive ? undefined : eq(expenseCategories.isActive, true),
  );

  const categoriesList = await db
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
    .where(whereClause)
    .orderBy(desc(expenseCategories.createdAt));

  return categoriesList;
}
