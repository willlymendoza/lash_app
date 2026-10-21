import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { appointmentDeposits } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import type { ActiveAppointmentDeposit } from "../../types";

export async function getActiveDepositByAppointmentId(
  appointmentId: number,
): Promise<ActiveAppointmentDeposit> {
  await requirePermission("appointment-advances.read");

  const [deposit] = await db
    .select()
    .from(appointmentDeposits)
    .where(
      and(
        eq(appointmentDeposits.appointmentId, appointmentId),
        eq(appointmentDeposits.status, "recorded"),
        isNull(appointmentDeposits.voidedAt),
      ),
    )
    .orderBy(desc(appointmentDeposits.createdAt))
    .limit(1);

  return deposit ?? null;
}
