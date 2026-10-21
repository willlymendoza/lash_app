"use server";

import { and, eq, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { services } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

export type RestoreServiceResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type RestoreServiceFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function restoreService(
  id: number,
): Promise<RestoreServiceResult> {
  await requirePermission("services.restore");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  // Check if service exists and is deleted
  const [existingService] = await db
    .select({
      id: services.id,
      name: services.name,
    })
    .from(services)
    .where(and(eq(services.id, id), isNotNull(services.deletedAt)))
    .limit(1);

  if (!existingService) {
    return { ok: false, message: "Service not found or not deleted." };
  }

  await db
    .update(services)
    .set({
      deletedAt: null,
      deletedByUserId: null,
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(services.id, id));

  return {
    ok: true,
    message: `Service "${existingService.name}" restored successfully.`,
  };
}

export async function restoreServiceFromForm(
  _prevState: RestoreServiceFormState,
  formData: FormData,
): Promise<RestoreServiceFormState> {
  const id = Number(formData.get("id"));

  const result = await restoreService(id);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidatePath("/services");

  return {
    status: "success",
    message: result.message,
  };
}
