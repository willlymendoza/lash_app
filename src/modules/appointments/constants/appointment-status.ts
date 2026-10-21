import type { AppointmentStatus } from "../types/appointments";

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
];

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  in_progress: "En progreso",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

export const APPOINTMENT_STATUS_BADGE_CLASSES: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  in_progress: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  completed: "bg-green-100 text-green-800 hover:bg-green-200",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-200",
  no_show: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

export const APPOINTMENT_STATUS_CALENDAR_BACKGROUND: Record<AppointmentStatus, string> = {
  pending: "#fef3c7",
  confirmed: "#dbeafe",
  in_progress: "#e9d5ff",
  completed: "#d1fae5",
  cancelled: "#fee2e2",
  no_show: "#f3f4f6",
};

export const APPOINTMENT_STATUS_CALENDAR_TEXT: Record<AppointmentStatus, string> = {
  pending: "#92400e",
  confirmed: "#1e40af",
  in_progress: "#6b21a8",
  completed: "#065f46",
  cancelled: "#991b1b",
  no_show: "#374151",
};

export function isAppointmentStatus(value: string): value is AppointmentStatus {
  return APPOINTMENT_STATUSES.includes(value as AppointmentStatus);
}

export function getAppointmentStatusLabel(value: string): string {
  return isAppointmentStatus(value) ? APPOINTMENT_STATUS_LABELS[value] : value;
}

export function getAppointmentStatusBadgeClass(value: string): string {
  return isAppointmentStatus(value) ? APPOINTMENT_STATUS_BADGE_CLASSES[value] : "";
}
