"use server";

import { and, eq, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clientNotes } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

export type RestoreClientNoteResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type RestoreClientNoteFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function restoreClientNote(
  id: number,
): Promise<RestoreClientNoteResult> {
  await requirePermission("clients.restore-note");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  // Check if note exists and is deleted
  const [existingNote] = await db
    .select({ id: clientNotes.id, clientId: clientNotes.clientId })
    .from(clientNotes)
    .where(and(eq(clientNotes.id, id), isNotNull(clientNotes.deletedAt)))
    .limit(1);

  if (!existingNote) {
    return { ok: false, message: "Note not found or not deleted." };
  }

  await db
    .update(clientNotes)
    .set({
      deletedAt: null,
      deletedByUserId: null,
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(clientNotes.id, id));

  return {
    ok: true,
    message: "Note restored successfully.",
  };
}

export async function restoreClientNoteFromForm(
  _prevState: RestoreClientNoteFormState,
  formData: FormData,
): Promise<RestoreClientNoteFormState> {
  const id = Number(formData.get("id"));

  const result = await restoreClientNote(id);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${formData.get("clientId")}`);

  return {
    status: "success",
    message: result.message,
  };
}
