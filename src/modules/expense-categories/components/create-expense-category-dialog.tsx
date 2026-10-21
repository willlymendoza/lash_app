"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateExpenseCategoryForm } from "@/modules/expense-categories/components/create-expense-category-form";

type CreateExpenseCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateExpenseCategoryDialog({
  open,
  onOpenChange,
}: CreateExpenseCategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-brand-600 hover:bg-brand-700 text-white">
          Create expense category
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-surface-0 border-ink-200">
        <DialogHeader>
          <DialogTitle className="text-ink-900">
            Create new expense category
          </DialogTitle>
          <DialogDescription className="text-ink-500">
            Complete the form to register a new expense category.
          </DialogDescription>
        </DialogHeader>
        <CreateExpenseCategoryForm onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
