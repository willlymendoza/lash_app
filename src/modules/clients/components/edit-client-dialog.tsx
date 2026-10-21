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
import { EditClientForm } from "@/modules/clients/components/edit-client-form";

type EditClientDialogProps = {
  client: {
    id: number;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    address: string | null;
    instagram: string | null;
    email: string | null;
  };
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditClientDialog({
  client,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: EditClientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="bg-surface-0 border-ink-200">
        <DialogHeader>
          <DialogTitle className="text-ink-900">Edit client</DialogTitle>
          <DialogDescription className="text-ink-500">
            Update the selected client's information.
          </DialogDescription>
        </DialogHeader>
        <EditClientForm
          client={client}
          onSuccess={() => onOpenChange?.(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
