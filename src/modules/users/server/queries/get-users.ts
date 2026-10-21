import "server-only";

import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@/db";
import { lashistProfiles, roles, userRoles, users } from "@/db/schema";

export async function getUsers() {
  const usersList = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      isLashist: lashistProfiles.id, // Will be truthy if profile exists
    })
    .from(users)
    .leftJoin(lashistProfiles, and(eq(lashistProfiles.userId, users.id), isNull(lashistProfiles.deletedAt)))
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.createdAt));

  if (usersList.length === 0) {
    return [];
  }

  const userIds = usersList.map((user) => user.id);

  const userRoleRows = await db
    .select({
      userId: userRoles.userId,
      roleId: roles.id,
      roleCode: roles.code,
      roleName: roles.name,
      roleIsSystem: roles.isSystem,
      roleIsActive: roles.isActive,
    })
    .from(userRoles)
    .innerJoin(roles, eq(roles.id, userRoles.roleId))
    .where(
      and(
        inArray(userRoles.userId, userIds),
        isNull(userRoles.deletedAt),
        isNull(roles.deletedAt)
      )
    );

  const rolesByUserId = new Map<
    number,
    Array<{
      id: number;
      code: string;
      name: string;
      isSystem: boolean;
      isActive: boolean;
    }>
  >();

  for (const row of userRoleRows) {
    const currentUserRoles = rolesByUserId.get(row.userId) ?? [];

    currentUserRoles.push({
      id: row.roleId,
      code: row.roleCode,
      name: row.roleName,
      isSystem: row.roleIsSystem,
      isActive: row.roleIsActive,
    });

    rolesByUserId.set(row.userId, currentUserRoles);
  }

  return usersList.map((user) => {
    const userRoles = rolesByUserId.get(user.id) ?? [];
    const isSystem = userRoles.some((role) => role.isSystem);
    return {
      ...user,
      isLashist: Boolean(user.isLashist), // Convert profile ID to boolean
      isSystem,
      roles: userRoles,
    };
  });
}
