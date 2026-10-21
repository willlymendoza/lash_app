"use client";

import { Power } from "lucide-react";

import { toggleServiceActiveFromForm } from "@/modules/services/server/actions/toggle-service-active";
import { useActionState } from "react";

type ToggleServiceActiveFormProps = {
  serviceId: number;
  isActive: boolean;
};

export function ToggleServiceActiveForm({
  serviceId,
  isActive,
}: ToggleServiceActiveFormProps) {
  const [toggleState, toggleAction, isTogglePending] = useActionState(
    toggleServiceActiveFromForm,
    {
      status: "idle",
      message: null,
    },
  );

  return (
    <form action={toggleAction}>
      <input type="hidden" name="id" value={serviceId} />
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
