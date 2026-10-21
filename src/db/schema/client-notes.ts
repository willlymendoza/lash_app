import {
  AnyPgColumn,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { clients } from "./clients";
import { users } from "./users";

export const clientNotes = pgTable("client_notes", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  title: text("title"),
  note: text("note").notNull(),
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
});
