export type DepositStatus = "recorded" | "applied" | "voided";

export type AppointmentDepositListItem = {
  id: number;
  appointmentId: number;
  clientId: number;
  amount: string;
  paymentMethodId: number;
  paymentMethodNameSnapshot: string;
  paymentMethodCodeSnapshot: string;
  referenceNumber: string | null;
  referenceDate: Date | null;
  bankName: string | null;
  accountHolderName: string | null;
  destinationAccountLastFour: string | null;
  referenceNote: string | null;
  status: DepositStatus;
  createdAt: Date;
  updatedAt: Date;
  createdByUserId: number;
  updatedByUserId: number | null;
  voidedAt: Date | null;
  voidedByUserId: number | null;
  voidReason: string | null;
};

export type ActiveAppointmentDeposit = AppointmentDepositListItem | null;
