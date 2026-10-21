import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { roles, userRoles, users } from "@/db/schema";

/**
 * Counts the number of active superadmins in the system.
 * A superadmin is considered active if:
 * - The user role assignment is not soft deleted
 * - The role is not soft deleted and is active
 * - The user is not soft deleted and is active
 * - The role code is "superadmin"
 */
export async function getActiveSuperadminCount(): Promise<number> {
  const [result] = await db
    .select({
      count: sql<number>`count(distinct ${userRoles.userId})`,
    })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .innerJoin(users, eq(users.id, userRoles.userId))
    .where(
      and(
        isNull(userRoles.deletedAt),
        isNull(roles.deletedAt),
        isNull(users.deletedAt),
        eq(users.isActive, true),
        eq(roles.isActive, true),
        eq(roles.code, "superadmin")
      )
    );

  return Number(result?.count ?? 0);
}


/**
 * Checks if a specific user has the superadmin role.
 * Returns true if the user has an active superadmin role assignment.
 */
export async function isUserSuperadmin(userId: number): Promise<boolean> {
  const [superadminMatch] = await db
    .select({ id: userRoles.id })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(
      and(
        eq(userRoles.userId, userId),
        isNull(userRoles.deletedAt),
        isNull(roles.deletedAt),
        eq(roles.isActive, true),
        eq(roles.code, "superadmin")
      )
    )
    .limit(1);

  return Boolean(superadminMatch);
}
