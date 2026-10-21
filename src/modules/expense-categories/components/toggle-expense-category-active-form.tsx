"use client";

import { Power } from "lucide-react";

import {
  toggleExpenseCategoryActiveFromForm,
  type ToggleExpenseCategoryActiveFormState,
} from "@/modules/expense-categories/server/actions/toggle-expense-category-active";
import { useActionState } from "react";

type ToggleExpenseCategoryActiveFormProps = {
  expenseCategoryId: number;
  isActive: boolean;
};

export function ToggleExpenseCategoryActiveForm({
  expenseCategoryId,
  isActive,
}: ToggleExpenseCategoryActiveFormProps) {
  const [toggleState, toggleAction, isTogglePending] = useActionState(
    (_prevState: ToggleExpenseCategoryActiveFormState, formData: FormData) =>
      toggleExpenseCategoryActiveFromForm(
        expenseCategoryId,
        _prevState,
        formData,
      ),
    {
      status: "idle",
      message: null,
    },
  );

  return (
    <form action={toggleAction}>
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
