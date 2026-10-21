"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type UpdatePaymentMethodFormState,
  updatePaymentMethodFromForm,
} from "@/modules/payment-methods/server/actions/update-payment-method";
import { toast } from "sonner";

const initialState: UpdatePaymentMethodFormState = {
  status: "idle",
  message: null,
};

type EditPaymentMethodFormProps = {
  paymentMethodId: number;
  initialData: {
    description: string | null;
    sortOrder: number | null;
  };
  onSuccess?: () => void;
};

export function EditPaymentMethodForm({
  paymentMethodId,
  initialData,
  onSuccess,
}: EditPaymentMethodFormProps) {
  const [state, action, isPending] = useActionState(
    updatePaymentMethodFromForm,
    initialState,
  );
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (state.status === "success" && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success(state.message || "Payment method updated successfully", {
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
      <input type="hidden" name="id" value={paymentMethodId} />

      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.description}>
          <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
          <Textarea
            id="description"
            name="description"
            defaultValue={
              state.values?.description ?? initialData.description ?? ""
            }
            placeholder="Payment method description"
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

        <Field data-invalid={!!state.fieldErrors?.sortOrder}>
          <FieldLabel htmlFor="sortOrder">Order (optional)</FieldLabel>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="text"
            inputMode="decimal"
            defaultValue={
              state.values?.sortOrder ?? initialData.sortOrder?.toString() ?? ""
            }
            placeholder="1"
            disabled={isPending}
            aria-invalid={!!state.fieldErrors?.sortOrder}
          />
          <FieldError
            errors={state.fieldErrors?.sortOrder?.map((msg) => ({
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
          {isPending ? "Actualizando..." : "Update payment method"}
        </Button>
      </div>
    </form>
  );
}
