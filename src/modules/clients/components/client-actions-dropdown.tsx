"use client";

import { useState } from "react";
import { Trash2, RefreshCw } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { removeClientFromForm } from "@/modules/clients/server/actions/remove-client";
import { restoreClientFromForm } from "@/modules/clients/server/actions/restore-client";
import { useActionState } from "react";

type ClientActionsDropdownProps = {
  clientId: number;
  clientName: string;
  isDeleted: boolean;
};

export function ClientActionsDropdown({
  clientId,
  clientName,
  isDeleted,
}: ClientActionsDropdownProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  
  const [deleteState, deleteAction, isDeletePending] = useActionState(removeClientFromForm, {
    status: "idle",
    message: null,
  });
  
  const [restoreState, restoreAction, isRestorePending] = useActionState(restoreClientFromForm, {
    status: "idle",
    message: null,
  });

  if (isDeleted) {
    return (
      <>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsRestoreDialogOpen(true);
          }}
          disabled={isRestorePending}
          className="flex items-center gap-2 w-full px-2 py-2 text-sm text-emerald-600 hover:bg-emerald-50 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          {isRestorePending ? "Restoring..." : "Restore"}
        </button>
        
        <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
          <AlertDialogContent className="bg-surface-0 border-ink-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-ink-900">
                Restore client?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-ink-500">
                You are about to restore <strong>{clientName}</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="cursor-pointer border-ink-200 text-ink-700 hover:bg-surface-100"
              >
                Cancel
              </AlertDialogCancel>
              <form action={restoreAction}>
                <input type="hidden" name="id" value={clientId} />
                <AlertDialogAction
                  type="submit"
                  className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={isRestorePending}
                >
                  {isRestorePending ? "Restoring..." : "Restore"}
                </AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDeleteDialogOpen(true);
        }}
        className="flex items-center gap-2 w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-surface-0 border-ink-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ink-900">
              Delete client?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-ink-500">
              You are about to delete <strong>{clientName}</strong>. This action can be undone later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer border-ink-200 text-ink-700 hover:bg-surface-100"
            >
              Cancel
            </AlertDialogCancel>
            <form action={deleteAction}>
              <input type="hidden" name="id" value={clientId} />
              <AlertDialogAction
                type="submit"
                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeletePending}
              >
                {isDeletePending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
