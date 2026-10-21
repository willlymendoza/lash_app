"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { removeExpenseCategoryFromForm } from "@/modules/expense-categories/server/actions/remove-expense-category";
import { useActionState } from "react";

type DeleteExpenseCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseCategoryId: number;
  expenseCategoryName: string;
};

export function DeleteExpenseCategoryDialog({
  open,
  onOpenChange,
  expenseCategoryId,
  expenseCategoryName,
}: DeleteExpenseCategoryDialogProps) {
  const [state, action, isPending] = useActionState(
    removeExpenseCategoryFromForm,
    {
      status: "idle",
      message: null,
    },
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-surface-0 border-ink-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-ink-900">
            Delete expense category?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-ink-500">
            You are about to delete <strong>{expenseCategoryName}</strong>. This action can be undone later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer border-ink-200 text-ink-700 hover:bg-surface-100">
            Cancel
          </AlertDialogCancel>
          <form action={action}>
            <input type="hidden" name="id" value={expenseCategoryId} />
            <AlertDialogAction
              type="submit"
              className="cursor-pointer bg-red-600 hover:bg-red-700 text-white"
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
