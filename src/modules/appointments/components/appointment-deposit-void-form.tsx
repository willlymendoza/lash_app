"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  voidAppointmentDepositFromForm,
  type VoidAppointmentDepositFormState,
} from "@/modules/deposits/server/actions/void-appointment-deposit";

const initialState: VoidAppointmentDepositFormState = {
  status: "idle",
  message: null,
};

type AppointmentDepositVoidFormProps = {
  depositId: number;
  canVoidDeposit: boolean;
  readOnly: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
};

export function AppointmentDepositVoidForm({
  depositId,
  canVoidDeposit,
  readOnly,
  onCancel,
  onSuccess,
}: AppointmentDepositVoidFormProps) {
  const [state, action, isPending] = useActionState(
    voidAppointmentDepositFromForm,
    initialState,
  );
  const hasShownToast = useRef(false);
  const [voidReason, setVoidReason] = useState(state.values?.voidReason || "");

  useEffect(() => {
    if (state.status === "success" && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success(state.message, {
        duration: 2200,
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
    <form action={action} className="space-y-2">
      <input type="hidden" name="depositId" value={depositId} />

      <Label htmlFor="depositVoidReason">
        Void reason <span className="text-red-500">*</span>
      </Label>
      <Textarea
        id="depositVoidReason"
        name="voidReason"
        placeholder="Explain why you are voiding the deposit..."
        rows={3}
        value={voidReason}
        disabled={!canVoidDeposit || readOnly}
        onChange={(event) => setVoidReason(event.target.value)}
      />
      {state.fieldErrors?.voidReason && (
        <p className="text-sm text-red-500">{state.fieldErrors.voidReason[0]}</p>
      )}

      {state.status === "error" && state.message && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        {canVoidDeposit && (
          <Button
            type="submit"
            variant="destructive"
            disabled={readOnly || isPending}
          >
            {isPending ? "Anulando..." : "Confirm void"}
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={readOnly || isPending}
        >
          Cancel void
        </Button>
      </div>
    </form>
  );
}
