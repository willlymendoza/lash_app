"use server";

import { z } from "zod";

import { createPaymentMethodSchema } from "@/modules/payment-methods/schemas/payment-method.schema";

type CreatePaymentMethodFieldErrors = Partial<
  Record<keyof z.infer<typeof createPaymentMethodSchema>, string[]>
>;

export type CreatePaymentMethodResult = {
  ok: false;
  message: string;
  fieldErrors?: CreatePaymentMethodFieldErrors;
};

export type CreatePaymentMethodFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: CreatePaymentMethodFieldErrors;
  values?: {
    code: string;
    name: string;
    description: string;
    sortOrder: string;
  };
};

const creationBlockedMessage =
  "Creating payment methods is disabled by the official catalog policy.";

export async function createPaymentMethod(
  input: unknown,
): Promise<CreatePaymentMethodResult> {
  const parsedInput = createPaymentMethodSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for creating the payment method.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as CreatePaymentMethodFieldErrors,
    };
  }

  return {
    ok: false,
    message: creationBlockedMessage,
  };
}

export async function createPaymentMethodFromForm(
  _prevState: CreatePaymentMethodFormState,
  formData: FormData,
): Promise<CreatePaymentMethodFormState> {
  const code = String(formData.get("code") ?? "");
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const sortOrder = String(formData.get("sortOrder") ?? "");

  const result = await createPaymentMethod({
    code,
    name,
    description,
    sortOrder,
  });

  return {
    status: "error",
    message: result.message,
    fieldErrors: result.fieldErrors,
    values: {
      code,
      name,
      description,
      sortOrder,
    },
  };
}
