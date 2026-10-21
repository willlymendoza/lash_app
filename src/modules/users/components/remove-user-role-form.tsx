"use client";

import { useActionState } from "react";
import { Loader2Icon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  removeUserRoleFromForm,
  type RemoveUserRoleFormState,
} from "@/modules/users/server/actions/remove-user-role";

type RemoveUserRoleFormProps = {
  userId: number;
  roleId: number;
};

const initialState: RemoveUserRoleFormState = {
  status: "idle",
  message: null,
};

export function RemoveUserRoleForm({ userId, roleId }: RemoveUserRoleFormProps) {
  const [state, action, isPending] = useActionState(
    removeUserRoleFromForm,
    initialState
  );

  return (
    <form action={action} className="flex flex-col gap-1">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="roleId" value={roleId} />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        aria-label="Remove role"
        title="Remove role"
        className="h-5 px-1 text-[11px] leading-none text-muted-foreground hover:text-destructive"
        disabled={isPending}
      >
        {isPending ? <Loader2Icon className="animate-spin" /> : <XIcon />}
      </Button>
      {state.status === "error" && state.message ? (
        <p className="text-[10px] text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}
