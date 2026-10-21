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
import { restoreServiceFromForm } from "@/modules/services/server/actions/restore-service";
import { useActionState } from "react";

type RestoreServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: number;
  serviceName: string;
};

export function RestoreServiceDialog({
  open,
  onOpenChange,
  serviceId,
  serviceName,
}: RestoreServiceDialogProps) {
  const [state, action, isPending] = useActionState(restoreServiceFromForm, {
    status: "idle",
    message: null,
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-surface-0 border-ink-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-ink-900">
            Restore service?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-ink-500">
            You are about to restore <strong>{serviceName}</strong>.
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
