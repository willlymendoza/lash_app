"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  createUserFromForm,
  type CreateUserFormState,
} from "@/modules/users/server/actions/create-user";

const initialState: CreateUserFormState = {
  status: "idle",
  message: null,
};

type CreateUserFormProps = {
  canAssignLashist?: boolean;
};

export function CreateUserForm({ canAssignLashist = false }: CreateUserFormProps) {
  const [state, action, isPending] = useActionState(
    createUserFromForm,
    initialState,
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          placeholder="user@example.com"
          disabled={isPending}
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="John Smith"
          disabled={isPending}
        />
        {state.fieldErrors?.fullName && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.fullName[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="12345678"
          maxLength={8}
          disabled={isPending}
        />
        {state.fieldErrors?.phone && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.phone[0]}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Switch id="isLashist" name="isLashist" disabled={isPending || !canAssignLashist} />
        <Label htmlFor="isLashist" className="cursor-pointer">
          Is Lash Artist
        </Label>
      </div>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      {state.status === "success" && state.message ? (
        <p className="text-sm text-green-600">{state.message}</p>
      ) : null}

      {state.status === "success" && state.initialPassword ? (
        <div className="rounded-md bg-muted p-3 text-sm">
          <p className="font-semibold" aria-label="Initial password">
            Initial password:
          </p>
          <p className="font-mono" aria-label="Generated password">
            {state.initialPassword}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Save this password. The user must change it on their first sign-in.
          </p>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button
          type="submit"
          className="cursor-pointer"
          disabled={isPending}
        >
          {isPending ? "Creating..." : "Create user"}
        </Button>
      </div>
    </form>
  );
}
