"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  toggleRoleActiveFromForm,
  type ToggleRoleActiveFormState,
} from "@/modules/roles/server/actions/toggle-role-active";

type ToggleRoleFormProps = {
  roleId: number;
  isActive: boolean;
};

const initialState: ToggleRoleActiveFormState = {
  status: "idle",
  message: null,
};

export function ToggleRoleForm({ roleId, isActive }: ToggleRoleFormProps) {
  const [state, action, isPending] = useActionState(
    toggleRoleActiveFromForm,
    initialState
  );

  return (
    <form action={action} className="flex flex-col gap-2">
      <input name="roleId" type="hidden" value={roleId} />
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
