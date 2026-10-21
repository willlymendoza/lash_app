"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appointments, appointmentStatusHistory } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { getAppointmentById } from "../queries/get-appointment-by-id";
import {
  changeStatusSchema,
} from "../../schemas/appointment.schema";

type ChangeStatusFieldErrors = Partial<
  Record<keyof z.infer<typeof changeStatusSchema>, string[]>
>;

export type ChangeStatusResult =
  | {
      ok: true;
      message: string;
    }
  | { ok: false; message: string; fieldErrors?: ChangeStatusFieldErrors };

export type ChangeStatusFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: ChangeStatusFieldErrors;
  values?: {
    status: string;
    note: string;
  };
};

type ChangeStatusValue = z.infer<typeof changeStatusSchema>["status"];

export async function changeAppointmentStatus(
  id: number,
  input: unknown,
): Promise<ChangeStatusResult> {
  const parsedInput = changeStatusSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for changing the status.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as ChangeStatusFieldErrors,
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

  const { status, note } = parsedInput.data;

  if (status === "cancelled") {
    await requirePermission("appointments.cancel");
  } else if (status === "no_show") {
    await requirePermission("appointments.no-show");
  } else {
    await requirePermission("appointments.update");
  }

  // Validate allowed status transitions
  const validTransitions: Record<string, string[]> = {
    pending: ["confirmed", "cancelled", "no_show"],
    confirmed: ["in_progress", "cancelled", "no_show"],
    "in_progress": ["completed", "cancelled"],
    completed: [],
    cancelled: [],
    "no_show": [],
  };

  const allowedTransitions = validTransitions[existingAppointment.status] || [];

  if (!allowedTransitions.includes(status)) {
    return {
      ok: false,
      message: `Cannot change from "${existingAppointment.status}" to "${status}".`,
    };
  }

  // Update appointment status
  const [updatedAppointment] = await db
    .update(appointments)
    .set({
      status,
      updatedAt: new Date(),
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(appointments.id, id))
    .returning({ id: appointments.id });

  if (!updatedAppointment) {
    return { ok: false, message: "Error changing the appointment status." };
  }

  // Record the status change in history
  await db.insert(appointmentStatusHistory).values({
    appointmentId: id,
    oldStatus: existingAppointment.status,
    newStatus: status,
    note: note || null,
    changedByUserId: currentActiveUser.id,
  });

  return {
    ok: true,
    message: "Appointment status updated successfully.",
  };
}

export async function changeAppointmentStatusFromForm(
  _prevState: ChangeStatusFormState,
  formData: FormData,
): Promise<ChangeStatusFormState> {
  const id = Number(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "");

  const result = await changeAppointmentStatus(id, {
    status: status as ChangeStatusValue,
    note,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        status,
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
