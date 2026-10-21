"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { toast } from "sonner";

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
import { activateLashistFromForm } from "@/modules/lashists/server/actions";

type ActivateLashistAlertDialogProps = {
  lashistId: number;
  lashistName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ActivateLashistAlertDialog({
  lashistId,
  lashistName,
  open,
  onOpenChange,
}: ActivateLashistAlertDialogProps) {
  const [state, action, isPending] = useActionState(activateLashistFromForm, {
    status: "idle",
    message: null,
  });
  const hasShownSuccess = useRef(false);

  useEffect(() => {
    if (
      state.status === "success" &&
      state.message &&
      !hasShownSuccess.current
    ) {
      hasShownSuccess.current = true;
      toast.success(state.message, {
        richColors: true,
        duration: 2000,
        closeButton: true,
      });
      onOpenChange(false);
    }
    if (state.status === "idle") {
      hasShownSuccess.current = false;
    }
  }, [state.status, state.message, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-surface-0 border-ink-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-ink-900">
            Activate lash artist?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-ink-500">
            You are about to activate the lash artist profile for{" "}
            <span className="font-semibold">{lashistName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className="cursor-pointer border-ink-200 text-ink-700 hover:bg-surface-100"
          >
            Cancel
          </AlertDialogCancel>
          <form action={action}>
            <input type="hidden" name="id" value={lashistId} />
            <AlertDialogAction
              type="submit"
              disabled={isPending}
              className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isPending ? "Activating..." : "Activate"}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
