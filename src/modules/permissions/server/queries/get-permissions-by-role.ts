import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { permissions, rolePermissions } from "@/db/schema";

export async function getPermissionsByRole(roleId: number) {
  const rolePermissionsList = await db
    .select({
      id: permissions.id,
      key: permissions.key,
      module: permissions.module,
      name: permissions.name,
      description: permissions.description,
      createdAt: permissions.createdAt,
      updatedAt: permissions.updatedAt,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        isNull(rolePermissions.deletedAt),
        isNull(permissions.deletedAt)
      )
    )
    .orderBy(permissions.module, permissions.key);

  return rolePermissionsList;
}
