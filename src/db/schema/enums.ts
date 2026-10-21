import { pgEnum } from "drizzle-orm/pg-core";

export const overrideEffectEnum = pgEnum("override_effect", ["allow", "deny"]);

export const commissionTypeEnum = pgEnum("commission_type", ["percent", "fixed"]);

export const appointmentStatusEnum = pgEnum("appointment_status", ["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"]);
export const depositStatusEnum = pgEnum("deposit_status", ["recorded", "applied", "voided"]);
