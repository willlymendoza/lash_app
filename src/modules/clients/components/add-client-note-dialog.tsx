"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddClientNoteForm } from "@/modules/clients/components/add-client-note-form";

type AddClientNoteDialogProps = {
  clientId: number;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function AddClientNoteDialog({
  clientId,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddClientNoteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="bg-surface-0 border-ink-200">
        <DialogHeader>
          <DialogTitle className="text-ink-900">Add note</DialogTitle>
          <DialogDescription className="text-ink-500">
            Add a new note to the client's profile.
          </DialogDescription>
        </DialogHeader>
        <AddClientNoteForm
          clientId={clientId}
          onSuccess={() => onOpenChange?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
