import { z } from "zod";

export const createPaymentMethodSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "The code must contain at least 2 characters.")
    .max(50, "The code is too long.")
    .regex(
      /^[a-z0-9_-]+$/,
      "The code can only contain lowercase letters, numbers, hyphens, and underscores.",
    ),
  name: z
    .string()
    .trim()
    .min(3, "The name must contain at least 3 characters.")
    .max(100, "The name is too long."),
  description: z
    .string()
    .trim()
    .max(500, "The description is too long.")
    .optional()
    .or(z.literal("")),
  sortOrder: z
    .string()
    .refine(
      (val) => {
        if (val === "" || val === undefined) return true;
        const num = Number.parseInt(val, 10);
        return !Number.isNaN(num) && num >= 0;
      },
      {
        message: "The order must be zero or a positive number.",
      },
    )
    .optional()
    .or(z.literal("")),
});

export const updatePaymentMethodSchema = z.object({
  description: z
    .string()
    .trim()
    .max(500, "The description is too long.")
    .optional()
    .or(z.literal("")),
  sortOrder: z
    .string()
    .refine(
      (val) => {
        if (val === "" || val === undefined) return true;
        const num = Number.parseInt(val, 10);
        return !Number.isNaN(num) && num >= 0;
      },
      {
        message: "The order must be zero or a positive number.",
      },
    )
    .optional()
    .or(z.literal("")),
});
