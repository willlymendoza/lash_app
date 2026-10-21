"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

export type RemoveClientResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type RemoveClientFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function removeClient(id: number): Promise<RemoveClientResult> {
  await requirePermission("clients.remove");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  // Check if client exists and is not deleted
  const [existingClient] = await db
    .select({
      id: clients.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
    })
    .from(clients)
    .where(and(eq(clients.id, id), isNull(clients.deletedAt)))
    .limit(1);

  if (!existingClient) {
    return { ok: false, message: "Client not found or already deleted." };
  }

  await db
    .update(clients)
    .set({
      deletedAt: new Date(),
      deletedByUserId: currentActiveUser.id,
    })
    .where(eq(clients.id, id));

  return {
    ok: true,
    message: `Client "${existingClient.firstName} ${existingClient.lastName || ""}" deleted successfully.`,
  };
}

export async function removeClientFromForm(
  _prevState: RemoveClientFormState,
  formData: FormData,
): Promise<RemoveClientFormState> {
  const id = Number(formData.get("id"));

  const result = await removeClient(id);

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidatePath("/clients");

  return {
    status: "success",
    message: result.message,
  };
}
