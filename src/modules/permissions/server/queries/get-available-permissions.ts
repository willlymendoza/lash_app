import "server-only";

import { isNull } from "drizzle-orm";

import { db } from "@/db";
import { permissions } from "@/db/schema";

export async function getAvailablePermissions() {
  const permissionsList = await db
    .select({
      id: permissions.id,
      key: permissions.key,
      module: permissions.module,
      name: permissions.name,
      description: permissions.description,
      createdAt: permissions.createdAt,
      updatedAt: permissions.updatedAt,
    })
    .from(permissions)
    .where(isNull(permissions.deletedAt))
    .orderBy(permissions.module, permissions.key);

  return permissionsList;
}
