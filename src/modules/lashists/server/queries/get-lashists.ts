import "server-only";

import { desc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { lashistProfiles, users } from "@/db/schema";

export async function getLashists(includeDeleted: boolean = false) {
  const whereClause = includeDeleted
    ? undefined
    : isNull(lashistProfiles.deletedAt);

  const lashistsList = await db
    .select({
      id: lashistProfiles.id,
      userId: lashistProfiles.userId,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      defaultCommissionType: lashistProfiles.defaultCommissionType,
      defaultCommissionValue: lashistProfiles.defaultCommissionValue,
      color: lashistProfiles.color,
      createdAt: lashistProfiles.createdAt,
      updatedAt: lashistProfiles.updatedAt,
      deletedAt: lashistProfiles.deletedAt,
    })
    .from(lashistProfiles)
    .innerJoin(users, eq(lashistProfiles.userId, users.id))
    .where(whereClause)
    .orderBy(desc(lashistProfiles.createdAt));

  return lashistsList;
}
