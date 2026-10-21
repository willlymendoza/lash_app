import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { roles } from "@/db/schema";

export type RoleDetail = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  createdByUserId: number | null;
  updatedByUserId: number | null;
  deletedByUserId: number | null;
};

export async function getRoleById(roleId: number): Promise<RoleDetail | null> {
  const [role] = await db
    .select({
      id: roles.id,
      code: roles.code,
      name: roles.name,
      description: roles.description,
      isSystem: roles.isSystem,
      isActive: roles.isActive,
      createdAt: roles.createdAt,
      updatedAt: roles.updatedAt,
      deletedAt: roles.deletedAt,
      createdByUserId: roles.createdByUserId,
      updatedByUserId: roles.updatedByUserId,
      deletedByUserId: roles.deletedByUserId,
    })
    .from(roles)
    .where(
      and(
        eq(roles.id, roleId),
        isNull(roles.deletedAt)
      )
    )
    .limit(1);

  return role || null;
}
