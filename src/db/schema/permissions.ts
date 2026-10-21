import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const permissions = pgTable(
  "permissions",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    module: text("module").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    createdByUserId: integer("created_by_user_id").references(() => users.id),
    updatedByUserId: integer("updated_by_user_id").references(() => users.id),
    deletedByUserId: integer("deleted_by_user_id").references(() => users.id),
  },
  (table) => [
    uniqueIndex("permissions_key_unique").on(table.key),
    index("permissions_module_idx").on(table.module),
  ]
);
