"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { services } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import {
  createServiceSchema,
  type CreateServiceInput,
} from "@/modules/services/schemas/service.schema";

type CreateServiceFieldErrors = Partial<
  Record<keyof z.infer<typeof createServiceSchema>, string[]>
>;

export type CreateServiceResult =
  | {
      ok: true;
      message: string;
      service: { id: number; name: string };
    }
  | { ok: false; message: string; fieldErrors?: CreateServiceFieldErrors };

export type CreateServiceFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: CreateServiceFieldErrors;
  values?: {
    name: string;
    description: string;
    basePrice: string;
    estimatedDurationMinutes: string;
  };
};

export async function createService(
  input: unknown,
): Promise<CreateServiceResult> {
  await requirePermission("services.create");

  const parsedInput = createServiceSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for creating the service.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as CreateServiceFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { name, description, basePrice, estimatedDurationMinutes } =
    parsedInput.data;

  const [newService] = await db
    .insert(services)
    .values({
      name,
      description: description || null,
      basePrice,
      estimatedDurationMinutes: parseInt(estimatedDurationMinutes, 10),
      createdByUserId: currentActiveUser.id,
      updatedByUserId: currentActiveUser.id,
    })
    .returning({
      id: services.id,
      name: services.name,
    });

  if (!newService) {
    return { ok: false, message: "Error creating the service." };
  }

  return {
    ok: true,
    message: `Service "${name}" created successfully.`,
    service: newService,
  };
}

export async function createServiceFromForm(
  _prevState: CreateServiceFormState,
  formData: FormData,
): Promise<CreateServiceFormState> {
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const basePrice = String(formData.get("basePrice") ?? "");
  const estimatedDurationMinutes = String(
    formData.get("estimatedDurationMinutes") ?? "",
  );

  const result = await createService({
    name,
    description,
    basePrice,
    estimatedDurationMinutes,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        name,
        description,
        basePrice,
        estimatedDurationMinutes,
      },
    };
  }

  revalidatePath("/services");

  return {
    status: "success",
    message: result.message,
  };
}
