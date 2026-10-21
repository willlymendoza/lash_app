"use client";

import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { EditAppointmentForm } from "./edit-appointment-form";
import { AppointmentDepositPanel } from "./appointment-deposit-panel";
import { AppointmentStatusActionDialog } from "./appointment-status-action-dialog";
import { AppointmentStatusHistoryList } from "./appointment-status-history-list";
import { AppointmentReschedulesList } from "./appointment-reschedules-list";
import { changeAppointmentStatus } from "../server/actions/change-appointment-status";
import {
  getAppointmentStatusBadgeClass,
  getAppointmentStatusLabel,
} from "../constants/appointment-status";
import type {
  AppointmentClientOption,
  AppointmentLashistOption,
  AppointmentListItem,
  AppointmentPaymentMethodOption,
  AppointmentRescheduleEntry,
  AppointmentServiceOption,
  AppointmentStatusHistoryEntry,
} from "../types";

type AppointmentEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAppointment: AppointmentListItem | undefined;
  clients: AppointmentClientOption[];
  lashists: AppointmentLashistOption[];
  services: AppointmentServiceOption[];
  paymentMethods: AppointmentPaymentMethodOption[];
  canCreateDeposit: boolean;
  canVoidDeposit: boolean;
  canCancel: boolean;
  canNoShow: boolean;
  statusHistory: AppointmentStatusHistoryEntry[];
  reschedules: AppointmentRescheduleEntry[];
  readOnly: boolean;
  onAppointmentSuccess: () => void;
  onDepositSuccess: () => void;
};

export function AppointmentEditDialog({
  open,
  onOpenChange,
  selectedAppointment,
  clients,
  lashists,
  services,
  paymentMethods,
  canCreateDeposit,
  canVoidDeposit,
  canCancel,
  canNoShow,
  statusHistory,
  reschedules,
  readOnly,
  onAppointmentSuccess,
  onDepositSuccess,
}: AppointmentEditDialogProps) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pendingStatusAction, setPendingStatusAction] = useState<
    "cancelled" | "no_show" | null
  >(null);
  const [statusNote, setStatusNote] = useState("");
  const [statusError, setStatusError] = useState("");
  const [isStatusPending, setIsStatusPending] = useState(false);

  const openStatusDialog = (status: "cancelled" | "no_show") => {
    setPendingStatusAction(status);
    setStatusDialogOpen(true);
    setStatusNote("");
    setStatusError("");
  };

  const closeStatusDialog = (open: boolean) => {
    setStatusDialogOpen(open);
    if (!open) {
      setPendingStatusAction(null);
      setStatusNote("");
      setStatusError("");
      setIsStatusPending(false);
    }
  };

  const handleConfirmStatusAction = async () => {
    if (!pendingStatusAction || !selectedAppointment) {
      return;
    }

    if (!statusNote.trim()) {
      setStatusError("A note is required to change the appointment status.");
      return;
    }

    setStatusError("");
    setIsStatusPending(true);

    try {
      const result = await changeAppointmentStatus(selectedAppointment.id, {
        status: pendingStatusAction,
        note: statusNote,
      });

      if (!result.ok) {
        const noteError = result.fieldErrors?.note?.[0];
        setStatusError(noteError || result.message);
        setIsStatusPending(false);
        return;
      }

      toast.success(result.message, {
        duration: 2500,
        richColors: true,
        closeButton: true,
      });
      closeStatusDialog(false);
      onAppointmentSuccess();
    } catch {
      setStatusError("Could not change the appointment status.");
      setIsStatusPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{readOnly ? "View appointment" : "Edit appointment"}</DialogTitle>
          <DialogDescription>
            {readOnly
              ? "This appointment is cancelled or marked as a no-show, so its information is read-only."
              : "Update the appointment details."}
          </DialogDescription>

          {selectedAppointment && (
            <Badge
              className={getAppointmentStatusBadgeClass(
                selectedAppointment.status,
              )}
            >
              {getAppointmentStatusLabel(selectedAppointment.status)}
            </Badge>
          )}
        </DialogHeader>

        {selectedAppointment && (
          <div className="space-y-6 px-6 pb-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <EditAppointmentForm
                appointment={{
                  id: selectedAppointment.id,
                  clientId: selectedAppointment.clientId,
                  lashistUserId: selectedAppointment.lashistUserId,
                  serviceId: selectedAppointment.serviceId,
                  status: selectedAppointment.status,
                  appointmentDate: selectedAppointment.appointmentDate,
                  startTime: selectedAppointment.startTime,
                  endTime: selectedAppointment.endTime,
                  durationMinutes: selectedAppointment.durationMinutes,
                  notes: selectedAppointment.notes,
                  activeDeposit: selectedAppointment.activeDeposit
                    ? {
                        id: selectedAppointment.activeDeposit.id,
                        amount: selectedAppointment.activeDeposit.amount,
                        paymentMethodId:
                          selectedAppointment.activeDeposit.paymentMethodId,
                        referenceNumber:
                          selectedAppointment.activeDeposit.referenceNumber,
                        referenceDate:
                          selectedAppointment.activeDeposit.referenceDate,
                        bankName: selectedAppointment.activeDeposit.bankName,
                        accountHolderName:
                          selectedAppointment.activeDeposit.accountHolderName,
                        destinationAccountLastFour:
                          selectedAppointment.activeDeposit
                            .destinationAccountLastFour,
                        referenceNote:
                          selectedAppointment.activeDeposit.referenceNote,
                        paymentMethodNameSnapshot:
                          selectedAppointment.activeDeposit
                            .paymentMethodNameSnapshot,
                      }
                    : null,
                }}
                clients={clients}
                lashists={lashists}
                services={services}
                readOnly={readOnly}
                isStatusActionPending={isStatusPending}
                canCancel={canCancel}
                canNoShow={canNoShow}
                onRequestStatusAction={openStatusDialog}
                onSuccess={onAppointmentSuccess}
              />

              <AppointmentDepositPanel
                appointment={{
                  id: selectedAppointment.id,
                  clientId: selectedAppointment.clientId,
                  activeDeposit: selectedAppointment.activeDeposit
                    ? {
                        id: selectedAppointment.activeDeposit.id,
                        amount: selectedAppointment.activeDeposit.amount,
                        status: selectedAppointment.activeDeposit.status,
                        paymentMethodId:
                          selectedAppointment.activeDeposit.paymentMethodId,
                        referenceNumber:
                          selectedAppointment.activeDeposit.referenceNumber,
                        referenceDate:
                          selectedAppointment.activeDeposit.referenceDate,
                        bankName: selectedAppointment.activeDeposit.bankName,
                        accountHolderName:
                          selectedAppointment.activeDeposit.accountHolderName,
                        destinationAccountLastFour:
                          selectedAppointment.activeDeposit
                            .destinationAccountLastFour,
                        referenceNote:
                          selectedAppointment.activeDeposit.referenceNote,
                        paymentMethodNameSnapshot:
                          selectedAppointment.activeDeposit
                            .paymentMethodNameSnapshot,
                      }
                    : null,
                }}
                paymentMethods={paymentMethods.map((item) => ({
                  id: item.id,
                  code: item.code,
                  name: item.name,
                }))}
                canCreateDeposit={canCreateDeposit}
                canVoidDeposit={canVoidDeposit}
                readOnly={readOnly}
                onSuccess={onDepositSuccess}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold">Status change history</h3>
                <AppointmentStatusHistoryList history={statusHistory} />
              </div>
              <div>
                <h3 className="mb-3 font-semibold">Rescheduling history</h3>
                <AppointmentReschedulesList reschedules={reschedules} />
              </div>
            </div>
          </div>
        )}

        <AppointmentStatusActionDialog
          open={statusDialogOpen}
          pendingStatusAction={pendingStatusAction}
          statusNote={statusNote}
          statusError={statusError}
          isStatusPending={isStatusPending}
          onStatusNoteChange={setStatusNote}
          onOpenChange={closeStatusDialog}
          onCancel={() => closeStatusDialog(false)}
          onConfirm={handleConfirmStatusAction}
        />
      </DialogContent>
    </Dialog>
  );
}

