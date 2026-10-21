"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { clientNotes, clients } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";
import {
  createClientNoteSchema,
  type CreateClientNoteInput,
} from "@/modules/clients/schemas/client-note.schema";

type AddClientNoteFieldErrors = Partial<
  Record<keyof z.infer<typeof createClientNoteSchema>, string[]>
>;

export type AddClientNoteResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: AddClientNoteFieldErrors };

export type AddClientNoteFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: AddClientNoteFieldErrors;
  values?: {
    title: string;
    note: string;
  };
};

export async function addClientNote(
  input: unknown,
): Promise<AddClientNoteResult> {
  await requirePermission("clients.add-note");

  const parsedInput = createClientNoteSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for adding the note.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as AddClientNoteFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { clientId, title, note } = parsedInput.data;

  // Check if client exists and is not deleted
  const [existingClient] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, clientId), isNull(clients.deletedAt)))
    .limit(1);

  if (!existingClient) {
    return { ok: false, message: "Client not found or deleted." };
  }

  await db.insert(clientNotes).values({
    clientId,
    title: title || null,
    note,
    createdByUserId: currentActiveUser.id,
    updatedByUserId: currentActiveUser.id,
  });

  return {
    ok: true,
    message: "Note added successfully.",
  };
}

export async function addClientNoteFromForm(
  _prevState: AddClientNoteFormState,
  formData: FormData,
): Promise<AddClientNoteFormState> {
  const clientId = Number(formData.get("clientId"));
  const title = String(formData.get("title") ?? "");
  const note = String(formData.get("note") ?? "");

  const result = await addClientNote({
    clientId,
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
  revalidatePath(`/clients/${clientId}`);

  return {
    status: "success",
    message: result.message,
  };
}
