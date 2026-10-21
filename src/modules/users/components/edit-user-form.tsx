"use client";

import { useEffect, useActionState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  updateUserFromForm,
  type UpdateUserFormState,
} from "@/modules/users/server/actions/update-user";

type EditUserFormContentProps = {
  userId: number;
  email: string;
  fullName: string;
  phone: string | null;
  isLashist: boolean;
  onIsLashistChange: (checked: boolean) => void;
  onSuccess: () => void;
  canAssignLashist?: boolean;
};

const initialState: UpdateUserFormState = {
  status: "idle",
  message: null,
};

export function EditUserForm({
  userId,
  email,
  fullName,
  phone,
  isLashist,
  onIsLashistChange,
  onSuccess,
  canAssignLashist = false,
}: EditUserFormContentProps) {
  const [state, action, isPending] = useActionState(updateUserFromForm, initialState);
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (state.status === "success" && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success(state.message || "User updated successfully.", {
        richColors: true,
        duration: 2000,
        closeButton: true,
      });
      onSuccess();
    }
  }, [state.status, state.message, onSuccess]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="isLashist" value={isLashist.toString()} />

      <div className="flex flex-col gap-2">
        <Label htmlFor={`edit-user-email-${userId}`}>Email</Label>
        <Input
          id={`edit-user-email-${userId}`}
          name="email"
          type="email"
          defaultValue={email}
          required
          disabled={isPending}
        />
        {state.fieldErrors?.email?.length ? (
          <p className="text-sm text-destructive">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`edit-user-full-name-${userId}`}>Full name</Label>
        <Input
          id={`edit-user-full-name-${userId}`}
          name="fullName"
          defaultValue={fullName}
          required
          disabled={isPending}
        />
        {state.fieldErrors?.fullName?.length ? (
          <p className="text-sm text-destructive">{state.fieldErrors.fullName[0]}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`edit-user-phone-${userId}`}>Phone</Label>
        <Input
          id={`edit-user-phone-${userId}`}
          name="phone"
          defaultValue={phone ?? ""}
          placeholder="Optional"
          disabled={isPending}
        />
        {state.fieldErrors?.phone?.length ? (
          <p className="text-sm text-destructive">{state.fieldErrors.phone[0]}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id={`edit-user-is-lashist-${userId}`}
          checked={isLashist}
          onCheckedChange={onIsLashistChange}
          disabled={isPending || !canAssignLashist}
        />
        <Label htmlFor={`edit-user-is-lashist-${userId}`} className="cursor-pointer">
          Is Lash Artist
        </Label>
      </div>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" className="cursor-pointer" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
