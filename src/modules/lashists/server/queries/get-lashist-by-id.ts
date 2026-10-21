import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { lashistProfiles, users } from "@/db/schema";

export async function getLashistById(id: number) {
  const [lashist] = await db
    .select({
      id: lashistProfiles.id,
      userId: lashistProfiles.userId,
      fullName: users.fullName,
      email: users.email,
      phone: users.phone,
      defaultCommissionType: lashistProfiles.defaultCommissionType,
      defaultCommissionValue: lashistProfiles.defaultCommissionValue,
      createdAt: lashistProfiles.createdAt,
      updatedAt: lashistProfiles.updatedAt,
      deletedAt: lashistProfiles.deletedAt,
    })
    .from(lashistProfiles)
    .innerJoin(users, eq(lashistProfiles.userId, users.id))
    .where(and(eq(lashistProfiles.id, id), isNull(lashistProfiles.deletedAt)))
    .limit(1);

  return lashist;
}
