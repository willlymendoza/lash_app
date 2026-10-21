import {
  AnyPgColumn,
  date,
  integer,
  pgTable,
  text,
  time,
  timestamp,
} from "drizzle-orm/pg-core";

import { appointments } from "./appointments";
import { users } from "./users";

export const appointmentReschedules = pgTable("appointment_reschedules", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  appointmentId: integer("appointment_id")
    .notNull()
    .references(() => appointments.id),
  oldDate: date("old_date").notNull(),
  oldStartTime: time("old_start_time").notNull(),
  oldEndTime: time("old_end_time").notNull(),
  newDate: date("new_date").notNull(),
  newStartTime: time("new_start_time").notNull(),
  newEndTime: time("new_end_time").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdByUserId: integer("created_by_user_id")
    .notNull()
    .references(() => users.id),
});
