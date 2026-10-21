"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { toast } from "sonner";
import {
  createClientFromForm,
  type CreateClientFormState,
} from "@/modules/clients/server/actions/create-client";

const initialState: CreateClientFormState = {
  status: "idle",
  message: null,
};

type CreateClientFormProps = {
  onSuccess?: () => void;
};

export function CreateClientForm({ onSuccess }: CreateClientFormProps) {
  const [state, action, isPending] = useActionState(
    createClientFromForm,
    initialState,
  );
  const hasShownToast = useRef(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    state.values?.birthDate ? new Date(state.values.birthDate) : undefined
  );

  useEffect(() => {
    if (state.status === "success" && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success(state.message || "Client created successfully", {
        duration: 2000,
        richColors: true,
        closeButton: true,
      });
      onSuccess?.();
    }
    if (state.status === "idle") {
      hasShownToast.current = false;
    }
  }, [state.status, state.message, onSuccess]);

  const handleSubmit = (formData: FormData) => {
    if (birthDate) {
      formData.set("birthDate", birthDate.toISOString().split('T')[0]);
    } else {
      formData.set("birthDate", "");
    }
    action(formData);
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="firstName">Name</Label>
        <Input
          id="firstName"
          name="firstName"
          type="text"
          defaultValue={state.values?.firstName}
          placeholder="John"
          disabled={isPending}
        />
        {state.fieldErrors?.firstName && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.firstName[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="lastName">Last name (optional)</Label>
        <Input
          id="lastName"
          name="lastName"
          type="text"
          defaultValue={state.values?.lastName}
          placeholder="Smith"
          disabled={isPending}
        />
        {state.fieldErrors?.lastName && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.lastName[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={state.values?.phone}
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          name="email"
          defaultValue={state.values?.email}
          placeholder="cliente@ejemplo.com"
          disabled={isPending}
        />
        {state.fieldErrors?.email && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Address (optional)</Label>
        <Input
          id="address"
          name="address"
          type="text"
          defaultValue={state.values?.address}
          placeholder="123 Main Street"
          disabled={isPending}
        />
        {state.fieldErrors?.address && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.address[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="instagram">Instagram (opcional)</Label>
        <Input
          id="instagram"
          name="instagram"
          type="text"
          defaultValue={state.values?.instagram}
          placeholder="@usuario"
          disabled={isPending}
        />
        {state.fieldErrors?.instagram && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.instagram[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="birthDate">Date of birth (optional)</Label>
        <DatePicker
          value={birthDate}
          onChange={setBirthDate}
          disabled={isPending}
          placeholder="Select date of birth"
        />
        {state.fieldErrors?.birthDate && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.birthDate[0]}
          </p>
        )}
      </div>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" className="cursor-pointer" disabled={isPending}>
          {isPending ? "Creating..." : "Create client"}
        </Button>
      </div>
    </form>
  );
}
