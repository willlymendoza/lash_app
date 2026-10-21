"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { services } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import {
  updateServiceSchema,
  type UpdateServiceInput,
} from "@/modules/services/schemas/service.schema";

type UpdateServiceFieldErrors = Partial<
  Record<keyof z.infer<typeof updateServiceSchema>, string[]>
>;

export type UpdateServiceResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: UpdateServiceFieldErrors };

export type UpdateServiceFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: UpdateServiceFieldErrors;
  values?: {
    name: string;
    description: string;
    basePrice: string;
    estimatedDurationMinutes: string;
  };
};

export async function updateService(
  id: number,
  input: unknown,
): Promise<UpdateServiceResult> {
  await requirePermission("services.update");

  const parsedInput = updateServiceSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for updating the service.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as UpdateServiceFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  // Check if service exists and is not deleted
  const [existingService] = await db
    .select({ id: services.id })
    .from(services)
    .where(and(eq(services.id, id), isNull(services.deletedAt)))
    .limit(1);

  if (!existingService) {
    return { ok: false, message: "Service not found or deleted." };
  }

  const { name, description, basePrice, estimatedDurationMinutes } =
    parsedInput.data;

  await db
    .update(services)
    .set({
      name: name ?? undefined,
      description: description ?? undefined,
      basePrice: basePrice ?? undefined,
      estimatedDurationMinutes: estimatedDurationMinutes
        ? parseInt(estimatedDurationMinutes, 10)
        : undefined,
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(services.id, id));

  return {
    ok: true,
    message: "Service updated successfully.",
  };
}

export async function updateServiceFromForm(
  _prevState: UpdateServiceFormState,
  formData: FormData,
): Promise<UpdateServiceFormState> {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const basePrice = String(formData.get("basePrice") ?? "");
  const estimatedDurationMinutes = String(
    formData.get("estimatedDurationMinutes") ?? "",
  );

  const result = await updateService(id, {
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
