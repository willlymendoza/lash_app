"use client";

import { Edit, MoreVertical, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleExpenseCategoryActiveForm } from "@/modules/expense-categories/components/toggle-expense-category-active-form";

type ExpenseCategoryActionsMenuProps = {
  expenseCategoryId: number;
  isActive: boolean;
  isSystem: boolean;
  canUpdate: boolean;
  canRemove: boolean;
  canToggleActive: boolean;
  onEdit?: () => void;
  onDeleteClick: () => void;
};

export function ExpenseCategoryActionsMenu({
  expenseCategoryId,
  isActive,
  isSystem,
  canUpdate,
  canRemove,
  canToggleActive,
  onEdit,
  onDeleteClick,
}: ExpenseCategoryActionsMenuProps) {
  const hasActions = canUpdate || canRemove || canToggleActive;

  if (!hasActions) {
    return null;
  }

  return (
    <DropdownMenu key={`dropdown-${expenseCategoryId}`}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 px-2 py-2 text-sm text-ink-700 hover:bg-surface-100 cursor-pointer"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-surface-0 border-ink-200">
        {canUpdate && !isSystem && (
          <DropdownMenuItem
            onSelect={() => {
              onEdit?.();
            }}
            className="cursor-pointer"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        {canToggleActive && (
          <DropdownMenuItem asChild>
            <ToggleExpenseCategoryActiveForm
              expenseCategoryId={expenseCategoryId}
              isActive={isActive}
            />
          </DropdownMenuItem>
        )}
        {canRemove && !isSystem && (
          <DropdownMenuItem
            onSelect={() => {
              onDeleteClick();
            }}
            className="cursor-pointer text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
