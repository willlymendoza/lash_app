"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { lashistProfiles } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";

export type DeactivateLashistResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type DeactivateLashistFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function deactivateLashist(
  id: number,
): Promise<DeactivateLashistResult> {
  await requirePermission("users.assign-lashist");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const [existingProfile] = await db
    .select({ id: lashistProfiles.id })
    .from(lashistProfiles)
    .where(and(eq(lashistProfiles.id, id), isNull(lashistProfiles.deletedAt)))
    .limit(1);

  if (!existingProfile) {
    return { ok: false, message: "Lash artist profile not found or already deactivated." };
  }

  await db
    .update(lashistProfiles)
    .set({
      deletedAt: new Date(),
      deletedByUserId: currentActiveUser.id,
    })
    .where(eq(lashistProfiles.id, id));

  return {
    ok: true,
    message: "Lashista desactivado exitosamente.",
  };
}

export async function deactivateLashistFromForm(
  _prevState: DeactivateLashistFormState,
  formData: FormData,
): Promise<DeactivateLashistFormState> {
  const id = Number(formData.get("id"));

  const result = await deactivateLashist(id);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidatePath("/lashists");

  return {
    status: "success",
    message: result.message,
  };
}
