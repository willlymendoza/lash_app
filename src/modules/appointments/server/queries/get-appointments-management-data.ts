import "server-only";

import type { AppointmentsManagementData } from "../../types";
import { getAppointments } from "./get-appointments";

export async function getAppointmentsManagementData(): Promise<AppointmentsManagementData> {
  const allAppointments = await getAppointments("all");

  const activeAppointments = allAppointments.filter((appointment) => !appointment.deletedAt);

  return {
    activeAppointments,
  };
}
