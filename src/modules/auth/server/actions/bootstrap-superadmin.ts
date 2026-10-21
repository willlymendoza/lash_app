"use server";

import { getRequiredEnv } from "@/lib/env";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { user as authUsers, users } from "@/db/schema";
import { auth } from "@/lib/auth";

type BootstrapResult =
  | { status: "created"; email: string }
  | { status: "already-exists"; email: string };

export async function bootstrapSuperadmin(): Promise<BootstrapResult> {
  const name = getRequiredEnv("SUPERADMIN_NAME");
  const email = getRequiredEnv("SUPERADMIN_EMAIL").toLowerCase().trim();
  const password = getRequiredEnv("SUPERADMIN_PASSWORD");

  const [existingAuthUser] = await db
    .select({ id: authUsers.id, email: authUsers.email })
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
      headers: await headers(),
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

  return {
    status: existingAuthUser ? "already-exists" : "created",
    email,
  };
}
