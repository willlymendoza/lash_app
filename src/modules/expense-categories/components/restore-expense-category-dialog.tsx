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
import { restoreExpenseCategoryFromForm } from "@/modules/expense-categories/server/actions/restore-expense-category";
import { useActionState } from "react";

type RestoreExpenseCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseCategoryId: number;
  expenseCategoryName: string;
};

export function RestoreExpenseCategoryDialog({
  open,
  onOpenChange,
  expenseCategoryId,
  expenseCategoryName,
}: RestoreExpenseCategoryDialogProps) {
  const [state, action, isPending] = useActionState(
    restoreExpenseCategoryFromForm,
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
            Restore expense category?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-ink-500">
            You are about to restore <strong>{expenseCategoryName}</strong>.
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
              className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isPending}
            >
              {isPending ? "Restoring..." : "Restore"}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
