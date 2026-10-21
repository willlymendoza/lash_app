import { z } from "zod";

export const createExpenseCategorySchema = z.object({
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
});

export const updateExpenseCategorySchema =
  createExpenseCategorySchema.partial();

export type CreateExpenseCategoryInput = z.infer<
  typeof createExpenseCategorySchema
>;
export type UpdateExpenseCategoryInput = z.infer<
  typeof updateExpenseCategorySchema
>;
