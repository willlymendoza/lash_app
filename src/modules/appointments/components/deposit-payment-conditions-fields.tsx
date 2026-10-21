"use client";

import { DatePicker } from "@/components/ui/date-picker";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toGuatemalaISODate } from "@/lib/utils/date";
import {
  PAYMENT_METHOD_DEPOSIT_REQUIREMENTS,
  type PaymentMethodCode,
} from "@/lib/utils/payment-method-conditions";

type DepositConditionValues = {
  referenceNumber: string;
  referenceDate: Date | undefined;
  bankName: string;
  accountHolderName: string;
  destinationAccountLastFour: string;
  referenceNote: string;
};

type DepositConditionHandlers = {
  onReferenceNumberChange: (value: string) => void;
  onReferenceDateChange: (value: Date | undefined) => void;
  onBankNameChange: (value: string) => void;
  onAccountHolderNameChange: (value: string) => void;
  onDestinationAccountLastFourChange: (value: string) => void;
  onReferenceNoteChange: (value: string) => void;
};

type DepositPaymentConditionsFieldsProps = {
  paymentMethodCode: string;
  namePrefix?: "deposit" | "";
  values: DepositConditionValues;
  handlers: DepositConditionHandlers;
  errors?: Partial<Record<string, string[]>>;
  disabled?: boolean;
};

function fieldName(prefix: "deposit" | "", baseName: string) {
  if (!prefix) {
    return baseName;
  }

  return `${prefix}${baseName.charAt(0).toUpperCase()}${baseName.slice(1)}`;
}

function getErrors(
  errors: Partial<Record<string, string[]>> | undefined,
  prefix: "deposit" | "",
  baseName: string,
) {
  const errorMessage = errors?.[fieldName(prefix, baseName)]?.[0];
  if (!errorMessage) {
    return undefined;
  }

  return [{ message: errorMessage }];
}

function hasError(
  errors: Partial<Record<string, string[]>> | undefined,
  prefix: "deposit" | "",
  baseName: string,
) {
  return Boolean(errors?.[fieldName(prefix, baseName)]?.length);
}

function isKnownCode(value: string): value is PaymentMethodCode {
  return value in PAYMENT_METHOD_DEPOSIT_REQUIREMENTS;
}

export function DepositPaymentConditionsFields({
  paymentMethodCode,
  namePrefix = "",
  values,
  handlers,
  errors,
  disabled = false,
}: DepositPaymentConditionsFieldsProps) {
  const requirements = isKnownCode(paymentMethodCode)
    ? PAYMENT_METHOD_DEPOSIT_REQUIREMENTS[paymentMethodCode]
    : null;

  const needsReferenceNumber = Boolean(
    requirements?.required.includes("referenceNumber") ||
      requirements?.optional.includes("referenceNumber"),
  );
  const needsReferenceDate = Boolean(
    requirements?.required.includes("referenceDate") ||
      requirements?.optional.includes("referenceDate"),
  );
  const needsBankName = Boolean(
    requirements?.required.includes("bankName") ||
      requirements?.optional.includes("bankName"),
  );
  const needsAccountHolderName = Boolean(
    requirements?.required.includes("accountHolderName") ||
      requirements?.optional.includes("accountHolderName"),
  );
  const needsDestinationAccountLastFour = Boolean(
    requirements?.optional.includes("destinationAccountLastFour"),
  );

  return (
    <FieldGroup>
      {needsReferenceNumber && (
        <Field data-invalid={hasError(errors, namePrefix, "referenceNumber")}>
          <FieldLabel htmlFor={fieldName(namePrefix, "referenceNumber")}>
            Reference number
          </FieldLabel>
          <Input
            id={fieldName(namePrefix, "referenceNumber")}
            name={fieldName(namePrefix, "referenceNumber")}
            value={values.referenceNumber}
            disabled={disabled}
            aria-invalid={hasError(errors, namePrefix, "referenceNumber")}
            onChange={(event) => handlers.onReferenceNumberChange(event.target.value)}
          />
          <FieldError errors={getErrors(errors, namePrefix, "referenceNumber")} />
        </Field>
      )}

      {needsReferenceDate && (
        <Field data-invalid={hasError(errors, namePrefix, "referenceDate")}>
          <FieldLabel htmlFor={fieldName(namePrefix, "referenceDate")}>
            Reference date
          </FieldLabel>
          <DatePicker
            value={values.referenceDate}
            onChange={handlers.onReferenceDateChange}
            disabled={disabled}
          />
          <input
            type="hidden"
            id={fieldName(namePrefix, "referenceDate")}
            name={fieldName(namePrefix, "referenceDate")}
            value={
              values.referenceDate ? toGuatemalaISODate(values.referenceDate) : ""
            }
          />
          <FieldError errors={getErrors(errors, namePrefix, "referenceDate")} />
        </Field>
      )}

      {needsBankName && (
        <Field data-invalid={hasError(errors, namePrefix, "bankName")}>
          <FieldLabel htmlFor={fieldName(namePrefix, "bankName")}>Bank</FieldLabel>
          <Input
            id={fieldName(namePrefix, "bankName")}
            name={fieldName(namePrefix, "bankName")}
            value={values.bankName}
            disabled={disabled}
            aria-invalid={hasError(errors, namePrefix, "bankName")}
            onChange={(event) => handlers.onBankNameChange(event.target.value)}
          />
          <FieldError errors={getErrors(errors, namePrefix, "bankName")} />
        </Field>
      )}

      {needsAccountHolderName && (
        <Field data-invalid={hasError(errors, namePrefix, "accountHolderName")}>
          <FieldLabel htmlFor={fieldName(namePrefix, "accountHolderName")}>
            Account holder
          </FieldLabel>
          <Input
            id={fieldName(namePrefix, "accountHolderName")}
            name={fieldName(namePrefix, "accountHolderName")}
            value={values.accountHolderName}
            disabled={disabled}
            aria-invalid={hasError(errors, namePrefix, "accountHolderName")}
            onChange={(event) =>
              handlers.onAccountHolderNameChange(event.target.value)
            }
          />
          <FieldError errors={getErrors(errors, namePrefix, "accountHolderName")} />
        </Field>
      )}

      {needsDestinationAccountLastFour && (
        <Field data-invalid={hasError(errors, namePrefix, "destinationAccountLastFour")}>
          <FieldLabel htmlFor={fieldName(namePrefix, "destinationAccountLastFour")}>
            Last 4 account digits (optional)
          </FieldLabel>
          <Input
            id={fieldName(namePrefix, "destinationAccountLastFour")}
            name={fieldName(namePrefix, "destinationAccountLastFour")}
            maxLength={4}
            value={values.destinationAccountLastFour}
            disabled={disabled}
            aria-invalid={hasError(
              errors,
              namePrefix,
              "destinationAccountLastFour",
            )}
            onChange={(event) =>
              handlers.onDestinationAccountLastFourChange(event.target.value)
            }
          />
          <FieldError
            errors={getErrors(errors, namePrefix, "destinationAccountLastFour")}
          />
        </Field>
      )}

      <Field data-invalid={hasError(errors, namePrefix, "referenceNote")}>
        <FieldLabel htmlFor={fieldName(namePrefix, "referenceNote")}>
          Reference note
        </FieldLabel>
        <Textarea
          id={fieldName(namePrefix, "referenceNote")}
          name={fieldName(namePrefix, "referenceNote")}
          placeholder="Transfer reference, deposit slip, etc."
          rows={2}
          value={values.referenceNote}
          disabled={disabled}
          aria-invalid={hasError(errors, namePrefix, "referenceNote")}
          onChange={(event) => handlers.onReferenceNoteChange(event.target.value)}
        />
        <FieldError errors={getErrors(errors, namePrefix, "referenceNote")} />
      </Field>
    </FieldGroup>
  );
}
