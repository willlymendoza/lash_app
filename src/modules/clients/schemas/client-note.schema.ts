import { z } from "zod";

export const createClientNoteSchema = z.object({
  clientId: z.number().int().positive("The client ID is invalid."),
  title: z
    .string()
    .trim()
    .max(100, "The title is too long.")
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .trim()
    .min(1, "The note cannot be empty.")
    .max(1000, "The note is too long."),
});

export const updateClientNoteSchema = createClientNoteSchema.partial().extend({
  clientId: z
    .number()
    .int()
    .positive("The client ID is invalid.")
    .optional(),
});

export type CreateClientNoteInput = z.infer<typeof createClientNoteSchema>;
export type UpdateClientNoteInput = z.infer<typeof updateClientNoteSchema>;
