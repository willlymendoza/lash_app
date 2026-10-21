import {
  AnyPgColumn,
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const services = pgTable("services", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  estimatedDurationMinutes: integer("estimated_duration_minutes").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
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
