import "server-only";

import { and, count, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { appointmentDeposits, appointments, clients, services, users } from "@/db/schema";

// Internal helper query used by server actions that already enforce permissions.
// Do not call this directly from pages/components.
export async function getAppointmentById(id: number) {
  const appointment = await db
    .select({
      id: appointments.id,
      clientId: appointments.clientId,
      lashistUserId: appointments.lashistUserId,
      serviceId: appointments.serviceId,
      status: appointments.status,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      durationMinutes: appointments.durationMinutes,
      notes: appointments.notes,
      serviceNameSnapshot: appointments.serviceNameSnapshot,
      servicePriceSnapshot: appointments.servicePriceSnapshot,
      estimatedDurationSnapshot: appointments.estimatedDurationSnapshot,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      deletedAt: appointments.deletedAt,
      deleteReason: appointments.deleteReason,
      client: {
        id: clients.id,
        firstName: clients.firstName,
        lastName: clients.lastName,
        phone: clients.phone,
        address: clients.address,
        instagram: clients.instagram,
        email: clients.email,
      },
      lashist: {
        id: users.id,
        fullName: users.fullName,
      },
      service: {
        id: services.id,
        name: services.name,
        basePrice: services.basePrice,
        estimatedDurationMinutes: services.estimatedDurationMinutes,
      },
    })
    .from(appointments)
    .leftJoin(clients, eq(appointments.clientId, clients.id))
    .leftJoin(users, eq(appointments.lashistUserId, users.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(eq(appointments.id, id))
    .limit(1);

  const result = appointment[0] || null;

  if (!result) {
    return null;
  }

  const [activeDeposit] = await db
    .select({
      id: appointmentDeposits.id,
      amount: appointmentDeposits.amount,
      paymentMethodId: appointmentDeposits.paymentMethodId,
      paymentMethodNameSnapshot: appointmentDeposits.paymentMethodNameSnapshot,
      referenceNote: appointmentDeposits.referenceNote,
      status: appointmentDeposits.status,
    })
    .from(appointmentDeposits)
    .where(
      and(
        eq(appointmentDeposits.appointmentId, id),
        eq(appointmentDeposits.status, "recorded"),
        isNull(appointmentDeposits.voidedAt),
      ),
    )
    .limit(1);

  const [historyResult] = await db
    .select({
      total: count(),
    })
    .from(appointmentDeposits)
    .where(eq(appointmentDeposits.appointmentId, id));

  return {
    ...result,
    activeDeposit: activeDeposit ?? null,
    depositHistoryCount: Number(historyResult?.total ?? 0),
  };
}
