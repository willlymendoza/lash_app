"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  upsertAppointmentDepositFromForm,
  type UpsertAppointmentDepositFormState,
} from "@/modules/deposits/server/actions/upsert-appointment-deposit";
import { parseISODateOnlyAsLocalDate } from "@/lib/utils/date";
import { DepositPaymentConditionsFields } from "./deposit-payment-conditions-fields";

const initialState: UpsertAppointmentDepositFormState = {
  status: "idle",
  message: null,
};

type AppointmentDepositUpsertFormProps = {
  appointmentId: number;
  clientId: number;
  paymentMethods: { id: number; code: string; name: string }[];
  canCreateDeposit: boolean;
  readOnly: boolean;
  defaultAmount?: string;
  defaultPaymentMethodId?: number;
  defaultReferenceNumber?: string | null;
  defaultReferenceDate?: string;
  defaultBankName?: string | null;
  defaultAccountHolderName?: string | null;
  defaultDestinationAccountLastFour?: string | null;
  defaultReferenceNote?: string | null;
  hasExistingDeposit: boolean;
  onCancelEdit?: () => void;
  onSuccess?: () => void;
};

export function AppointmentDepositUpsertForm({
  appointmentId,
  clientId,
  paymentMethods,
  canCreateDeposit,
  readOnly,
  defaultAmount,
  defaultPaymentMethodId,
  defaultReferenceNumber,
  defaultReferenceDate,
  defaultBankName,
  defaultAccountHolderName,
  defaultDestinationAccountLastFour,
  defaultReferenceNote,
  hasExistingDeposit,
  onCancelEdit,
  onSuccess,
}: AppointmentDepositUpsertFormProps) {
  const [state, action, isPending] = useActionState(
    upsertAppointmentDepositFromForm,
    initialState,
  );
  const hasShownToast = useRef(false);
  const [amount, setAmount] = useState(state.values?.amount || defaultAmount || "");
  const [paymentMethodId, setPaymentMethodId] = useState(
    state.values?.paymentMethodId ||
      (defaultPaymentMethodId ? String(defaultPaymentMethodId) : ""),
  );
  const [referenceNumber, setReferenceNumber] = useState(
    state.values?.referenceNumber || defaultReferenceNumber || "",
  );
  const [referenceDate, setReferenceDate] = useState<Date | undefined>(
    parseISODateOnlyAsLocalDate(state.values?.referenceDate) ??
      parseISODateOnlyAsLocalDate(defaultReferenceDate),
  );
  const [bankName, setBankName] = useState(
    state.values?.bankName || defaultBankName || "",
  );
  const [accountHolderName, setAccountHolderName] = useState(
    state.values?.accountHolderName || defaultAccountHolderName || "",
  );
  const [destinationAccountLastFour, setDestinationAccountLastFour] = useState(
    state.values?.destinationAccountLastFour || defaultDestinationAccountLastFour || "",
  );
  const [referenceNote, setReferenceNote] = useState(
    state.values?.referenceNote || defaultReferenceNote || "",
  );

  const selectedPaymentMethodCode =
    paymentMethods.find((method) => String(method.id) === paymentMethodId)?.code ??
    "";
  const submittedPaymentMethodCode =
    paymentMethods.find(
      (method) => String(method.id) === state.values?.paymentMethodId,
    )?.code ?? "";
  const shouldShowConditionalErrors =
    !state.values?.paymentMethodId ||
    state.values.paymentMethodId === paymentMethodId ||
    submittedPaymentMethodCode === selectedPaymentMethodCode;
  const isConditionalMethodMessage =
    state.message === "Complete the payment method's required fields.";
  const shouldShowGlobalErrorMessage =
    !isConditionalMethodMessage || shouldShowConditionalErrors;

  useEffect(() => {
    if (state.status === "success" && state.message && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.success(state.message, {
        duration: 2200,
        richColors: true,
        closeButton: true,
      });
      onSuccess?.();
    }

    if (state.status === "idle") {
      hasShownToast.current = false;
    }
  }, [state.status, state.message, onSuccess]);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <input type="hidden" name="clientId" value={clientId} />

      <FieldGroup>
        <Field data-invalid={Boolean(state.fieldErrors?.amount)}>
          <FieldLabel htmlFor="depositAmount">Deposit amount</FieldLabel>
          <Input
            id="depositAmount"
            name="amount"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            disabled={!canCreateDeposit || readOnly}
            aria-invalid={Boolean(state.fieldErrors?.amount)}
            onChange={(event) => setAmount(event.target.value)}
          />
          <FieldError errors={state.fieldErrors?.amount?.map((message) => ({ message }))} />
        </Field>

        <Field data-invalid={Boolean(state.fieldErrors?.paymentMethodId)}>
          <FieldLabel htmlFor="depositPaymentMethodId">Payment method</FieldLabel>
          <Select
            value={paymentMethodId}
            disabled={!canCreateDeposit || readOnly}
            onValueChange={setPaymentMethodId}
          >
            <SelectTrigger id="depositPaymentMethodId" aria-invalid={Boolean(state.fieldErrors?.paymentMethodId)}>
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
          <FieldError
            errors={state.fieldErrors?.paymentMethodId?.map((message) => ({
              message,
            }))}
          />
          <input type="hidden" name="paymentMethodId" value={paymentMethodId} />
        </Field>
      </FieldGroup>

      <DepositPaymentConditionsFields
        paymentMethodCode={selectedPaymentMethodCode}
        namePrefix=""
        values={{
          referenceNumber,
          referenceDate,
          bankName,
          accountHolderName,
          destinationAccountLastFour,
          referenceNote,
        }}
        handlers={{
          onReferenceNumberChange: setReferenceNumber,
          onReferenceDateChange: setReferenceDate,
          onBankNameChange: setBankName,
          onAccountHolderNameChange: setAccountHolderName,
          onDestinationAccountLastFourChange: setDestinationAccountLastFour,
          onReferenceNoteChange: setReferenceNote,
        }}
        errors={
          shouldShowConditionalErrors
            ? (state.fieldErrors as Partial<Record<string, string[]>>)
            : undefined
        }
        disabled={!canCreateDeposit || readOnly}
      />

      {state.status === "error" && state.message && shouldShowGlobalErrorMessage && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        {canCreateDeposit && (
          <Button type="submit" disabled={readOnly || isPending}>
            {isPending ? "Saving..." : "Save deposit"}
          </Button>
        )}
        {hasExistingDeposit && onCancelEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            disabled={readOnly || isPending}
          >
            Cancel editing
          </Button>
        )}
      </div>
    </form>
  );
}
