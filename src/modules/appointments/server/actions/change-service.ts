"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { appointments, services } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { getAppointmentById } from "../queries/get-appointment-by-id";
import {
  changeServiceSchema,
} from "../../schemas/appointment.schema";

type ChangeServiceFieldErrors = Partial<
  Record<keyof z.infer<typeof changeServiceSchema>, string[]>
>;

export type ChangeServiceResult =
  | {
      ok: true;
      message: string;
    }
  | { ok: false; message: string; fieldErrors?: ChangeServiceFieldErrors };

export type ChangeServiceFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: ChangeServiceFieldErrors;
  values?: {
    newServiceId: string;
    note: string;
  };
};

export async function changeService(
  id: number,
  input: unknown,
): Promise<ChangeServiceResult> {
  await requirePermission("appointments.update");

  const parsedInput = changeServiceSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for changing the service.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as ChangeServiceFieldErrors,
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

  const { newServiceId } = parsedInput.data;

  // Get the new service to update snapshots
  const [newService] = await db
    .select({
      name: services.name,
      basePrice: services.basePrice,
      estimatedDurationMinutes: services.estimatedDurationMinutes,
    })
    .from(services)
    .where(eq(services.id, newServiceId))
    .limit(1);

  if (!newService) {
    return { ok: false, message: "The specified service does not exist." };
  }

  const [updatedAppointment] = await db
    .update(appointments)
    .set({
      serviceId: newServiceId,
      serviceNameSnapshot: newService.name,
      servicePriceSnapshot: newService.basePrice,
      estimatedDurationSnapshot: newService.estimatedDurationMinutes,
      updatedAt: new Date(),
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(appointments.id, id))
    .returning({ id: appointments.id });

  if (!updatedAppointment) {
    return { ok: false, message: "Error changing the service." };
  }

  return {
    ok: true,
    message: "Service updated successfully.",
  };
}

export async function changeServiceFromForm(
  _prevState: ChangeServiceFormState,
  formData: FormData,
): Promise<ChangeServiceFormState> {
  const id = Number(formData.get("id") ?? "");
  const newServiceId = Number(formData.get("newServiceId") ?? "");
  const note = String(formData.get("note") ?? "");

  const result = await changeService(id, {
    newServiceId,
    note,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        newServiceId: String(newServiceId),
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
