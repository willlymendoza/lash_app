"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { services } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

export type RemoveServiceResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type RemoveServiceFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function removeService(id: number): Promise<RemoveServiceResult> {
  await requirePermission("services.remove");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  // Check if service exists and is not deleted
  const [existingService] = await db
    .select({
      id: services.id,
      name: services.name,
    })
    .from(services)
    .where(and(eq(services.id, id), isNull(services.deletedAt)))
    .limit(1);

  if (!existingService) {
    return { ok: false, message: "Service not found or already deleted." };
  }

  await db
    .update(services)
    .set({
      deletedAt: new Date(),
      deletedByUserId: currentActiveUser.id,
    })
    .where(eq(services.id, id));

  return {
    ok: true,
    message: `Service "${existingService.name}" deleted successfully.`,
  };
}

export async function removeServiceFromForm(
  _prevState: RemoveServiceFormState,
  formData: FormData,
): Promise<RemoveServiceFormState> {
  const id = Number(formData.get("id"));

  const result = await removeService(id);

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
