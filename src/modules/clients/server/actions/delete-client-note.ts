"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clientNotes } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

export type DeleteClientNoteResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type DeleteClientNoteFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function deleteClientNote(
  id: number,
): Promise<DeleteClientNoteResult> {
  await requirePermission("clients.delete-note");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  // Check if note exists and is not deleted
  const [existingNote] = await db
    .select({ id: clientNotes.id, clientId: clientNotes.clientId })
    .from(clientNotes)
    .where(and(eq(clientNotes.id, id), isNull(clientNotes.deletedAt)))
    .limit(1);

  if (!existingNote) {
    return { ok: false, message: "Note not found or already deleted." };
  }

  await db
    .update(clientNotes)
    .set({
      deletedAt: new Date(),
      deletedByUserId: currentActiveUser.id,
    })
    .where(eq(clientNotes.id, id));

  return {
    ok: true,
    message: "Note deleted successfully.",
  };
}

export async function deleteClientNoteFromForm(
  _prevState: DeleteClientNoteFormState,
  formData: FormData,
): Promise<DeleteClientNoteFormState> {
  const id = Number(formData.get("id"));

  const result = await deleteClientNote(id);

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
