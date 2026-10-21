import {
  AnyPgColumn,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { commissionTypeEnum } from "./enums";
import { users } from "./users";

export const lashistProfiles = pgTable("lashist_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  defaultCommissionType: commissionTypeEnum("default_commission_type").notNull(),
  defaultCommissionValue: numeric("default_commission_value", { precision: 10, scale: 2 }).notNull(),
  color: varchar("color", { length: 7 }),
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
