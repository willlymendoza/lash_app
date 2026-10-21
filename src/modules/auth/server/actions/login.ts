"use server";

import { and, eq, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { loginSchema } from "@/modules/auth/schemas/login.schema";
import type { LoginFormState } from "@/modules/auth/types/login.types";

export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: "Invalid credentials.",
    };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();
  const { password } = parsed.data;

  const [appUser] = await db
    .select({
      id: users.id,
      isActive: users.isActive,
    })
    .from(users)
    .where(and(eq(users.email, normalizedEmail), isNull(users.deletedAt)))
    .limit(1);

  if (!appUser || !appUser.isActive) {
    return {
      error: "You do not have access to the system. Ask an administrator for authorization.",
    };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email: normalizedEmail,
        password,
      },
      headers: await headers(),
    });
  } catch {
    return {
      error: "Incorrect email or password.",
    };
  }

  redirect("/");
}
