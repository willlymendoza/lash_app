import type { Metadata } from "next";

import {
  hasPermissions,
  requirePermission,
} from "@/modules/permissions/server/queries";
import { getAppointmentsManagementData } from "@/modules/appointments/server/queries/get-appointments-management-data";
import { getClients } from "@/modules/clients/server/queries/get-clients";
import { getLashists } from "@/modules/lashists/server/queries/get-lashists";
import { getServices } from "@/modules/services/server/queries/get-services";
import { getPaymentMethods } from "@/modules/payment-methods/server/queries/get-payment-methods";
import { AppointmentsManagement } from "@/modules/appointments/components/appointments-management";

export const metadata: Metadata = {
  title: "Appointments",
};

export default async function AppointmentsPage() {
  await requirePermission("appointments.read");

  const permissions = await hasPermissions([
    "appointments.read",
    "appointments.create",
    "appointments.update",
    "appointments.cancel",
    "appointments.no-show",
    "appointment-advances.create",
    "appointment-advances.void",
  ]);

  const [appointmentsData, clients, lashists, services, paymentMethods] = await Promise.all([
    getAppointmentsManagementData(),
    getClients(),
    getLashists(true),
    getServices(),
    getPaymentMethods(false, false),
  ]);

  return (
    <AppointmentsManagement
      activeAppointments={appointmentsData.activeAppointments}
      clients={clients}
      lashists={lashists}
      services={services}
      paymentMethods={paymentMethods}
      permissions={permissions}
    />
  );
}
