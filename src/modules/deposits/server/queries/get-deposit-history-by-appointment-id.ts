import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/db";
import { appointmentDeposits } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import type { AppointmentDepositListItem } from "../../types";

export async function getDepositHistoryByAppointmentId(
  appointmentId: number,
): Promise<AppointmentDepositListItem[]> {
  await requirePermission("appointment-advances.read");

  const deposits = await db
    .select()
    .from(appointmentDeposits)
    .where(eq(appointmentDeposits.appointmentId, appointmentId))
    .orderBy(desc(appointmentDeposits.createdAt));

  return deposits as AppointmentDepositListItem[];
}
