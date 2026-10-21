"use client";

import { useState } from "react";
import { useActionState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { removeClientFromForm } from "@/modules/clients/server/actions/remove-client";

type DeleteClientAlertDialogProps = {
  clientId: number;
  clientName: string;
  children: React.ReactNode;
};

export function DeleteClientAlertDialog({
  clientId,
  clientName,
  children,
}: DeleteClientAlertDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(removeClientFromForm, {
    status: "idle",
    message: null,
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="bg-surface-0 border-ink-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-ink-900">
            Delete client?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-ink-500">
            You are about to delete <strong>{clientName}</strong>. This action can be undone later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="cursor-pointer border-ink-200 text-ink-700 hover:bg-surface-100"
            disabled={isPending}
          >
            Cancel
          </AlertDialogCancel>
          <form action={action}>
            <input type="hidden" name="id" value={clientId} />
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
