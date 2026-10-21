"use server";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentReschedules, users } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import type { AppointmentRescheduleEntry } from "../../types";

export async function getAppointmentReschedules(appointmentId: number): Promise<AppointmentRescheduleEntry[]> {
  await requirePermission("appointments.read");

  const reschedules = await db
    .select({
      id: appointmentReschedules.id,
      appointmentId: appointmentReschedules.appointmentId,
      oldDate: appointmentReschedules.oldDate,
      oldStartTime: appointmentReschedules.oldStartTime,
      oldEndTime: appointmentReschedules.oldEndTime,
      newDate: appointmentReschedules.newDate,
      newStartTime: appointmentReschedules.newStartTime,
      newEndTime: appointmentReschedules.newEndTime,
      note: appointmentReschedules.note,
      createdAt: appointmentReschedules.createdAt,
      createdByUser: {
        id: users.id,
        fullName: users.fullName,
      },
    })
    .from(appointmentReschedules)
    .leftJoin(users, eq(appointmentReschedules.createdByUserId, users.id))
    .where(eq(appointmentReschedules.appointmentId, appointmentId))
    .orderBy(asc(appointmentReschedules.createdAt));

  return reschedules as AppointmentRescheduleEntry[];
}
