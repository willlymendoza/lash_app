import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { appointments, clients, services, users } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";

export async function getAppointmentsByLashist(
  lashistUserId: number,
  includeDeleted: boolean = false,
) {
  await requirePermission("appointments.read");

  const whereClause = includeDeleted
    ? eq(appointments.lashistUserId, lashistUserId)
    : and(
        eq(appointments.lashistUserId, lashistUserId),
        isNull(appointments.deletedAt),
      );

  const appointmentsList = await db
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
      client: {
        id: clients.id,
        firstName: clients.firstName,
        lastName: clients.lastName,
        phone: clients.phone,
      },
      lashist: {
        id: users.id,
        fullName: users.fullName,
      },
      service: {
        id: services.id,
        name: services.name,
        basePrice: services.basePrice,
      },
    })
    .from(appointments)
    .leftJoin(clients, eq(appointments.clientId, clients.id))
    .leftJoin(users, eq(appointments.lashistUserId, users.id))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(whereClause)
    .orderBy(desc(appointments.appointmentDate), desc(appointments.startTime));

  return appointmentsList;
}
