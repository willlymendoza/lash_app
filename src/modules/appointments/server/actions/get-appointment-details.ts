"use server";

import type { AppointmentDetails } from "../../types";
import { getAppointmentReschedules } from "../queries/get-appointment-reschedules";
import { getAppointmentStatusHistory } from "../queries/get-appointment-status-history";

export async function getAppointmentDetails(appointmentId: number): Promise<AppointmentDetails> {
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    throw new Error("Invalid appointment ID.");
  }

  const [statusHistory, reschedules] = await Promise.all([
    getAppointmentStatusHistory(appointmentId),
    getAppointmentReschedules(appointmentId),
  ]);

  return {
    statusHistory,
    reschedules,
  };
}
