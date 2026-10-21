import "../lib/env";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "../db";
import { roles } from "../db/schema";

type SystemRoleSeed = {
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
};

async function upsertRole(roleSeed: SystemRoleSeed) {
  const [existingRole] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(and(eq(roles.code, roleSeed.code), isNull(roles.deletedAt)))
    .limit(1);

  if (!existingRole) {
    const [createdRole] = await db
      .insert(roles)
      .values({
        code: roleSeed.code,
        name: roleSeed.name,
        description: roleSeed.description,
        isSystem: roleSeed.isSystem,
        isActive: true,
      })
      .returning({ id: roles.id });

    if (!createdRole) {
      throw new Error(`Could not create the role "${roleSeed.code}".`);
    }

    console.log(`Role "${roleSeed.name}" (${roleSeed.code}) created.`);
    return createdRole.id;
  }

  await db
    .update(roles)
    .set({
      name: roleSeed.name,
      description: roleSeed.description,
      isSystem: roleSeed.isSystem,
      isActive: true,
      deletedAt: null,
      deletedByUserId: null,
      updatedAt: new Date(),
    })
    .where(eq(roles.id, existingRole.id));

  console.log(`Role "${roleSeed.name}" (${roleSeed.code}) updated.`);
  return existingRole.id;
}

export async function seedSystemRoles() {
  const systemRole: SystemRoleSeed[] = [
    {
      code: "superadmin",
      name: "Superadministrator",
      description:
        "System role with full access. Bypasses all permissions. Maximum of 2 in the system.",
      isSystem: true,
    },
  ];

  for (const role of systemRole) {
    await upsertRole(role);
  }

  console.log("System roles seeded successfully.");
}
