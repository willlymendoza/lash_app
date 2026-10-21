import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const roles = pgTable(
  "roles",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdByUserId: integer("created_by_user_id").references(() => users.id),
    updatedByUserId: integer("updated_by_user_id").references(() => users.id),
    deletedAt: timestamp("deleted_at"),
    deletedByUserId: integer("deleted_by_user_id").references(() => users.id),
  },
  (table) => [
    uniqueIndex("roles_code_active_unique")
      .on(table.code)
      .where(sql`${table.deletedAt} is null`),
    uniqueIndex("roles_name_active_unique")
      .on(table.name)
      .where(sql`${table.deletedAt} is null`),
  ]
);
