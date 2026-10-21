import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address").trim(),
  password: z
    .string()
    .min(8, "The password must contain at least 8 characters")
    .max(128, "The password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;
