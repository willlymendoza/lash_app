"use server";

import { generateInitialPassword } from "@/lib/password";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { account, user as authUsers, users } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";
import { isUserSuperadmin } from "@/modules/users/server/utils/superadmin-utils";
import { hashPassword } from "better-auth/crypto";

const resetUserPasswordSchema = z.object({
  userId: z.number().int().positive(),
});

export type ResetUserPasswordResult =
  | { ok: true; message: string; newPassword: string }
  | { ok: false; message: string };

export type ResetUserPasswordFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  newPassword?: string;
};

export async function resetUserPassword(
  input: unknown
): Promise<ResetUserPasswordResult> {
  await requirePermission("users.reset-password");

  const parsedInput = resetUserPasswordSchema.safeParse(input);

  if (!parsedInput.success) {
    return { ok: false, message: "Invalid data for resetting the password." };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { userId } = parsedInput.data;

  const [targetUser] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser) {
    return { ok: false, message: "The user does not exist or is not available." };
  }

  // Check if target is superadmin
  const targetIsSuperadmin = await isUserSuperadmin(targetUser.id);
  const actorIsSuperadmin = await isUserSuperadmin(currentActiveUser.id);

  // Prevent non-superadmin from resetting superadmin password
  if (targetIsSuperadmin && !actorIsSuperadmin) {
    return {
      ok: false,
      message: "Only a superadmin can reset another superadmin's password.",
    };
  }

  // Generate new password
  const newPassword = generateInitialPassword();

  try {
    // Hash the new password using scrypt (Better Auth's method)
    const passwordHash = await hashPassword(newPassword);

    // Get the Better Auth user ID
    const [authUser] = await db
      .select({ id: authUsers.id })
      .from(authUsers)
      .where(eq(authUsers.email, targetUser.email))
      .limit(1);

    if (!authUser) {
      return { ok: false, message: "The user does not exist in the authentication system." };
    }

    // Update password in Better Auth account table
    await db
      .update(account)
      .set({ password: passwordHash })
      .where(and(eq(account.userId, authUser.id), eq(account.accountId, authUser.id)));

    return {
      ok: true,
      message: `Password for "${targetUser.fullName}" reset successfully.`,
      newPassword,
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { ok: false, message: "Error resetting the user's password." };
  }
}

export async function resetUserPasswordFromForm(
  _prevState: ResetUserPasswordFormState,
  formData: FormData
): Promise<ResetUserPasswordFormState> {
  const userId = Number(formData.get("userId"));

  const result = await resetUserPassword({ userId });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  return {
    status: "success",
    message: result.message,
    newPassword: result.newPassword,
  };
}
