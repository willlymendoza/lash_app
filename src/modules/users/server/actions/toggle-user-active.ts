"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { roles, userRoles, users } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";
import {
  getActiveSuperadminCount,
  isUserSuperadmin,
} from "@/modules/users/server/utils/superadmin-utils";

const toggleUserActiveSchema = z.object({
  userId: z.number().int().positive(),
  isActive: z.boolean(),
});

export type ToggleUserActiveResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type ToggleUserActiveFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function toggleUserActive(
  input: unknown
): Promise<ToggleUserActiveResult> {
  await requirePermission("users.toggle-active");

  const parsedInput = toggleUserActiveSchema.safeParse(input);

  if (!parsedInput.success) {
    return { ok: false, message: "Invalid data for updating the user." };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { userId, isActive } = parsedInput.data;

  const [targetUser] = await db
    .select({
      id: users.id,
      isActive: users.isActive,
    })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!targetUser) {
    return { ok: false, message: "The user does not exist or is no longer available." };
  }

  if (targetUser.isActive === isActive) {
    return {
      ok: true,
      message: isActive
        ? "The user was already active."
        : "The user was already inactive.",
    };
  }

  // Prevent user from deactivating themselves
  if (!isActive && targetUser.id === currentActiveUser.id) {
    return {
      ok: false,
      message: "You cannot deactivate yourself.",
    };
  }

  // Check if target is admin and actor is not superadmin or creator
  const [targetAdminMatch, actorSuperadminMatch] = await Promise.all([
    db
      .select({ id: userRoles.id })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(
        and(
          eq(userRoles.userId, userId),
          isNull(userRoles.deletedAt),
          isNull(roles.deletedAt),
          eq(roles.isActive, true),
          eq(roles.code, "admin")
        )
      )
      .limit(1),
    db
      .select({ id: userRoles.id })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(
        and(
          eq(userRoles.userId, currentActiveUser.id),
          isNull(userRoles.deletedAt),
          isNull(roles.deletedAt),
          eq(roles.isActive, true),
          eq(roles.code, "superadmin")
        )
      )
      .limit(1),
  ]);

  const targetIsAdmin = Boolean(targetAdminMatch[0]);
  const actorIsSuperadmin = Boolean(actorSuperadminMatch[0]);

  // Get target user creator
  const [targetUserWithCreator] = await db
    .select({ createdByUserId: users.createdByUserId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const actorIsCreator = targetUserWithCreator?.createdByUserId === currentActiveUser.id;

  if (targetIsAdmin && !actorIsSuperadmin && !actorIsCreator) {
    return {
      ok: false,
      message: "Only the creator or a superadmin can deactivate this administrator.",
    };
  }

  if (!isActive) {
    const targetIsSuperadmin = await isUserSuperadmin(targetUser.id);

    if (targetIsSuperadmin) {
      const activeSuperadminUsersCount = await getActiveSuperadminCount();

      if (activeSuperadminUsersCount <= 1) {
        return {
          ok: false,
          message:
            "The last active superadmin cannot be deactivated.",
        };
      }
    }
  }

  await db
    .update(users)
    .set({
      isActive,
      updatedAt: new Date(),
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(users.id, targetUser.id));

  return {
    ok: true,
    message: isActive ? "User activated successfully." : "User deactivated successfully.",
  };
}

export async function toggleUserActiveFromForm(
  _prevState: ToggleUserActiveFormState,
  formData: FormData
): Promise<ToggleUserActiveFormState> {
  const userId = Number(formData.get("userId"));
  const nextIsActive = formData.get("nextIsActive") === "true";

  const result = await toggleUserActive({
    userId,
    isActive: nextIsActive,
  });

  if (result.ok) {
    revalidatePath("/users");
    return {
      status: "success",
      message: result.message,
    };
  }

  return {
    status: "error",
    message: result.message,
  };
}
