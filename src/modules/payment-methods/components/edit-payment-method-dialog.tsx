"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditPaymentMethodForm } from "@/modules/payment-methods/components/edit-payment-method-form";

type EditPaymentMethodDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethodId: number;
  initialData: {
    description: string | null;
    sortOrder: number | null;
  };
};

export function EditPaymentMethodDialog({
  open,
  onOpenChange,
  paymentMethodId,
  initialData,
}: EditPaymentMethodDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-0 border-ink-200">
        <DialogHeader>
          <DialogTitle className="text-ink-900">
            Edit payment method
          </DialogTitle>
          <DialogDescription className="text-ink-500">
            Update the selected payment method's details.
          </DialogDescription>
        </DialogHeader>
        <EditPaymentMethodForm
          paymentMethodId={paymentMethodId}
          initialData={initialData}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
