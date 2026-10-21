"use server";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentStatusHistory, users } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import type { AppointmentStatusHistoryEntry } from "../../types";

export async function getAppointmentStatusHistory(appointmentId: number): Promise<AppointmentStatusHistoryEntry[]> {
  await requirePermission("appointments.read");

  const history = await db
    .select({
      id: appointmentStatusHistory.id,
      appointmentId: appointmentStatusHistory.appointmentId,
      oldStatus: appointmentStatusHistory.oldStatus,
      newStatus: appointmentStatusHistory.newStatus,
      note: appointmentStatusHistory.note,
      changedAt: appointmentStatusHistory.changedAt,
      changedByUser: {
        id: users.id,
        fullName: users.fullName,
      },
    })
    .from(appointmentStatusHistory)
    .leftJoin(users, eq(appointmentStatusHistory.changedByUserId, users.id))
    .where(eq(appointmentStatusHistory.appointmentId, appointmentId))
    .orderBy(asc(appointmentStatusHistory.changedAt));

  return history as AppointmentStatusHistoryEntry[];
}
