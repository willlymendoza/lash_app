"use client";

import { formatPrice } from "@/lib/utils/currency";
import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  updateAppointmentFromForm,
  type UpdateAppointmentFormState,
} from "../server/actions/update-appointment";

const initialState: UpdateAppointmentFormState = {
  status: "idle",
  message: null,
};

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeTimeInput(timeValue: string) {
  return timeValue.length >= 5 ? timeValue.slice(0, 5) : timeValue;
}

function calculateEndTime(startTime: string, durationMinutes: string): string {
  if (!startTime || !durationMinutes) {
    return "";
  }

  const [hoursPart, minutesPart] = startTime.split(":");

  if (!hoursPart || !minutesPart) {
    return "";
  }

  const hours = Number.parseInt(hoursPart, 10);
  const minutes = Number.parseInt(minutesPart, 10);
  const duration = Number.parseInt(durationMinutes, 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(duration)) {
    return "";
  }

  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + duration * 60000);
  const endHours = String(endDate.getHours()).padStart(2, "0");
  const endMinutes = String(endDate.getMinutes()).padStart(2, "0");

  return `${endHours}:${endMinutes}`;
}

type EditAppointmentFormProps = {
  appointment: {
    id: number;
    clientId: number;
    lashistUserId: number;
    serviceId: number;
    status: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    notes: string | null;
    activeDeposit?: {
      id: number;
      amount: string;
      paymentMethodId: number;
      referenceNumber: string | null;
      referenceDate: Date | string | null;
      bankName: string | null;
      accountHolderName: string | null;
      destinationAccountLastFour: string | null;
      referenceNote: string | null;
      paymentMethodNameSnapshot?: string | null;
    } | null;
  };
  clients: { id: number; firstName: string; lastName: string | null }[];
  lashists: { userId: number; fullName: string }[];
  services: {
    id: number;
    name: string;
    basePrice: string;
    estimatedDurationMinutes: number;
  }[];
  readOnly?: boolean;
  isStatusActionPending?: boolean;
  canCancel?: boolean;
  canNoShow?: boolean;
  onRequestStatusAction?: (status: "cancelled" | "no_show") => void;
  onSuccess?: () => void;
};

export function EditAppointmentForm({
  appointment,
  clients,
  lashists,
  services,
  readOnly = false,
  isStatusActionPending = false,
  canCancel = false,
  canNoShow = false,
  onRequestStatusAction,
  onSuccess,
}: EditAppointmentFormProps) {
  const [state, action, isPending] = useActionState(
    updateAppointmentFromForm,
    initialState,
  );
  const hasShownToast = useRef(false);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(
    state.values?.appointmentDate
      ? new Date(state.values.appointmentDate)
      : new Date(appointment.appointmentDate + "T00:00:00"),
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    state.values?.serviceId || String(appointment.serviceId),
  );
  const [selectedClientId, setSelectedClientId] = useState<string>(
    state.values?.clientId || String(appointment.clientId),
  );
  const [durationMinutes, setDurationMinutes] = useState<string>(
    state.values?.durationMinutes || String(appointment.durationMinutes),
  );
  const [startTime, setStartTime] = useState<string>(
    normalizeTimeInput(state.values?.startTime || appointment.startTime),
  );
  const [endTime, setEndTime] = useState<string>(
    normalizeTimeInput(state.values?.endTime || appointment.endTime),
  );
  const [rescheduleNote, setRescheduleNote] = useState<string>(
    state.values?.rescheduleNote || "",
  );

  const appointmentDateValue = appointmentDate
    ? formatDateInput(appointmentDate)
    : "";
  const initialStartTime = normalizeTimeInput(appointment.startTime);
  const initialEndTime = normalizeTimeInput(appointment.endTime);
  const hasRescheduleChanges =
    appointmentDateValue !== appointment.appointmentDate ||
    startTime !== initialStartTime ||
    endTime !== initialEndTime;
  const hasClientChanged = selectedClientId !== String(appointment.clientId);
  const shouldWarnClientDepositReassignment =
    hasClientChanged &&
    Boolean(appointment.activeDeposit) &&
    !readOnly;
  const hasStatusActions = canCancel || canNoShow;

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    const service = services.find((s) => String(s.id) === serviceId);
    if (service) {
      const nextDuration = String(service.estimatedDurationMinutes);
      setDurationMinutes(nextDuration);
      const nextEndTime = calculateEndTime(startTime, nextDuration);
      if (nextEndTime) {
        setEndTime(nextEndTime);
      }
    }
  };

  const handleStartTimeChange = (nextStartTime: string) => {
    setStartTime(nextStartTime);
    const nextEndTime = calculateEndTime(nextStartTime, durationMinutes);
    if (nextEndTime) {
      setEndTime(nextEndTime);
    }
  };

  const handleDurationMinutesChange = (nextDurationMinutes: string) => {
    setDurationMinutes(nextDurationMinutes);
    const nextEndTime = calculateEndTime(startTime, nextDurationMinutes);
    if (nextEndTime) {
      setEndTime(nextEndTime);
    }
  };

  useEffect(() => {
    if (state.status === "success" && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success(state.message, {
        duration: 2000,
        richColors: true,
        closeButton: true,
      });
      if (state.warningMessage) {
        toast.warning(state.warningMessage, {
          duration: 4000,
          closeButton: true,
          richColors: true,
        });
      }
      onSuccess?.();
    }

    if (state.status === "idle") {
      hasShownToast.current = false;
    }
  }, [state.status, state.message, state.warningMessage, onSuccess]);

  return (
    <>
      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={appointment.id} />
        <input type="hidden" name="manageDepositInAppointmentSubmit" value="false" />
        <input type="hidden" name="hasDeposit" value="true" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client</Label>
            <Select
              name="clientId"
              value={selectedClientId}
              onValueChange={setSelectedClientId}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={String(client.id)}>
                    {client.firstName} {client.lastName || ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors?.clientId && (
              <p className="text-sm text-red-500">{state.fieldErrors.clientId[0]}</p>
            )}
            {shouldWarnClientDepositReassignment && (
              <div
                role="alert"
                className="rounded-md border border-amber-400 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900"
              >
                Warning: this appointment has an active deposit. If you save the client change, the deposit will be reassigned to the newly selected client.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lashistUserId">Lash Artist</Label>
            <Select
              name="lashistUserId"
              defaultValue={String(appointment.lashistUserId)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select lash artist" />
              </SelectTrigger>
              <SelectContent>
                {lashists.map((lashist) => (
                  <SelectItem key={lashist.userId} value={String(lashist.userId)}>
                    {lashist.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.fieldErrors?.lashistUserId && (
              <p className="text-sm text-red-500">{state.fieldErrors.lashistUserId[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceId">Service</Label>
          <Select
            name="serviceId"
            value={selectedServiceId}
            onValueChange={handleServiceChange}
            disabled={readOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={String(service.id)}>
                  {service.name} - {formatPrice(service.basePrice ?? "0")} ({service.estimatedDurationMinutes} min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.fieldErrors?.serviceId && (
            <p className="text-sm text-red-500">{state.fieldErrors.serviceId[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="appointmentDate">Date</Label>
          <DatePicker value={appointmentDate} onChange={setAppointmentDate} disabled={readOnly} />
          <input type="hidden" name="appointmentDate" value={appointmentDateValue} />
          {state.fieldErrors?.appointmentDate && (
            <p className="text-sm text-red-500">{state.fieldErrors.appointmentDate[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start time</Label>
            <Input
              type="time"
              id="startTime"
              name="startTime"
              value={startTime}
              disabled={readOnly}
              onChange={(e) => handleStartTimeChange(e.target.value)}
            />
            {state.fieldErrors?.startTime && (
              <p className="text-sm text-red-500">{state.fieldErrors.startTime[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End time</Label>
            <Input
              type="time"
              id="endTime"
              name="endTime"
              value={endTime}
              disabled={readOnly}
              onChange={(e) => setEndTime(e.target.value)}
            />
            {state.fieldErrors?.endTime && (
              <p className="text-sm text-red-500">{state.fieldErrors.endTime[0]}</p>
            )}
          </div>

          {hasRescheduleChanges && !readOnly && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="rescheduleNote">
                Rescheduling note <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rescheduleNote"
                name="rescheduleNote"
                placeholder="Explain why you are changing the appointment's date or time..."
                rows={3}
                value={rescheduleNote}
                onChange={(e) => setRescheduleNote(e.target.value)}
              />
              {state.fieldErrors?.rescheduleNote && (
                <p className="text-sm text-red-500">{state.fieldErrors.rescheduleNote[0]}</p>
              )}
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="durationMinutes">Duration (minutes)</Label>
            <Input
              type="text"
              inputMode="decimal"
              id="durationMinutes"
              name="durationMinutes"
              min="1"
              value={durationMinutes}
              disabled={readOnly}
              onChange={(e) => handleDurationMinutesChange(e.target.value)}
            />
            {state.fieldErrors?.durationMinutes && (
              <p className="text-sm text-red-500">{state.fieldErrors.durationMinutes[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Additional notes..."
            rows={3}
            disabled={readOnly}
            defaultValue={appointment.notes || ""}
          />
          {state.fieldErrors?.notes && (
            <p className="text-sm text-red-500">{state.fieldErrors.notes[0]}</p>
          )}
        </div>

        {!readOnly && hasStatusActions && (
          <div className="space-y-2">
            <Label>Appointment actions</Label>
            <div className="flex flex-wrap gap-2">
              {canCancel && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    onRequestStatusAction?.("cancelled");
                  }}
                  disabled={isPending || isStatusActionPending}
                >
                  Cancel appointment
                </Button>
              )}
              {canNoShow && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    onRequestStatusAction?.("no_show");
                  }}
                  disabled={isPending || isStatusActionPending}
                >
                  Mark as no-show
                </Button>
              )}
            </div>
          </div>
        )}

        {state.status === "error" && state.message && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {state.message}
          </div>
        )}
        {state.status === "success" && state.warningMessage && (
          <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-amber-700">
            {state.warningMessage}
          </div>
        )}

        {!readOnly && (
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Actualizando cita..." : "Actualizar cita"}
          </Button>
        )}
      </form>
    </>
  );
}
