"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import {
  updateClientSchema,
  type UpdateClientInput,
} from "@/modules/clients/schemas/client.schema";

type UpdateClientFieldErrors = Partial<
  Record<keyof z.infer<typeof updateClientSchema>, string[]>
>;

export type UpdateClientResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: UpdateClientFieldErrors };

export type UpdateClientFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: UpdateClientFieldErrors;
  values?: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    instagram: string;
    email: string;
    birthDate: string | null;
  };
};

export async function updateClient(
  id: number,
  input: unknown,
): Promise<UpdateClientResult> {
  await requirePermission("clients.update");

  const parsedInput = updateClientSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for updating the client.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as UpdateClientFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  // Check if client exists and is not deleted
  const [existingClient] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.id, id), isNull(clients.deletedAt)))
    .limit(1);

  if (!existingClient) {
    return { ok: false, message: "Client not found or deleted." };
  }

  const { firstName, lastName, phone, address, instagram, email, birthDate } =
    parsedInput.data;

  await db
    .update(clients)
    .set({
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      phone: phone ?? undefined,
      address: address ?? undefined,
      instagram: instagram ?? undefined,
      email: email ?? undefined,
      birthDate: birthDate ? new Date(birthDate + "T00:00:00") : undefined,
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(clients.id, id));

  return {
    ok: true,
    message: "Client updated successfully.",
  };
}

export async function updateClientFromForm(
  _prevState: UpdateClientFormState,
  formData: FormData,
): Promise<UpdateClientFormState> {
  const id = Number(formData.get("id"));
  const firstName = String(formData.get("firstName") ?? "");
  const lastName = String(formData.get("lastName") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const address = String(formData.get("address") ?? "");
  const instagram = String(formData.get("instagram") ?? "");
  const email = String(formData.get("email") ?? "");
  const birthDate = formData.get("birthDate") ? String(formData.get("birthDate")) : "";

  const result = await updateClient(id, {
    firstName,
    lastName,
    phone,
    address,
    instagram,
    email,
    birthDate,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        firstName,
        lastName,
        phone,
        address,
        instagram,
        email,
        birthDate,
      },
    };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);

  return {
    status: "success",
    message: result.message,
  };
}
