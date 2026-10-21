"use client";

import { appConfig } from "@/lib/app-config";
import { useEffect, useRef } from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { toast } from "sonner";
import {
  createServiceFromForm,
  type CreateServiceFormState,
} from "@/modules/services/server/actions/create-service";

const initialState: CreateServiceFormState = {
  status: "idle",
  message: null,
};

type CreateServiceFormProps = {
  onSuccess?: () => void;
};

export function CreateServiceForm({ onSuccess }: CreateServiceFormProps) {
  const [state, action, isPending] = useActionState(
    createServiceFromForm,
    initialState,
  );
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (state.status === "success" && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success(state.message || "Service created successfully", {
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

  return (
    <form action={action} className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.name}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={state.values?.name}
            placeholder="Classic lashes"
            disabled={isPending}
            aria-invalid={!!state.fieldErrors?.name}
          />
          <FieldError
            errors={state.fieldErrors?.name?.map((msg) => ({ message: msg }))}
          />
        </Field>

        <Field data-invalid={!!state.fieldErrors?.description}>
          <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
          <Textarea
            id="description"
            name="description"
            defaultValue={state.values?.description}
            placeholder="Service description"
            disabled={isPending}
            rows={3}
            aria-invalid={!!state.fieldErrors?.description}
          />
          <FieldError
            errors={state.fieldErrors?.description?.map((msg) => ({
              message: msg,
            }))}
          />
        </Field>

        <Field data-invalid={!!state.fieldErrors?.basePrice}>
          <FieldLabel htmlFor="basePrice">Base price ({appConfig.currencySymbol})</FieldLabel>
          <Input
            id="basePrice"
            name="basePrice"
            type="text"
            inputMode="decimal"
            step="0.01"
            defaultValue={state.values?.basePrice}
            placeholder="150.00"
            disabled={isPending}
            aria-invalid={!!state.fieldErrors?.basePrice}
          />
          <FieldError
            errors={state.fieldErrors?.basePrice?.map((msg) => ({
              message: msg,
            }))}
          />
        </Field>

        <Field data-invalid={!!state.fieldErrors?.estimatedDurationMinutes}>
          <FieldLabel htmlFor="estimatedDurationMinutes">
            Estimated duration in minutes
          </FieldLabel>
          <Input
            id="estimatedDurationMinutes"
            name="estimatedDurationMinutes"
            type="text"
            inputMode="decimal"
            defaultValue={state.values?.estimatedDurationMinutes}
            placeholder="60"
            disabled={isPending}
            aria-invalid={!!state.fieldErrors?.estimatedDurationMinutes}
          />
          <FieldError
            errors={state.fieldErrors?.estimatedDurationMinutes?.map((msg) => ({
              message: msg,
            }))}
          />
        </Field>
      </FieldGroup>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" className="cursor-pointer" disabled={isPending}>
          {isPending ? "Creating..." : "Create service"}
        </Button>
      </div>
    </form>
  );
}
