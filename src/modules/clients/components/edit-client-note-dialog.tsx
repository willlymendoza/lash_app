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
import { EditClientNoteForm } from "@/modules/clients/components/edit-client-note-form";

type EditClientNoteDialogProps = {
  noteId: number;
  clientId: number;
  currentTitle: string | null;
  currentNote: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditClientNoteDialog({
  noteId,
  clientId,
  currentTitle,
  currentNote,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditClientNoteDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="bg-surface-0 border-ink-200">
        <DialogHeader>
          <DialogTitle className="text-ink-900">Edit note</DialogTitle>
          <DialogDescription className="text-ink-500">
            Edit the note on the client's profile.
          </DialogDescription>
        </DialogHeader>
        <EditClientNoteForm
          noteId={noteId}
          clientId={clientId}
          currentTitle={currentTitle}
          currentNote={currentNote}
          onSuccess={() => onOpenChange?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
