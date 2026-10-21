import { z } from "zod";

const amountRegex = /^\d+(\.\d{1,2})?$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const upsertAppointmentDepositSchema = z.object({
  appointmentId: z
    .number()
    .int()
    .positive("The appointment ID must be a positive number."),
  clientId: z
    .number()
    .int()
    .positive("The client ID must be a positive number."),
  amount: z
    .string()
    .trim()
    .regex(amountRegex, "The amount can have up to 2 decimal places."),
  paymentMethodId: z
    .number()
    .int()
    .positive("The payment method is required."),
  referenceNumber: z
    .string()
    .max(100, "The reference number cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),
  referenceDate: z
    .string()
    .regex(dateRegex, "The reference date must use the YYYY-MM-DD format.")
    .optional()
    .or(z.literal("")),
  bankName: z
    .string()
    .max(120, "The bank cannot exceed 120 characters.")
    .optional()
    .or(z.literal("")),
  accountHolderName: z
    .string()
    .max(150, "The account holder's name cannot exceed 150 characters.")
    .optional()
    .or(z.literal("")),
  destinationAccountLastFour: z
    .string()
    .max(4, "The last 4 account characters cannot exceed 4 characters.")
    .optional()
    .or(z.literal("")),
  referenceNote: z
    .string()
    .max(500, "The reference note cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
});

export const voidAppointmentDepositSchema = z.object({
  depositId: z
    .number()
    .int()
    .positive("The deposit ID must be a positive number."),
  voidReason: z
    .string()
    .trim()
    .min(1, "The void reason is required.")
    .max(500, "The void reason cannot exceed 500 characters."),
});

export type UpsertAppointmentDepositInput = z.infer<
  typeof upsertAppointmentDepositSchema
>;
export type VoidAppointmentDepositInput = z.infer<
  typeof voidAppointmentDepositSchema
>;
