import type {
  AppointmentListItem,
  AppointmentRescheduleEntry,
  AppointmentStatusHistoryEntry,
} from "./appointments";

export type AppointmentClientOption = {
  id: number;
  firstName: string;
  lastName: string | null;
  phone: string | null;
};

export type AppointmentLashistOption = {
  id: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string | null;
  defaultCommissionType: string;
  defaultCommissionValue: string;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type AppointmentServiceOption = {
  id: number;
  name: string;
  basePrice: string;
  estimatedDurationMinutes: number;
};

export type AppointmentPaymentMethodOption = {
  id: number;
  code: string;
  name: string;
};

export type AppointmentsPermissions = Record<string, boolean>;

export type AppointmentsManagementProps = {
  activeAppointments: AppointmentListItem[];
  clients: AppointmentClientOption[];
  lashists: AppointmentLashistOption[];
  services: AppointmentServiceOption[];
  paymentMethods: AppointmentPaymentMethodOption[];
  permissions: AppointmentsPermissions;
};

export type AppointmentEditDialogData = {
  selectedAppointment: AppointmentListItem | undefined;
  statusHistory: AppointmentStatusHistoryEntry[];
  reschedules: AppointmentRescheduleEntry[];
};
