"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createRoleFromForm,
  type CreateRoleFormState,
} from "@/modules/roles/server/actions/create-role";

const initialState: CreateRoleFormState = {
  status: "idle",
  message: null,
};

export function CreateRoleForm() {
  const [state, action, isPending] = useActionState(createRoleFromForm, initialState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create role</CardTitle>
        <CardDescription>
          Create an operational role and assign permissions for the business workflow.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Role name</Label>
            <Input id="name" name="name" placeholder="e.g. Reception" required />
            {state.fieldErrors?.name?.length ? (
              <p className="text-sm text-destructive">{state.fieldErrors.name[0]}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Optional" />
            {state.fieldErrors?.description?.length ? (
              <p className="text-sm text-destructive">
                {state.fieldErrors.description[0]}
              </p>
            ) : null}
          </div>
          {state.message ? (
            <p
              className={`text-sm md:col-span-2 ${
                state.status === "success" ? "text-green-600" : "text-destructive"
              }`}
            >
              {state.message}
            </p>
          ) : null}
          <div className="md:col-span-2">
            <Button type="submit" className="cursor-pointer" disabled={isPending}>
              {isPending ? "Creating..." : "Create role"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
