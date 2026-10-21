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
import { removeServiceFromForm } from "@/modules/services/server/actions/remove-service";
import { useActionState } from "react";

type DeleteServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: number;
  serviceName: string;
};

export function DeleteServiceDialog({
  open,
  onOpenChange,
  serviceId,
  serviceName,
}: DeleteServiceDialogProps) {
  const [state, action, isPending] = useActionState(removeServiceFromForm, {
    status: "idle",
    message: null,
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-surface-0 border-ink-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-ink-900">
            Delete service?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-ink-500">
            You are about to delete <strong>{serviceName}</strong>. This action can be undone later.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer border-ink-200 text-ink-700 hover:bg-surface-100">
            Cancel
          </AlertDialogCancel>
          <form action={action}>
            <input type="hidden" name="id" value={serviceId} />
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
