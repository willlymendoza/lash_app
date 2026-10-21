"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditExpenseCategoryForm } from "@/modules/expense-categories/components/edit-expense-category-form";

type EditExpenseCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseCategoryId: number;
  initialData: {
    name: string;
    description: string | null;
  };
};

export function EditExpenseCategoryDialog({
  open,
  onOpenChange,
  expenseCategoryId,
  initialData,
}: EditExpenseCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-0 border-ink-200">
        <DialogHeader>
          <DialogTitle className="text-ink-900">
            Edit expense category
          </DialogTitle>
          <DialogDescription className="text-ink-500">
            Update the selected expense category's details.
          </DialogDescription>
        </DialogHeader>
        <EditExpenseCategoryForm
          expenseCategoryId={expenseCategoryId}
          initialData={initialData}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
