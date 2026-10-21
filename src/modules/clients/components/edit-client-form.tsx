"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import {
  updateClientFromForm,
  type UpdateClientFormState,
} from "@/modules/clients/server/actions/update-client";

const initialState: UpdateClientFormState = {
  status: "idle",
  message: null,
};

type EditClientFormProps = {
  client: {
    id: number;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    address: string | null;
    instagram: string | null;
    email: string | null;
    birthDate: Date | null;
  };
  onSuccess?: () => void;
};

export function EditClientForm({ client, onSuccess }: EditClientFormProps) {
  const [state, action, isPending] = useActionState(
    updateClientFromForm,
    initialState,
  );
  const hasShownToast = useRef(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    state.values?.birthDate ? new Date(state.values.birthDate) : (client.birthDate ? new Date(client.birthDate) : undefined)
  );

  useEffect(() => {
    if (state.status === "success" && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success(state.message, {
        richColors: true,
        duration: 2000,
        closeButton: true,
      });
      if (onSuccess) {
        onSuccess();
      }
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
      <input type="hidden" name="id" value={client.id} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="firstName">Name</Label>
        <Input
          id="firstName"
          name="firstName"
          type="text"
          defaultValue={state.values?.firstName ?? client.firstName}
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
          defaultValue={state.values?.lastName ?? client.lastName ?? ""}
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
          defaultValue={state.values?.phone ?? client.phone ?? ""}
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
          defaultValue={state.values?.email ?? client.email ?? ""}
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
          defaultValue={state.values?.address ?? client.address ?? ""}
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
          defaultValue={state.values?.instagram ?? client.instagram ?? ""}
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

      <div className="flex justify-end gap-2">
        {onSuccess && (
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isPending}
            className="cursor-pointer"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className="cursor-pointer bg-brand-600 hover:bg-brand-700 text-white"
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
