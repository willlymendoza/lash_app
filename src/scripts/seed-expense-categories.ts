import "../lib/env";

import { db } from "../db";
import { expenseCategories } from "../db/schema";

const SYSTEM_CATEGORIES = [
  { name: "Rent", isSystem: true },
  { name: "Electricity", isSystem: true },
  { name: "Water", isSystem: true },
  { name: "Internet", isSystem: true },
  { name: "Maintenance", isSystem: true },
  { name: "Cleaning", isSystem: true },
  { name: "Marketing", isSystem: true },
  { name: "Supplies", isSystem: true },
  { name: "Other", isSystem: true },
] as const;

export async function seedExpenseCategories() {
  for (const category of SYSTEM_CATEGORIES) {
    await db
      .insert(expenseCategories)
      .values({
        name: category.name,
        isSystem: category.isSystem,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: expenseCategories.name,
        set: {
          isSystem: category.isSystem,
          deletedAt: null,
          updatedAt: new Date(),
        },
      });
  }

  console.log(`Expense categories synchronized: ${SYSTEM_CATEGORIES.length}`);
}
