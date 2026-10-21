import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { permissions, rolePermissions, roles, userRoles } from "@/db/schema";
import type { PermissionKey } from "@/scripts/permission-catalog";

export async function getEffectivePermissionSetForUser(userId: number) {
  const rows = await db
    .selectDistinct({ key: permissions.key })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .innerJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
    .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
    .where(
      and(
        eq(userRoles.userId, userId),
        isNull(userRoles.deletedAt),
        isNull(roles.deletedAt),
        eq(roles.isActive, true),
        isNull(rolePermissions.deletedAt),
        isNull(permissions.deletedAt),
      ),
    );

  return new Set(rows.map((row) => row.key as PermissionKey));
}
