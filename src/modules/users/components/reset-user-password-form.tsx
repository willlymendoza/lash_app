"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  resetUserPasswordFromForm,
  type ResetUserPasswordFormState,
} from "@/modules/users/server/actions/reset-user-password";

type ResetUserPasswordFormProps = {
  userId: number;
  onCancel: () => void;
};

const initialState: ResetUserPasswordFormState = {
  status: "idle",
  message: null,
};

export function ResetUserPasswordForm({
  userId,
  onCancel,
}: ResetUserPasswordFormProps) {
  const [state, action, isPending] = useActionState(
    resetUserPasswordFromForm,
    initialState
  );

  return (
    <>
      {state.status === "success" && state.newPassword ? (
        <div className="rounded-md bg-muted p-4">
          <p className="font-semibold" aria-label="New password">New password:</p>
          <p className="font-mono text-lg" aria-label="Generated password">{state.newPassword}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Save this password and share it with the user.
          </p>
        </div>
      ) : null}

      {state.status === "error" && state.message ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      {state.status === "idle" ? (
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="userId" value={userId} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
            >
              {isPending ? "Generating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      ) : (
        <DialogFooter>
          <Button
            type="button"
            onClick={onCancel}
            className="cursor-pointer"
          >
            Close
          </Button>
        </DialogFooter>
      )}
    </>
  );
}
