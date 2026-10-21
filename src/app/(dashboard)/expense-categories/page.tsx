import type { Metadata } from "next";

import {
  hasPermissions,
  requirePermission,
} from "@/modules/permissions/server/queries";
import { getExpenseCategories } from "@/modules/expense-categories/server/queries/get-expense-categories";
import { ExpenseCategoriesManagement } from "@/modules/expense-categories/components/expense-categories-management";

export const metadata: Metadata = {
  title: "Expense Categories",
};

export default async function ExpenseCategoriesPage() {
  await requirePermission("expense-categories.read");

  const permissions = await hasPermissions([
    "expense-categories.read",
    "expense-categories.create",
    "expense-categories.update",
    "expense-categories.remove",
    "expense-categories.restore",
    "expense-categories.toggle-active",
  ]);

  const expenseCategories = await getExpenseCategories(true, true);

  return (
    <ExpenseCategoriesManagement
      expenseCategories={expenseCategories}
      permissions={permissions}
    />
  );
}
