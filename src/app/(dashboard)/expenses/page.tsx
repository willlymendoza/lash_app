import type { Metadata } from "next";
import { requirePermission } from "@/modules/permissions/server/queries";

export const metadata: Metadata = {
  title: "Expenses",
};

export default async function ExpensesPage() {
  await requirePermission("expenses.read");

  return <div>Expenses</div>;
}
