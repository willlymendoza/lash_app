import {
  AnyPgColumn,
  date,
  integer,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
} from "drizzle-orm/pg-core";

import { appointmentStatusEnum } from "./enums";
import { clients } from "./clients";
import { users } from "./users";
import { services } from "./services";

export const appointments = pgTable("appointments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  lashistUserId: integer("lashist_user_id")
    .notNull()
    .references(() => users.id),
  serviceId: integer("service_id")
    .notNull()
    .references(() => services.id),
  status: appointmentStatusEnum("status").notNull().default("pending"),
  appointmentDate: date("appointment_date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  notes: text("notes"),
  serviceNameSnapshot: text("service_name_snapshot").notNull(),
  servicePriceSnapshot: numeric("service_price_snapshot", { precision: 10, scale: 2 }).notNull(),
  estimatedDurationSnapshot: integer("estimated_duration_snapshot"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  createdByUserId: integer("created_by_user_id")
    .notNull()
    .references(() => users.id),
  updatedByUserId: integer("updated_by_user_id").references(
    (): AnyPgColumn => users.id,
  ),
  deletedByUserId: integer("deleted_by_user_id").references(
    (): AnyPgColumn => users.id,
  ),
  deleteReason: text("delete_reason"),
});
