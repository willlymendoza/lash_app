import { sql } from "drizzle-orm";
import {
  AnyPgColumn,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { appointments } from "./appointments";
import { clients } from "./clients";
import { depositStatusEnum } from "./enums";
import { paymentMethods } from "./payment-methods";
import { users } from "./users";

export const appointmentDeposits = pgTable(
  "appointment_deposits",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    appointmentId: integer("appointment_id")
      .notNull()
      .references(() => appointments.id),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethodId: integer("payment_method_id")
      .notNull()
      .references(() => paymentMethods.id),
    paymentMethodNameSnapshot: text("payment_method_name_snapshot").notNull(),
    paymentMethodCodeSnapshot: text("payment_method_code_snapshot").notNull(),
    referenceNumber: text("reference_number"),
    referenceDate: timestamp("reference_date"),
    bankName: text("bank_name"),
    accountHolderName: text("account_holder_name"),
    destinationAccountLastFour: text("destination_account_last_four"),
    referenceNote: text("reference_note"),
    status: depositStatusEnum("status").notNull().default("recorded"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdByUserId: integer("created_by_user_id")
      .notNull()
      .references(() => users.id),
    updatedByUserId: integer("updated_by_user_id").references(
      (): AnyPgColumn => users.id,
    ),
    voidedAt: timestamp("voided_at"),
    voidedByUserId: integer("voided_by_user_id").references(
      (): AnyPgColumn => users.id,
    ),
    voidReason: text("void_reason"),
  },
  (table) => ({
    appointmentIdIdx: index("appointment_deposits_appointment_id_idx").on(
      table.appointmentId,
    ),
    clientIdIdx: index("appointment_deposits_client_id_idx").on(table.clientId),
    statusIdx: index("appointment_deposits_status_idx").on(table.status),
    activePerAppointmentUnique: uniqueIndex(
      "appointment_deposits_active_per_appointment_unique",
    )
      .on(table.appointmentId)
      .where(
        sql`"appointment_deposits"."voided_at" is null and "appointment_deposits"."status" = 'recorded'`,
      ),
  }),
);
