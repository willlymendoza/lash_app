import "server-only";

import { and, eq, inArray, isNull, not, sql } from "drizzle-orm";

import { db } from "@/db";
import { appointments } from "@/db/schema";

interface OverlapCheckParams {
  lashistUserId: number;
  appointmentDate: string; // YYYY-MM-DD format (DATE type in DB)
  startTime: string; // HH:mm format (TIME type in DB)
  endTime: string; // HH:mm format (TIME type in DB)
  excludeAppointmentId?: number;
}

// Internal helper query used by server actions that already enforce permissions.
export async function checkOverlap({
  lashistUserId,
  appointmentDate,
  startTime,
  endTime,
  excludeAppointmentId,
}: OverlapCheckParams): Promise<boolean> {
  // Normalize times to HH:mm:ss for comparison
  const normalizedStartTime = startTime.length === 5 ? `${startTime}:00` : startTime;
  const normalizedEndTime = endTime.length === 5 ? `${endTime}:00` : endTime;

  // Dos intervalos [A_start, A_end] y [B_start, B_end] se traslapan si:
  // A_start < B_end AND A_end > B_start
  const overlapCondition = and(
    sql`${appointments.startTime} < ${normalizedEndTime}`,
    sql`${appointments.endTime} > ${normalizedStartTime}`,
  );

  const whereClause = excludeAppointmentId
    ? and(
        eq(appointments.lashistUserId, lashistUserId),
        eq(appointments.appointmentDate, appointmentDate),
        isNull(appointments.deletedAt),
        // Excluir citas canceladas y no-show
        not(inArray(appointments.status, ["cancelled", "no_show"])),
        // Exclude the current appointment when editing
        not(eq(appointments.id, excludeAppointmentId)),
        // Verificar traslapes
        overlapCondition,
      )
    : and(
        eq(appointments.lashistUserId, lashistUserId),
        eq(appointments.appointmentDate, appointmentDate),
        isNull(appointments.deletedAt),
        // Excluir citas canceladas y no-show
        not(inArray(appointments.status, ["cancelled", "no_show"])),
        overlapCondition,
      );

  const overlappingAppointments = await db
    .select({ id: appointments.id, startTime: appointments.startTime, endTime: appointments.endTime })
    .from(appointments)
    .where(whereClause);

  return overlappingAppointments.length > 0;
}
