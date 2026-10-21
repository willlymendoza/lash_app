"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import {
  createClientSchema,
  type CreateClientInput,
} from "@/modules/clients/schemas/client.schema";

type CreateClientFieldErrors = Partial<
  Record<keyof z.infer<typeof createClientSchema>, string[]>
>;

export type CreateClientResult =
  | {
      ok: true;
      message: string;
      client: { id: number; firstName: string; lastName: string | null };
    }
  | { ok: false; message: string; fieldErrors?: CreateClientFieldErrors };

export type CreateClientFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: CreateClientFieldErrors;
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

export async function createClient(
  input: unknown,
): Promise<CreateClientResult> {
  await requirePermission("clients.create");

  const parsedInput = createClientSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for creating the client.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as CreateClientFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { firstName, lastName, phone, address, instagram, email, birthDate } =
    parsedInput.data;

  const [newClient] = await db
    .insert(clients)
    .values({
      firstName,
      lastName: lastName || null,
      phone: phone || null,
      address: address || null,
      instagram: instagram || null,
      email: email || null,
      birthDate: birthDate ? new Date(birthDate + "T00:00:00") : null,
      createdByUserId: currentActiveUser.id,
      updatedByUserId: currentActiveUser.id,
    })
    .returning({
      id: clients.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
    });

  if (!newClient) {
    return { ok: false, message: "Error creating the client." };
  }

  return {
    ok: true,
    message: `Client "${firstName} ${lastName || ""}" created successfully.`,
    client: newClient,
  };
}

export async function createClientFromForm(
  _prevState: CreateClientFormState,
  formData: FormData,
): Promise<CreateClientFormState> {
  const firstName = String(formData.get("firstName") ?? "");
  const lastName = String(formData.get("lastName") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const address = String(formData.get("address") ?? "");
  const instagram = String(formData.get("instagram") ?? "");
  const email = String(formData.get("email") ?? "");
  const birthDate = formData.get("birthDate") ? String(formData.get("birthDate")) : "";

  const result = await createClient({
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

  return {
    status: "success",
    message: result.message,
  };
}
