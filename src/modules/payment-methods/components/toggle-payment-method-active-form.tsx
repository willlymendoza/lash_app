"use client";

import { Power } from "lucide-react";

import { togglePaymentMethodActiveFromForm } from "@/modules/payment-methods/server/actions/toggle-payment-method-active";
import { useActionState } from "react";

type TogglePaymentMethodActiveFormProps = {
  paymentMethodId: number;
  isActive: boolean;
};

export function TogglePaymentMethodActiveForm({
  paymentMethodId,
  isActive,
}: TogglePaymentMethodActiveFormProps) {
  const [, toggleAction, isTogglePending] = useActionState(
    togglePaymentMethodActiveFromForm,
    {
      status: "idle",
      message: null,
    },
  );

  return (
    <form action={toggleAction}>
      <input type="hidden" name="id" value={paymentMethodId} />
      <button
        type="submit"
        disabled={isTogglePending}
        className="flex items-center gap-2 w-full px-2 py-2 text-sm text-ink-700 hover:bg-surface-100 cursor-pointer disabled:opacity-50"
      >
        <Power className="h-4 w-4" />
        {isTogglePending
          ? "Processing..."
          : isActive
            ? "Deactivate"
            : "Activate"}
      </button>
    </form>
  );
}
