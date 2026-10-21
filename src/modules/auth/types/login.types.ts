import type { LoginInput } from "@/modules/auth/schemas/login.schema";

export type LoginValues = LoginInput;

export type LoginFormState = {
  error?: string;
};
