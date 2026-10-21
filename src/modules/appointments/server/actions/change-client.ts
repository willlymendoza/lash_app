"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appointments, clients } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { getAppointmentById } from "../queries/get-appointment-by-id";
import {
  changeClientSchema,
} from "../../schemas/appointment.schema";

type ChangeClientFieldErrors = Partial<
  Record<keyof z.infer<typeof changeClientSchema>, string[]>
>;

export type ChangeClientResult =
  | {
      ok: true;
      message: string;
    }
  | { ok: false; message: string; fieldErrors?: ChangeClientFieldErrors };

export type ChangeClientFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: ChangeClientFieldErrors;
  values?: {
    newClientId: string;
    note: string;
  };
};

export async function changeClient(
  id: number,
  input: unknown,
): Promise<ChangeClientResult> {
  await requirePermission("appointments.update");

  const parsedInput = changeClientSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for changing the client.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as ChangeClientFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const existingAppointment = await getAppointmentById(id);

  if (!existingAppointment) {
    return { ok: false, message: "The appointment does not exist." };
  }

  const { newClientId } = parsedInput.data;

  // Verify that the new client exists
  const [newClient] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(eq(clients.id, newClientId))
    .limit(1);

  if (!newClient) {
    return { ok: false, message: "The specified client does not exist." };
  }

  const [updatedAppointment] = await db
    .update(appointments)
    .set({
      clientId: newClientId,
      updatedAt: new Date(),
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(appointments.id, id))
    .returning({ id: appointments.id });

  if (!updatedAppointment) {
    return { ok: false, message: "Error changing the client." };
  }

  return {
    ok: true,
    message: "Client updated successfully.",
  };
}

export async function changeClientFromForm(
  _prevState: ChangeClientFormState,
  formData: FormData,
): Promise<ChangeClientFormState> {
  const id = Number(formData.get("id") ?? "");
  const newClientId = Number(formData.get("newClientId") ?? "");
  const note = String(formData.get("note") ?? "");

  const result = await changeClient(id, {
    newClientId,
    note,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        newClientId: String(newClientId),
        note,
      },
    };
  }

  revalidatePath("/appointments");

  return {
    status: "success",
    message: result.message,
  };
}
