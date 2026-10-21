"use client";

import { useState } from "react";

import { DeleteExpenseCategoryDialog } from "@/modules/expense-categories/components/delete-expense-category-dialog";
import { RestoreExpenseCategoryDialog } from "@/modules/expense-categories/components/restore-expense-category-dialog";
import { ExpenseCategoryActionsMenu } from "@/modules/expense-categories/components/expense-categories-actions-menu";

type ExpenseCategoryActionsDropdownProps = {
  expenseCategoryId: number;
  expenseCategoryName: string;
  isDeleted: boolean;
  isActive: boolean;
  isSystem: boolean;
  canUpdate: boolean;
  canRemove: boolean;
  canRestore: boolean;
  canToggleActive: boolean;
  onEdit?: () => void;
};

export function ExpenseCategoryActionsDropdown({
  expenseCategoryId,
  expenseCategoryName,
  isDeleted,
  isActive,
  isSystem,
  canUpdate,
  canRemove,
  canRestore,
  canToggleActive,
  onEdit,
}: ExpenseCategoryActionsDropdownProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);

  if (isDeleted) {
    return (
      <>
        {canRestore && (
          <>
            <button
              type="button"
              onClick={() => {
                setIsRestoreDialogOpen(true);
              }}
              className="flex items-center gap-2 w-full px-2 py-2 text-sm text-emerald-600 hover:bg-emerald-50 cursor-pointer"
            >
              Restore
            </button>
            <RestoreExpenseCategoryDialog
              open={isRestoreDialogOpen}
              onOpenChange={setIsRestoreDialogOpen}
              expenseCategoryId={expenseCategoryId}
              expenseCategoryName={expenseCategoryName}
            />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <ExpenseCategoryActionsMenu
        expenseCategoryId={expenseCategoryId}
        isActive={isActive}
        isSystem={isSystem}
        canUpdate={canUpdate}
        canRemove={canRemove}
        canToggleActive={canToggleActive}
        onEdit={onEdit}
        onDeleteClick={() => setIsDeleteDialogOpen(true)}
      />

      <DeleteExpenseCategoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        expenseCategoryId={expenseCategoryId}
        expenseCategoryName={expenseCategoryName}
      />
    </>
  );
}
