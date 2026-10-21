"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditServiceForm } from "@/modules/services/components/edit-service-form";

type EditServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: number;
  initialData: {
    name: string;
    description: string | null;
    basePrice: string;
    estimatedDurationMinutes: number | null;
  };
};

export function EditServiceDialog({
  open,
  onOpenChange,
  serviceId,
  initialData,
}: EditServiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-0 border-ink-200">
        <DialogHeader>
          <DialogTitle className="text-ink-900">Edit service</DialogTitle>
          <DialogDescription className="text-ink-500">
            Update the selected service's details.
          </DialogDescription>
        </DialogHeader>
        <EditServiceForm
          serviceId={serviceId}
          initialData={initialData}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
