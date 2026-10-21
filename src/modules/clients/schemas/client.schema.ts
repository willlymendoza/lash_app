import { z } from "zod";

export const createClientSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "The name must contain at least 2 characters.")
    .max(100, "The name is too long."),
  lastName: z
    .string()
    .trim()
    .min(2, "The last name must contain at least 2 characters.")
    .max(100, "The last name is too long.")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(8, "The phone number must contain at most 8 characters.")
    .regex(/^\d{8}$/, "The phone number must contain exactly 8 digits.")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .min(3, "The address must contain at least 3 characters.")
    .max(255, "The address is too long.")
    .optional()
    .or(z.literal("")),
  instagram: z
    .string()
    .trim()
    .min(2, "Instagram must contain at least 2 characters.")
    .max(100, "Instagram is too long.")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Invalid email.")
    .max(255, "The email is too long.")
    .optional()
    .or(z.literal("")),
  birthDate: z
    .string()
    .optional()
    .or(z.literal("")),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
