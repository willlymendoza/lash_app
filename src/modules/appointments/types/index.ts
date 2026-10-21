export type {
  CreateAppointmentInput,
  UpdateAppointmentInput,
  ChangeStatusInput,
  ChangeServiceInput,
  ChangeClientInput,
} from "../schemas/appointment.schema";

export type {
  AppointmentStatus,
  AppointmentClientSummary,
  AppointmentLashistSummary,
  AppointmentServiceSummary,
  AppointmentListItem,
  AppointmentStatusHistoryEntry,
  AppointmentRescheduleEntry,
  AppointmentDetails,
  AppointmentsManagementData,
} from "./appointments";

export type {
  AppointmentClientOption,
  AppointmentLashistOption,
  AppointmentPaymentMethodOption,
  AppointmentServiceOption,
  AppointmentsPermissions,
  AppointmentsManagementProps,
  AppointmentEditDialogData,
} from "./appointments-management";
