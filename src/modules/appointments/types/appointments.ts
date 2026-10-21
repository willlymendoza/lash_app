export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentClientSummary = {
  id: number;
  firstName: string;
  lastName: string | null;
  phone: string | null;
};

export type AppointmentLashistSummary = {
  id: number;
  fullName: string | null;
  color: string | null;
};

export type AppointmentServiceSummary = {
  id: number;
  name: string;
  basePrice: string;
} | null;

export type AppointmentListItem = {
  id: number;
  clientId: number;
  lashistUserId: number;
  serviceId: number;
  status: AppointmentStatus;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  notes: string | null;
  serviceNameSnapshot: string;
  servicePriceSnapshot: string;
  estimatedDurationSnapshot: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  client: AppointmentClientSummary;
  lashist: AppointmentLashistSummary;
  service: AppointmentServiceSummary;
  activeDeposit?: {
    id: number;
    amount: string;
    status: "recorded" | "applied" | "voided";
    paymentMethodId: number;
    paymentMethodNameSnapshot: string;
    referenceNumber: string | null;
    referenceDate: Date | string | null;
    bankName: string | null;
    accountHolderName: string | null;
    destinationAccountLastFour: string | null;
    referenceNote: string | null;
  } | null;
  depositHistoryCount?: number;
};

export type AppointmentStatusHistoryEntry = {
  id: number;
  oldStatus: AppointmentStatus | null;
  newStatus: AppointmentStatus;
  note: string | null;
  changedAt: Date;
  changedByUser: {
    id: number;
    fullName: string;
  } | null;
};

export type AppointmentRescheduleEntry = {
  id: number;
  oldDate: string;
  oldStartTime: string;
  oldEndTime: string;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  note: string | null;
  createdAt: Date;
  createdByUser: {
    id: number;
    fullName: string;
  } | null;
};

export type AppointmentDetails = {
  statusHistory: AppointmentStatusHistoryEntry[];
  reschedules: AppointmentRescheduleEntry[];
};

export type AppointmentsManagementData = {
  activeAppointments: AppointmentListItem[];
};
