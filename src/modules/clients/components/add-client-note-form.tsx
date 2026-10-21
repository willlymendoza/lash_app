"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addClientNoteFromForm,
  type AddClientNoteFormState,
} from "@/modules/clients/server/actions/add-client-note";

const initialState: AddClientNoteFormState = {
  status: "idle",
  message: null,
};

type AddClientNoteFormProps = {
  clientId: number;
  onSuccess?: () => void;
};

export function AddClientNoteForm({
  clientId,
  onSuccess,
}: AddClientNoteFormProps) {
  const [state, action, isPending] = useActionState(
    addClientNoteFromForm,
    initialState,
  );
  const hasShownToast = useRef(false);

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

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="clientId" value={clientId} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          name="title"
          type="text"
          defaultValue={state.values?.title}
          placeholder="Note title"
          disabled={isPending}
        />
        {state.fieldErrors?.title && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.title[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          name="note"
          defaultValue={state.values?.note}
          placeholder="Write a note about the client..."
          rows={4}
          disabled={isPending}
        />
        {state.fieldErrors?.note && (
          <p className="text-sm text-destructive">
            {state.fieldErrors.note[0]}
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
          {isPending ? "Agregando..." : "Add note"}
        </Button>
      </div>
    </form>
  );
}
