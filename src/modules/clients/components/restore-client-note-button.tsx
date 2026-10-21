"use client";

import { useActionState } from "react";
import { RefreshCw } from "lucide-react";

import { restoreClientNoteFromForm } from "@/modules/clients/server/actions/restore-client-note";

type RestoreClientNoteButtonProps = {
  noteId: number;
  clientId: number;
};

export function RestoreClientNoteButton({
  noteId,
  clientId,
}: RestoreClientNoteButtonProps) {
  const [state, action, isPending] = useActionState(restoreClientNoteFromForm, {
    status: "idle",
    message: null,
  });

  return (
    <form action={action}>
      <input type="hidden" name="id" value={noteId} />
      <input type="hidden" name="clientId" value={clientId} />
      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-emerald-600 border border-emerald-200 rounded-md hover:bg-emerald-50 cursor-pointer disabled:opacity-50"
      >
        <RefreshCw className="h-4 w-4" />
        {isPending ? "Restoring..." : "Restore"}
      </button>
    </form>
  );
}
