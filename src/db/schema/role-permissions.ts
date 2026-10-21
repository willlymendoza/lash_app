import { sql } from "drizzle-orm";
import { index, integer, pgTable, serial, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { permissions } from "./permissions";
import { roles } from "./roles";
import { users } from "./users";

export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: serial("id").primaryKey(),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    createdByUserId: integer("created_by_user_id").references(() => users.id),
    updatedByUserId: integer("updated_by_user_id").references(() => users.id),
    deletedByUserId: integer("deleted_by_user_id").references(() => users.id),
  },
  (table) => [
    uniqueIndex("role_permissions_active_unique")
      .on(table.roleId, table.permissionId)
      .where(sql`${table.deletedAt} is null`),
    index("role_permissions_role_id_idx").on(table.roleId),
    index("role_permissions_permission_id_idx").on(table.permissionId),
  ]
);
