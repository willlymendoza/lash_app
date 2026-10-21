import { sql } from "drizzle-orm";
import { index, integer, pgTable, serial, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { roles } from "./roles";
import { users } from "./users";

export const userRoles = pgTable(
  "user_roles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    createdByUserId: integer("created_by_user_id").references(() => users.id),
    updatedByUserId: integer("updated_by_user_id").references(() => users.id),
    deletedByUserId: integer("deleted_by_user_id").references(() => users.id),
  },
  (table) => [
    uniqueIndex("user_roles_active_unique")
      .on(table.userId, table.roleId)
      .where(sql`${table.deletedAt} is null`),
    index("user_roles_user_id_idx").on(table.userId),
    index("user_roles_role_id_idx").on(table.roleId),
  ]
);
