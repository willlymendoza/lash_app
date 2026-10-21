import { z } from "zod";

export const createServiceSchema = z.object({
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
  basePrice: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "The base price must be a positive number.",
    }),
  estimatedDurationMinutes: z.string().refine(
    (val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 1;
    },
    {
      message: "The estimated duration must be at least 1 minute.",
    },
  ),
});

export const updateServiceSchema = createServiceSchema.partial();

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
