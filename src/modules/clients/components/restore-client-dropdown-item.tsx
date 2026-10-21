"use client";

import { useActionState } from "react";
import { RefreshCw } from "lucide-react";

import { restoreClientFromForm } from "@/modules/clients/server/actions/restore-client";

type RestoreClientDropdownItemProps = {
  clientId: number;
};

export function RestoreClientDropdownItem({
  clientId,
}: RestoreClientDropdownItemProps) {
  const [state, action, isPending] = useActionState(restoreClientFromForm, {
    status: "idle",
    message: null,
  });

  return (
    <form action={action}>
      <input type="hidden" name="id" value={clientId} />
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 w-full px-2 py-2 text-sm text-emerald-600 hover:bg-emerald-50 cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className="h-4 w-4" />
        {isPending ? "Restoring..." : "Restore"}
      </button>
    </form>
  );
}
