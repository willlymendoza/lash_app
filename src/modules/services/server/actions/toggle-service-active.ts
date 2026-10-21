"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { services } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

export type ToggleServiceActiveResult =
  | { ok: true; message: string; isActive: boolean }
  | { ok: false; message: string };

export type ToggleServiceActiveFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function toggleServiceActive(
  id: number,
): Promise<ToggleServiceActiveResult> {
  await requirePermission("services.toggle-active");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  // Check if service exists and is not deleted
  const [existingService] = await db
    .select({
      id: services.id,
      name: services.name,
      isActive: services.isActive,
    })
    .from(services)
    .where(and(eq(services.id, id), isNull(services.deletedAt)))
    .limit(1);

  if (!existingService) {
    return { ok: false, message: "Service not found or deleted." };
  }

  const newStatus = !existingService.isActive;

  await db
    .update(services)
    .set({
      isActive: newStatus,
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(services.id, id));

  return {
    ok: true,
    message: `Service "${existingService.name}" ${
      newStatus ? "activated" : "deactivated"
    } successfully.`,
    isActive: newStatus,
  };
}

export async function toggleServiceActiveFromForm(
  _prevState: ToggleServiceActiveFormState,
  formData: FormData,
): Promise<ToggleServiceActiveFormState> {
  const id = Number(formData.get("id"));

  const result = await toggleServiceActive(id);

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
