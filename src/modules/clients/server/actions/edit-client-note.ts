"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { clientNotes } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";
import {
  updateClientNoteSchema,
  type UpdateClientNoteInput,
} from "@/modules/clients/schemas/client-note.schema";

type EditClientNoteFieldErrors = Partial<
  Record<keyof z.infer<typeof updateClientNoteSchema>, string[]>
>;

export type EditClientNoteResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: EditClientNoteFieldErrors };

export type EditClientNoteFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: EditClientNoteFieldErrors;
  values?: {
    title: string;
    note: string;
  };
};

export async function editClientNote(
  id: number,
  input: unknown,
): Promise<EditClientNoteResult> {
  await requirePermission("clients.edit-note");

  const parsedInput = updateClientNoteSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for updating the note.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as EditClientNoteFieldErrors,
    };
  }

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
    return { ok: false, message: "Note not found or deleted." };
  }

  const { title, note } = parsedInput.data;

  await db
    .update(clientNotes)
    .set({
      title: title ?? undefined,
      note: note ?? undefined,
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(clientNotes.id, id));

  return {
    ok: true,
    message: "Note updated successfully.",
  };
}

export async function editClientNoteFromForm(
  _prevState: EditClientNoteFormState,
  formData: FormData,
): Promise<EditClientNoteFormState> {
  const id = Number(formData.get("id"));
  const title = String(formData.get("title") ?? "");
  const note = String(formData.get("note") ?? "");

  const result = await editClientNote(id, {
    title,
    note,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        title,
        note,
      },
    };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${formData.get("clientId")}`);

  return {
    status: "success",
    message: result.message,
  };
}
