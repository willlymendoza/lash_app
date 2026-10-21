import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;
const amountRegex = /^\d+(\.\d{1,2})?$/;

export const createAppointmentSchema = z.object({
  clientId: z
    .number()
    .int()
    .positive("The client ID must be a positive number."),
  lashistUserId: z
    .number()
    .int()
    .positive("The lash artist ID must be a positive number."),
  serviceId: z
    .number()
    .int()
    .positive("The service ID must be a positive number."),
  appointmentDate: z
    .string()
    .min(1, "The date is required.")
    .regex(dateRegex, "The date must use the YYYY-MM-DD format."),
  startTime: z
    .string()
    .min(1, "The start time is required.")
    .regex(timeRegex, "The time must use the HH:mm format."),
  endTime: z
    .string()
    .min(1, "The end time is required.")
    .regex(timeRegex, "The time must use the HH:mm format."),
  durationMinutes: z
    .number()
    .int()
    .positive("The duration must be a positive number."),
  notes: z
    .string()
    .max(1000, "Notes cannot exceed 1000 characters.")
    .optional()
    .or(z.literal("")),
  statusNote: z
    .string()
    .max(500, "The status note cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
  hasDeposit: z.boolean().default(false),
  depositAmount: z
    .string()
    .regex(amountRegex, "The amount can have up to 2 decimal places.")
    .optional()
    .or(z.literal("")),
  depositPaymentMethodId: z.number().int().positive().optional(),
  depositReferenceNumber: z
    .string()
    .max(100, "The reference number cannot exceed 100 characters.")
    .optional()
    .or(z.literal("")),
  depositReferenceDate: z
    .string()
    .regex(dateRegex, "The reference date must use the YYYY-MM-DD format.")
    .optional()
    .or(z.literal("")),
  depositBankName: z
    .string()
    .max(120, "The bank cannot exceed 120 characters.")
    .optional()
    .or(z.literal("")),
  depositAccountHolderName: z
    .string()
    .max(150, "The account holder's name cannot exceed 150 characters.")
    .optional()
    .or(z.literal("")),
  depositDestinationAccountLastFour: z
    .string()
    .max(4, "The last 4 characters cannot exceed 4.")
    .optional()
    .or(z.literal("")),
  depositReferenceNote: z
    .string()
    .max(500, "The reference note cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
  depositVoidReason: z
    .string()
    .max(500, "The void reason cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
}).superRefine((value, ctx) => {
  const manageDepositInThisSubmit =
    !("manageDepositInAppointmentSubmit" in value) ||
    (value as { manageDepositInAppointmentSubmit?: boolean })
      .manageDepositInAppointmentSubmit === true;

  if (!manageDepositInThisSubmit || !value.hasDeposit) {
    return;
  }

  if (!value.depositAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["depositAmount"],
      message: "The deposit amount is required.",
    });
  }

  if (!value.depositPaymentMethodId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["depositPaymentMethodId"],
      message: "The deposit payment method is required.",
    });
  }
});

export const updateAppointmentSchema = createAppointmentSchema.extend({
  manageDepositInAppointmentSubmit: z.boolean().default(false),
  status: z
    .enum(["cancelled", "no_show"], {
      message: "Invalid status.",
    })
    .optional(),
  rescheduleNote: z
    .string()
    .max(500, "The rescheduling note cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
});

export const changeStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"], {
    message: "Invalid status.",
  }),
  note: z
    .string()
    .max(500, "The note cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
});

export const changeServiceSchema = z.object({
  newServiceId: z
    .number()
    .int()
    .positive("The new service ID must be a positive number."),
  note: z
    .string()
    .max(500, "The note cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
});

export const changeClientSchema = z.object({
  newClientId: z
    .number()
    .int()
    .positive("The new client ID must be a positive number."),
  note: z
    .string()
    .max(500, "The note cannot exceed 500 characters.")
    .optional()
    .or(z.literal("")),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type ChangeServiceInput = z.infer<typeof changeServiceSchema>;
export type ChangeClientInput = z.infer<typeof changeClientSchema>;
