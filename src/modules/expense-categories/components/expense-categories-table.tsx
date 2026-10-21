"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExpenseCategoryActionsDropdown } from "@/modules/expense-categories/components/expense-categories-actions-dropdown";

type ExpenseCategoryRow = {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

type ExpenseCategoriesTableProps = {
  expenseCategories: ExpenseCategoryRow[];
  showDeleted: boolean;
  showInactive: boolean;
  permissions: Record<string, boolean>;
  onEdit: (
    expenseCategoryId: number,
    expenseCategory: ExpenseCategoryRow,
  ) => void;
};

export function ExpenseCategoriesTable({
  expenseCategories,
  showDeleted,
  showInactive,
  permissions,
  onEdit,
}: ExpenseCategoriesTableProps) {
  const canUpdate = permissions["expense-categories.update"] ?? false;
  const canRemove = permissions["expense-categories.remove"] ?? false;
  const canRestore = permissions["expense-categories.restore"] ?? false;
  const canToggleActive =
    permissions["expense-categories.toggle-active"] ?? false;

  if (expenseCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border border-ink-200 rounded-lg bg-surface-0">
        <p className="text-ink-500 text-sm">
          {showDeleted
            ? "No deleted expense categories"
            : showInactive
              ? "No inactive expense categories"
              : "No expense categories registered"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ink-200 bg-surface-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-50 border-b-ink-200 hover:bg-surface-50">
            <TableHead className="text-ink-700 font-semibold">Name</TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Description
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">
              System
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Active status
            </TableHead>
            <TableHead className="text-ink-700 font-semibold">Status</TableHead>
            <TableHead className="text-ink-700 font-semibold">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenseCategories.map((expenseCategory) => {
            const isDeleted = expenseCategory.deletedAt !== null;
            const isInactive = !expenseCategory.isActive;

            return (
              <TableRow
                key={expenseCategory.id}
                className="border-b-ink-200 hover:bg-surface-50 transition-colors"
              >
                <TableCell className="font-medium text-ink-900">
                  {expenseCategory.name}
                </TableCell>
                <TableCell className="text-ink-700">
                  {expenseCategory.description ? (
                    <span className="line-clamp-2">
                      {expenseCategory.description}
                    </span>
                  ) : (
                    <span className="text-ink-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {expenseCategory.isSystem ? (
                    <Badge className="bg-blue-50 text-blue-600 border-blue-50">
                      System
                    </Badge>
                  ) : (
                    <span className="text-ink-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isInactive ? "outline" : "secondary"}
                    className={
                      isInactive
                        ? "border-ink-200 text-ink-500"
                        : "bg-emerald-50 text-emerald-600 border-emerald-50"
                    }
                  >
                    {isInactive ? "Inactive" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={isDeleted ? "outline" : "secondary"}
                    className={
                      isDeleted
                        ? "border-ink-200 text-ink-500"
                        : "bg-emerald-50 text-emerald-600 border-emerald-50"
                    }
                  >
                    {isDeleted ? "Deleted" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ExpenseCategoryActionsDropdown
                    expenseCategoryId={expenseCategory.id}
                    expenseCategoryName={expenseCategory.name}
                    isDeleted={isDeleted}
                    isActive={expenseCategory.isActive}
                    isSystem={expenseCategory.isSystem}
                    canUpdate={canUpdate}
                    canRemove={canRemove}
                    canRestore={canRestore}
                    canToggleActive={canToggleActive}
                    onEdit={() => onEdit(expenseCategory.id, expenseCategory)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
