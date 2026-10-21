"use server";

import { and, eq, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

export type RestoreClientResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type RestoreClientFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function restoreClient(id: number): Promise<RestoreClientResult> {
  await requirePermission("clients.restore");

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  // Check if client exists and is deleted
  const [existingClient] = await db
    .select({
      id: clients.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
    })
    .from(clients)
    .where(and(eq(clients.id, id), isNotNull(clients.deletedAt)))
    .limit(1);

  if (!existingClient) {
    return { ok: false, message: "Client not found or not deleted." };
  }

  await db
    .update(clients)
    .set({
      deletedAt: null,
      deletedByUserId: null,
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(clients.id, id));

  return {
    ok: true,
    message: `Client "${existingClient.firstName} ${existingClient.lastName || ""}" restored successfully.`,
  };
}

export async function restoreClientFromForm(
  _prevState: RestoreClientFormState,
  formData: FormData,
): Promise<RestoreClientFormState> {
  const id = Number(formData.get("id"));

  const result = await restoreClient(id);

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
