import {
  AnyPgColumn,
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order"),
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
  },
  (table) => ({
    codeUnique: unique("payment_methods_code_unique").on(table.code),
  }),
);
