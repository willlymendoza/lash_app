"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreateServiceForm } from "@/modules/services/components/create-service-form";

type CreateServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateServiceDialog({
  open,
  onOpenChange,
}: CreateServiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer bg-brand-600 hover:bg-brand-700 text-white">
          Create service
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-surface-0 border-ink-200">
        <DialogHeader>
          <DialogTitle className="text-ink-900">
            Create new service
          </DialogTitle>
          <DialogDescription className="text-ink-500">
            Complete the form to register a new service.
          </DialogDescription>
        </DialogHeader>
        <CreateServiceForm
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
