"use client";

import { formatPrice } from "@/lib/utils/currency";
import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { parseISODateOnlyAsLocalDate, toGuatemalaISODate } from "@/lib/utils/date";
import { toast } from "sonner";
import {
  createAppointmentFromForm,
  type CreateAppointmentFormState,
} from "../server/actions/create-appointment";
import { DepositPaymentConditionsFields } from "./deposit-payment-conditions-fields";

const initialState: CreateAppointmentFormState = {
  status: "idle",
  message: null,
};

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

type CreateAppointmentFormProps = {
  clients: { id: number; firstName: string; lastName: string | null }[];
  lashists: { userId: number; fullName: string }[];
  services: {
    id: number;
    name: string;
    basePrice: string;
    estimatedDurationMinutes: number;
  }[];
  paymentMethods: {
    id: number;
    code: string;
    name: string;
  }[];
  canManageDeposit: boolean;
  initialDate?: Date;
  initialStartTime?: string;
  onSuccess?: () => void;
};

export function CreateAppointmentForm({
  clients,
  lashists,
  services,
  paymentMethods,
  canManageDeposit,
  initialDate,
  initialStartTime,
  onSuccess,
}: CreateAppointmentFormProps) {
  const [state, action, isPending] = useActionState(
    createAppointmentFromForm,
    initialState,
  );
  const hasShownToast = useRef(false);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(
    initialDate ||
      parseISODateOnlyAsLocalDate(state.values?.appointmentDate),
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    state.values?.serviceId || "",
  );
  const [durationMinutes, setDurationMinutes] = useState<string>(
    state.values?.durationMinutes || "",
  );
  const [startTime, setStartTime] = useState<string>(
    initialStartTime || state.values?.startTime || "",
  );
  const [endTime, setEndTime] = useState<string>(state.values?.endTime || "");
  const [hasDeposit, setHasDeposit] = useState<boolean>(
    state.values?.hasDeposit === "true",
  );
  const [depositPaymentMethodId, setDepositPaymentMethodId] = useState<string>(
    state.values?.depositPaymentMethodId || "",
  );
  const [depositAmount, setDepositAmount] = useState<string>(
    state.values?.depositAmount || "",
  );
  const [depositReferenceNumber, setDepositReferenceNumber] = useState<string>(
    state.values?.depositReferenceNumber || "",
  );
  const [depositReferenceDate, setDepositReferenceDate] = useState<
    Date | undefined
  >(parseISODateOnlyAsLocalDate(state.values?.depositReferenceDate));
  const [depositBankName, setDepositBankName] = useState<string>(
    state.values?.depositBankName || "",
  );
  const [depositAccountHolderName, setDepositAccountHolderName] = useState<string>(
    state.values?.depositAccountHolderName || "",
  );
  const [
    depositDestinationAccountLastFour,
    setDepositDestinationAccountLastFour,
  ] = useState<string>(state.values?.depositDestinationAccountLastFour || "");
  const [depositReferenceNote, setDepositReferenceNote] = useState<string>(
    state.values?.depositReferenceNote || "",
  );

  const selectedDepositPaymentMethodCode =
    paymentMethods.find(
      (paymentMethod) => String(paymentMethod.id) === depositPaymentMethodId,
    )?.code ?? "";
  const submittedDepositPaymentMethodCode =
    paymentMethods.find(
      (paymentMethod) =>
        String(paymentMethod.id) === state.values?.depositPaymentMethodId,
    )?.code ?? "";
  const shouldShowConditionalErrors =
    !state.values?.depositPaymentMethodId ||
    state.values.depositPaymentMethodId === depositPaymentMethodId ||
    submittedDepositPaymentMethodCode === selectedDepositPaymentMethodCode;
  const isConditionalMethodMessage =
    state.message === "Complete the payment method's required fields.";
  const shouldShowGlobalErrorMessage =
    !isConditionalMethodMessage || shouldShowConditionalErrors;

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
      toast.success(state.message || "Appointment created successfully", {
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
  }, [state.status, state.message, onSuccess, state.warningMessage]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">Client</Label>
          <Select name="clientId" required defaultValue={state.values?.clientId}>
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="lashistUserId">Lash Artist</Label>
          <Select
            name="lashistUserId"
            required
            defaultValue={state.values?.lashistUserId}
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
            <p className="text-sm text-red-500">
              {state.fieldErrors.lashistUserId[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="serviceId">Service</Label>
          <Select
            name="serviceId"
            required
            value={selectedServiceId}
            onValueChange={handleServiceChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={String(service.id)}>
                  {service.name} - {formatPrice(service.basePrice ?? "0")} ({service.estimatedDurationMinutes}{" "}
                  min)
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
          <DatePicker value={appointmentDate} onChange={(date) => setAppointmentDate(date)} />
          <input
            type="hidden"
            name="appointmentDate"
            value={appointmentDate ? toGuatemalaISODate(appointmentDate) : ""}
          />
          {state.fieldErrors?.appointmentDate && (
            <p className="text-sm text-red-500">
              {state.fieldErrors.appointmentDate[0]}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime">Start time</Label>
          <Input
            type="time"
            id="startTime"
            name="startTime"
            required
            value={startTime}
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
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          {state.fieldErrors?.endTime && (
            <p className="text-sm text-red-500">{state.fieldErrors.endTime[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input
            type="text"
            inputMode="decimal"
            id="durationMinutes"
            name="durationMinutes"
            required
            min="1"
            value={durationMinutes}
            onChange={(e) => handleDurationMinutesChange(e.target.value)}
          />
          {state.fieldErrors?.durationMinutes && (
            <p className="text-sm text-red-500">
              {state.fieldErrors.durationMinutes[0]}
            </p>
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
          defaultValue={state.values?.notes}
        />
        {state.fieldErrors?.notes && (
          <p className="text-sm text-red-500">{state.fieldErrors.notes[0]}</p>
        )}
      </div>

      {canManageDeposit && (
        <div className="space-y-4 rounded-md border p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="hasDeposit">Record deposit</Label>
              <p className="text-xs text-muted-foreground">
                Optional. The deposit will be linked to this appointment and client.
              </p>
            </div>
            <Switch
              id="hasDeposit"
              checked={canManageDeposit ? hasDeposit : false}
              onCheckedChange={(checked) => {
                if (!canManageDeposit) {
                  return;
                }
                setHasDeposit(checked);
              }}
              disabled={!canManageDeposit}
            />
          </div>

          <input
            type="hidden"
            name="hasDeposit"
            value={String(canManageDeposit && hasDeposit)}
          />

          {hasDeposit && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Deposit amount</Label>
                <Input
                  id="depositAmount"
                  name="depositAmount"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(event) => setDepositAmount(event.target.value)}
                />
                {state.fieldErrors?.depositAmount && (
                  <p className="text-sm text-red-500">
                    {state.fieldErrors.depositAmount[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositPaymentMethodId">Payment method</Label>
                <Select
                  value={depositPaymentMethodId}
                  onValueChange={setDepositPaymentMethodId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((paymentMethod) => (
                      <SelectItem key={paymentMethod.id} value={String(paymentMethod.id)}>
                        {paymentMethod.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.fieldErrors?.depositPaymentMethodId && (
                  <p className="text-sm text-red-500">
                    {state.fieldErrors.depositPaymentMethodId[0]}
                  </p>
                )}
                <input
                  type="hidden"
                  name="depositPaymentMethodId"
                  value={depositPaymentMethodId}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <DepositPaymentConditionsFields
                  paymentMethodCode={selectedDepositPaymentMethodCode}
                  namePrefix="deposit"
                  values={{
                    referenceNumber: depositReferenceNumber,
                    referenceDate: depositReferenceDate,
                    bankName: depositBankName,
                    accountHolderName: depositAccountHolderName,
                    destinationAccountLastFour: depositDestinationAccountLastFour,
                    referenceNote: depositReferenceNote,
                  }}
                  handlers={{
                    onReferenceNumberChange: setDepositReferenceNumber,
                    onReferenceDateChange: setDepositReferenceDate,
                    onBankNameChange: setDepositBankName,
                    onAccountHolderNameChange: setDepositAccountHolderName,
                    onDestinationAccountLastFourChange:
                      setDepositDestinationAccountLastFour,
                    onReferenceNoteChange: setDepositReferenceNote,
                  }}
                  errors={
                    shouldShowConditionalErrors
                      ? (state.fieldErrors as Partial<Record<string, string[]>>)
                      : undefined
                  }
                />
              </div>
            </div>
          )}
        </div>
      )}

      {state.status === "error" && state.message && shouldShowGlobalErrorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {state.message}
        </div>
      )}
      {state.status === "success" && state.warningMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded">
          {state.warningMessage}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Creating appointment..." : "Create appointment"}
      </Button>
    </form>
  );
}
