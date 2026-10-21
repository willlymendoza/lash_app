"use client";

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
  updateExpenseCategoryFromForm,
  type UpdateExpenseCategoryFormState,
} from "@/modules/expense-categories/server/actions/update-expense-category";

const initialState: UpdateExpenseCategoryFormState = {
  status: "idle",
  message: null,
};

type EditExpenseCategoryFormProps = {
  expenseCategoryId: number;
  initialData: {
    name: string;
    description: string | null;
  };
  onSuccess?: () => void;
};

export function EditExpenseCategoryForm({
  expenseCategoryId,
  initialData,
  onSuccess,
}: EditExpenseCategoryFormProps) {
  const [state, action, isPending] = useActionState(
    (_prevState: UpdateExpenseCategoryFormState, formData: FormData) =>
      updateExpenseCategoryFromForm(expenseCategoryId, initialState, formData),
    initialState,
  );
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (state.status === "success" && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success(
        state.message || "Expense category updated successfully",
        {
          duration: 2000,
          richColors: true,
          closeButton: true,
        },
      );
      onSuccess?.();
    }
    if (state.status === "idle") {
      hasShownToast.current = false;
    }
  }, [state.status, state.message, onSuccess]);

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="id" value={expenseCategoryId} />

      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.name}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={state.values?.name ?? initialData.name}
            placeholder="Rent"
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
            defaultValue={
              state.values?.description ?? initialData.description ?? ""
            }
            placeholder="Expense category description"
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
      </FieldGroup>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" className="cursor-pointer" disabled={isPending}>
          {isPending ? "Actualizando..." : "Update expense category"}
        </Button>
      </div>
    </form>
  );
}
