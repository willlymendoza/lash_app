import {
  AnyPgColumn,
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
  createdByUserId: integer("created_by_user_id").references(
    (): AnyPgColumn => users.id
  ),
  updatedByUserId: integer("updated_by_user_id").references(
    (): AnyPgColumn => users.id
  ),
  deletedByUserId: integer("deleted_by_user_id").references(
    (): AnyPgColumn => users.id
  ),
});
