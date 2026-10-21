import {
  AnyPgColumn,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const clients = pgTable("clients", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  phone: text("phone"),
  address: text("address"),
  instagram: text("instagram"),
  email: text("email"),
  birthDate: timestamp("birth_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  createdByUserId: integer("created_by_user_id").references(
    (): AnyPgColumn => users.id,
  ),
  updatedByUserId: integer("updated_by_user_id").references(
    (): AnyPgColumn => users.id,
  ),
  deletedByUserId: integer("deleted_by_user_id").references(
    (): AnyPgColumn => users.id,
  ),
});
