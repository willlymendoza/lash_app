"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { lashistProfiles } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";

export type ActivateLashistResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type ActivateLashistFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function activateLashist(
  id: number,
): Promise<ActivateLashistResult> {
  await requirePermission("users.assign-lashist");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const [existingProfile] = await db
    .select({ id: lashistProfiles.id })
    .from(lashistProfiles)
    .where(eq(lashistProfiles.id, id))
    .limit(1);

  if (!existingProfile) {
    return { ok: false, message: "Lash artist profile not found." };
  }

  await db
    .update(lashistProfiles)
    .set({
      deletedAt: null,
      deletedByUserId: null,
    })
    .where(eq(lashistProfiles.id, id));

  return {
    ok: true,
    message: "Lashista activado exitosamente.",
  };
}

export async function activateLashistFromForm(
  _prevState: ActivateLashistFormState,
  formData: FormData,
): Promise<ActivateLashistFormState> {
  const id = Number(formData.get("id"));

  const result = await activateLashist(id);

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
