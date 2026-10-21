"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateRoleFromForm,
  type UpdateRoleFormState,
} from "@/modules/roles/server/actions/update-role";

type EditRoleFormProps = {
  roleId: number;
  name: string;
  description: string | null;
  disabled?: boolean;
};

const initialState: UpdateRoleFormState = {
  status: "idle",
  message: null,
};

export function EditRoleForm({
  roleId,
  name,
  description,
  disabled = false,
}: EditRoleFormProps) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(updateRoleFromForm, initialState);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Role updated successfully.", {
        duration: 2000,
        closeButton: true,
        richColors: true,
      });
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="cursor-pointer"
          disabled={disabled}
        >
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit role</DialogTitle>
          <DialogDescription>
            Update the selected role's name and description.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <input type="hidden" name="roleId" value={roleId} />

          <div className="space-y-2">
            <Label htmlFor={`edit-role-name-${roleId}`}>Role name</Label>
            <Input
              id={`edit-role-name-${roleId}`}
              name="name"
              defaultValue={name}
              required
            />
            {state.fieldErrors?.name?.length ? (
              <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit-role-description-${roleId}`}>Description</Label>
            <Input
              id={`edit-role-description-${roleId}`}
              name="description"
              defaultValue={description ?? ""}
              placeholder="Optional"
            />
            {state.fieldErrors?.description?.length ? (
              <p className="text-sm text-destructive">
                {state.fieldErrors.description[0]}
              </p>
            ) : null}
          </div>

          {state.message && state.status === "error" ? (
            <p
              className="text-sm text-destructive"
            >
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" className="cursor-pointer" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
