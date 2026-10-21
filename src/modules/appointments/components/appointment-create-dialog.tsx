"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateAppointmentForm } from "./create-appointment-form";
import type {
  AppointmentClientOption,
  AppointmentLashistOption,
  AppointmentPaymentMethodOption,
  AppointmentServiceOption,
} from "../types";

type AppointmentCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: AppointmentClientOption[];
  lashists: AppointmentLashistOption[];
  services: AppointmentServiceOption[];
  paymentMethods: AppointmentPaymentMethodOption[];
  canManageDeposit: boolean;
  initialDate?: Date;
  initialStartTime?: string;
  onSuccess: () => void;
};

export function AppointmentCreateDialog({
  open,
  onOpenChange,
  clients,
  lashists,
  services,
  paymentMethods,
  canManageDeposit,
  initialDate,
  initialStartTime,
  onSuccess,
}: AppointmentCreateDialogProps) {
  const formKey = `${open}-${initialDate instanceof Date ? initialDate.toISOString() : "no-date"}-${initialStartTime ?? "no-time"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New appointment</DialogTitle>
          <DialogDescription>
            Complete the form to create a new appointment.
          </DialogDescription>
        </DialogHeader>
        <CreateAppointmentForm
          key={formKey}
          clients={clients}
          lashists={lashists}
          services={services}
          paymentMethods={paymentMethods}
          canManageDeposit={canManageDeposit}
          initialDate={initialDate}
          initialStartTime={initialStartTime}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
