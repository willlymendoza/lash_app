import "server-only";

import { desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentDeposits,
  appointments,
  clients,
  lashistProfiles,
  services,
  users,
} from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import type { AppointmentListItem } from "../../types";

export type AppointmentScope = "active" | "deleted" | "all";

export async function getAppointments(scope: AppointmentScope = "active"): Promise<AppointmentListItem[]> {
  await requirePermission("appointments.read");

  const whereClause =
    scope === "all"
      ? undefined
      : scope === "deleted"
        ? isNotNull(appointments.deletedAt)
        : isNull(appointments.deletedAt);

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
        color: lashistProfiles.color,
      },
      service: {
        id: services.id,
        name: services.name,
        basePrice: services.basePrice,
      },
    })
    .from(appointments)
    .innerJoin(clients, eq(appointments.clientId, clients.id))
    .innerJoin(users, eq(appointments.lashistUserId, users.id))
    .leftJoin(lashistProfiles, eq(users.id, lashistProfiles.userId))
    .leftJoin(services, eq(appointments.serviceId, services.id))
    .where(whereClause)
    .orderBy(desc(appointments.appointmentDate), desc(appointments.startTime));

  if (appointmentsList.length === 0) {
    return [];
  }

  const appointmentIds = appointmentsList.map((appointment) => appointment.id);

  const deposits = await db
    .select({
      id: appointmentDeposits.id,
      appointmentId: appointmentDeposits.appointmentId,
      amount: appointmentDeposits.amount,
      status: appointmentDeposits.status,
      paymentMethodId: appointmentDeposits.paymentMethodId,
      paymentMethodNameSnapshot: appointmentDeposits.paymentMethodNameSnapshot,
      referenceNumber: appointmentDeposits.referenceNumber,
      referenceDate: appointmentDeposits.referenceDate,
      bankName: appointmentDeposits.bankName,
      accountHolderName: appointmentDeposits.accountHolderName,
      destinationAccountLastFour: appointmentDeposits.destinationAccountLastFour,
      referenceNote: appointmentDeposits.referenceNote,
      createdAt: appointmentDeposits.createdAt,
      voidedAt: appointmentDeposits.voidedAt,
    })
    .from(appointmentDeposits)
    .where(inArray(appointmentDeposits.appointmentId, appointmentIds))
    .orderBy(desc(appointmentDeposits.createdAt));

  const depositsByAppointment = new Map<number, typeof deposits>();

  for (const deposit of deposits) {
    const group = depositsByAppointment.get(deposit.appointmentId) ?? [];
    group.push(deposit);
    depositsByAppointment.set(deposit.appointmentId, group);
  }

  const list = appointmentsList.map((appointment) => {
    const groupedDeposits = depositsByAppointment.get(appointment.id) ?? [];
    const activeDeposit =
      groupedDeposits.find(
        (deposit) => deposit.status === "recorded" && deposit.voidedAt === null,
      ) ?? null;

    return {
      ...appointment,
      activeDeposit: activeDeposit
        ? {
            id: activeDeposit.id,
            amount: activeDeposit.amount,
            status: activeDeposit.status,
            paymentMethodId: activeDeposit.paymentMethodId,
            paymentMethodNameSnapshot: activeDeposit.paymentMethodNameSnapshot,
            referenceNumber: activeDeposit.referenceNumber,
            referenceDate: activeDeposit.referenceDate,
            bankName: activeDeposit.bankName,
            accountHolderName: activeDeposit.accountHolderName,
            destinationAccountLastFour: activeDeposit.destinationAccountLastFour,
            referenceNote: activeDeposit.referenceNote,
          }
        : null,
      depositHistoryCount: groupedDeposits.length,
    };
  });

  return list as AppointmentListItem[];
}
