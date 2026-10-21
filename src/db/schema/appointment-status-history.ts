import {
  AnyPgColumn,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { appointmentStatusEnum } from "./enums";
import { appointments } from "./appointments";
import { users } from "./users";

export const appointmentStatusHistory = pgTable(
  "appointment_status_history",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    appointmentId: integer("appointment_id")
      .notNull()
      .references(() => appointments.id),
    oldStatus: appointmentStatusEnum("old_status"),
    newStatus: appointmentStatusEnum("new_status").notNull(),
    note: text("note"),
    changedAt: timestamp("changed_at").defaultNow().notNull(),
    changedByUserId: integer("changed_by_user_id")
      .notNull()
      .references(() => users.id),
  },
);
