import { getRequiredEnv } from "@/lib/env";
import "../lib/env";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "../db";
import { roles, user as authUsers, userRoles, users } from "../db/schema";
import { auth } from "../lib/auth";

export async function bootstrapSuperadmin() {
  const baseUrl = getRequiredEnv("BETTER_AUTH_URL");
  const name = getRequiredEnv("SUPERADMIN_NAME");
  const email = getRequiredEnv("SUPERADMIN_EMAIL").toLowerCase().trim();
  const password = getRequiredEnv("SUPERADMIN_PASSWORD");

  const [existingAuthUser] = await db
    .select({ id: authUsers.id })
    .from(authUsers)
    .where(eq(authUsers.email, email))
    .limit(1);

  if (!existingAuthUser) {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
      headers: new Headers({
        origin: baseUrl,
      }),
    });
  }

  const [existingAppUser] = await db
    .select({ id: users.id, isActive: users.isActive, deletedAt: users.deletedAt })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!existingAppUser) {
    await db.insert(users).values({
      fullName: name,
      email,
      isActive: true,
    });
  } else if (!existingAppUser.isActive || existingAppUser.deletedAt) {
    await db
      .update(users)
      .set({
        fullName: name,
        isActive: true,
        deletedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existingAppUser.id));
  }

  // Get the user ID from the users table
  const [appUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!appUser) {
    throw new Error("Could not find the newly created user.");
  }

  // Find the superadmin role
  const [superadminRole] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(and(eq(roles.code, "superadmin"), isNull(roles.deletedAt)))
    .limit(1);

  if (!superadminRole) {
    throw new Error('The "superadmin" role does not exist. Run pnpm db:seed to initialize system roles.');
  }

  // Check if role is already assigned
  const [existingUserRole] = await db
    .select({ id: userRoles.id })
    .from(userRoles)
    .where(
      and(
        eq(userRoles.userId, appUser.id),
        eq(userRoles.roleId, superadminRole.id),
        isNull(userRoles.deletedAt)
      )
    )
    .limit(1);

  if (!existingUserRole) {
    await db.insert(userRoles).values({
      userId: appUser.id,
      roleId: superadminRole.id,
      createdByUserId: appUser.id, // First superadmin self-assigns
    });
    console.log(`Superadmin role assigned to: ${email}`);
  }

  console.log(
    existingAuthUser
      ? `Superadmin already exists: ${email}`
      : `Superadmin created: ${email}`
  );
}
