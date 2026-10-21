"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  toggleUserActiveFromForm,
  type ToggleUserActiveFormState,
} from "@/modules/users/server/actions/toggle-user-active";

type ToggleUserActiveFormProps = {
  userId: number;
  isActive: boolean;
};

const initialState: ToggleUserActiveFormState = {
  status: "idle",
  message: null,
};

export function ToggleUserActiveForm({ userId, isActive }: ToggleUserActiveFormProps) {
  const [state, action, isPending] = useActionState(
    toggleUserActiveFromForm,
    initialState
  );

  return (
    <form action={action} className="flex flex-col gap-2">
      <input name="userId" type="hidden" value={userId} />
      <input name="nextIsActive" type="hidden" value={String(!isActive)} />
      <Button
        size="sm"
        type="submit"
        className="cursor-pointer"
        variant={isActive ? "destructive" : "secondary"}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isActive ? "Deactivate" : "Activate"}
      </Button>
      {state.status === "error" && state.message ? (
        <p className="text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}
