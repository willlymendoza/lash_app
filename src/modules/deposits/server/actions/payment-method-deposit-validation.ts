import {
  getRequiredDepositFieldsByPaymentMethodCode,
  isSupportedPaymentMethodCode,
} from "@/lib/utils/payment-method-conditions";

type DepositFieldErrors = Partial<Record<string, string[]>>;

type DepositValidationInput = {
  paymentMethodCode: string;
  amount?: string;
  referenceNumber?: string;
  referenceDate?: string;
  bankName?: string;
  accountHolderName?: string;
  destinationAccountLastFour?: string;
  referenceNote?: string;
};

const FIELD_LABELS: Record<string, string> = {
  amount: "The amount is required.",
  referenceNumber: "The reference number is required.",
  referenceDate: "The reference date is required.",
  bankName: "The bank is required.",
  accountHolderName: "The account holder's name is required.",
  referenceNote: "The reference note is required.",
};

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

export function validateDepositByPaymentMethod(
  input: DepositValidationInput,
): { ok: true } | { ok: false; fieldErrors: DepositFieldErrors; message: string } {
  if (!isSupportedPaymentMethodCode(input.paymentMethodCode)) {
    return {
      ok: false,
      message: "The selected payment method is not supported for deposits.",
      fieldErrors: {
        paymentMethodId: [
          "The selected payment method is not supported for deposits.",
        ],
      },
    };
  }

  const requiredFields = getRequiredDepositFieldsByPaymentMethodCode(
    input.paymentMethodCode,
  );
  const fieldErrors: DepositFieldErrors = {};

  for (const requiredField of requiredFields) {
    if (!hasValue(input[requiredField])) {
      fieldErrors[requiredField] = [FIELD_LABELS[requiredField]];
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Complete the payment method's required fields.",
      fieldErrors,
    };
  }

  return { ok: true };
}
