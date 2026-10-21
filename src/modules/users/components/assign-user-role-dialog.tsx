"use client";

import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  assignUserRoleFromForm,
  type AssignUserRoleFormState,
} from "@/modules/users/server/actions/assign-user-role";

type AssignableRole = {
  id: number;
  code: string;
  name: string;
  isSystem: boolean;
  isActive: boolean;
};

type AssignUserRoleDialogProps = {
  userId: number;
  fullName: string;
  assignedRoleIds: number[];
  assignableRoles: AssignableRole[];
  currentUserId?: number;
};

const initialState: AssignUserRoleFormState = {
  status: "idle",
  message: null,
};

export function AssignUserRoleDialog({
  userId,
  fullName,
  assignedRoleIds,
  assignableRoles,
  currentUserId,
}: AssignUserRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(
    assignUserRoleFromForm,
    initialState
  );

  const assignedRoleSet = new Set(assignedRoleIds);
  const availableRoles = assignableRoles.filter(
    (role) => !assignedRoleSet.has(role.id)
  );

  // Prevent users from assigning roles to themselves
  const isSelfAssignment = currentUserId && userId === currentUserId;

  useEffect(() => {
    if (!isPending && state.status === "success") {
      setOpen(false);
    }
  }, [isPending, state.status]);

  if (availableRoles.length === 0) {
    return <span className="text-xs text-muted-foreground">All assigned</span>;
  }

  if (isSelfAssignment) {
    return <span className="text-xs text-muted-foreground">Not available</span>;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" type="button" className="cursor-pointer">
          Assign role
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign role</DialogTitle>
          <DialogDescription>
            Select a role to assign to {fullName}.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          <input name="userId" type="hidden" value={userId} />
          <select
            name="roleId"
            defaultValue=""
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            disabled={isPending}
            required
          >
            <option value="" disabled>
              Select role
            </option>
            {availableRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          {state.status === "error" && state.message ? (
            <p className="text-sm text-destructive">{state.message}</p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" className="cursor-pointer" disabled={isPending}>
              {isPending ? "Assigning..." : "Confirm assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
