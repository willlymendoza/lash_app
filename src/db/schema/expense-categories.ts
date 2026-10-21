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

export const expenseCategories = pgTable(
  "expense_categories",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: text("name").notNull(),
    description: text("description"),
    isSystem: boolean("is_system").default(false).notNull(),
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
  },
  (table) => ({
    nameUnique: unique("expense_categories_name_unique").on(table.name),
  }),
);
