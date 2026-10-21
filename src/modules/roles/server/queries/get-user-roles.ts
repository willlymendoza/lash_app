import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { roles, userRoles } from "@/db/schema";

export type UserRoleItem = {
  id: number;
  userId: number;
  roleId: number;
  roleCode: string;
  roleName: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdByUserId: number | null;
  updatedByUserId: number | null;
  deletedByUserId: number | null;
};

export async function getUserRoles(userId: number): Promise<UserRoleItem[]> {
  const userRoleRows = await db
    .select({
      id: userRoles.id,
      userId: userRoles.userId,
      roleId: userRoles.roleId,
      roleCode: roles.code,
      roleName: roles.name,
      createdAt: userRoles.createdAt,
      updatedAt: userRoles.updatedAt,
      deletedAt: userRoles.deletedAt,
      createdByUserId: userRoles.createdByUserId,
      updatedByUserId: userRoles.updatedByUserId,
      deletedByUserId: userRoles.deletedByUserId,
    })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(
      and(
        eq(userRoles.userId, userId),
        isNull(userRoles.deletedAt),
        isNull(roles.deletedAt)
      )
    );

  return userRoleRows as UserRoleItem[];
}
