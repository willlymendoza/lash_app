export const PAYMENT_METHOD_CODES = [
  "cash",
  "card",
  "bank_transfer",
  "bank_deposit",
  "check",
] as const;

export type PaymentMethodCode = (typeof PAYMENT_METHOD_CODES)[number];

export type DepositConditionField =
  | "amount"
  | "referenceNumber"
  | "referenceDate"
  | "bankName"
  | "accountHolderName"
  | "destinationAccountLastFour"
  | "referenceNote";

export const PAYMENT_METHOD_DEPOSIT_REQUIREMENTS: Record<
  PaymentMethodCode,
  {
    required: DepositConditionField[];
    optional: DepositConditionField[];
  }
> = {
  cash: {
    required: ["amount"],
    optional: ["referenceNote"],
  },
  card: {
    required: ["amount"],
    optional: ["referenceNumber", "referenceNote"],
  },
  bank_transfer: {
    required: [
      "amount",
      "referenceNumber",
      "referenceDate",
      "bankName",
      "accountHolderName",
      "referenceNote",
    ],
    optional: ["destinationAccountLastFour"],
  },
  bank_deposit: {
    required: [
      "amount",
      "referenceNumber",
      "referenceDate",
      "bankName",
      "accountHolderName",
      "referenceNote",
    ],
    optional: ["destinationAccountLastFour"],
  },
  check: {
    required: [
      "amount",
      "referenceNumber",
      "referenceDate",
      "bankName",
      "accountHolderName",
      "referenceNote",
    ],
    optional: [],
  },
};

export function isSupportedPaymentMethodCode(
  value: string,
): value is PaymentMethodCode {
  return PAYMENT_METHOD_CODES.includes(value as PaymentMethodCode);
}

export function getRequiredDepositFieldsByPaymentMethodCode(
  code: PaymentMethodCode,
) {
  return PAYMENT_METHOD_DEPOSIT_REQUIREMENTS[code].required;
}
