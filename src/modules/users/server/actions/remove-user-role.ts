"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { roles, userRoles, users } from "@/db/schema";
import { MIN_SUPERADMINS } from "@/lib/constants/app-constants";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";
import {
  getActiveSuperadminCount,
  isUserSuperadmin,
} from "@/modules/users/server/utils/superadmin-utils";

const removeUserRoleSchema = z.object({
  userId: z.number().int().positive(),
  roleId: z.number().int().positive(),
});

export type RemoveUserRoleResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type RemoveUserRoleFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function removeUserRole(
  input: unknown
): Promise<RemoveUserRoleResult> {
  await requirePermission("roles.assign");

  const parsedInput = removeUserRoleSchema.safeParse(input);

  if (!parsedInput.success) {
    return { ok: false, message: "Invalid data for removing the role." };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { userId, roleId } = parsedInput.data;

  const [targetRole, targetUserRole] = await Promise.all([
    db
      .select({
        id: roles.id,
        code: roles.code,
        name: roles.name,
      })
      .from(roles)
      .where(and(eq(roles.id, roleId), isNull(roles.deletedAt)))
      .limit(1),
    db
      .select({
        id: userRoles.id,
        createdByUserId: userRoles.createdByUserId,
      })
      .from(userRoles)
      .where(
        and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId),
          isNull(userRoles.deletedAt)
        )
      )
      .limit(1),
  ]);

  if (!targetRole[0]) {
    return { ok: false, message: "The role does not exist or is no longer available." };
  }

  if (!targetUserRole[0]) {
    return { ok: true, message: "The user no longer had this role assigned." };
  }

  const actorIsSuperadmin = await isUserSuperadmin(currentActiveUser.id);

  // Validate privilege levels
  if (actorIsSuperadmin) {
    // For superadmins, preserve the last active account and verify the assigning user
    if (targetRole[0].code === "superadmin") {
      const activeSuperadminCount = await getActiveSuperadminCount();

      if (activeSuperadminCount <= MIN_SUPERADMINS) {
        return {
          ok: false,
          message: "The last active superadmin cannot be removed.",
        };
      }

      // Only the assigning user can remove the superadmin role
      if (targetUserRole[0].createdByUserId !== currentActiveUser.id) {
        return {
          ok: false,
          message: "Only the superadmin who assigned this role can remove it.",
        };
      }
    }
  }
  // Regular users cannot remove the superadmin role
  else {
    if (targetRole[0].code === "superadmin") {
      return {
        ok: false,
        message: "Only superadmins can remove the superadmin role.",
      };
    }
  }

  await db
    .update(userRoles)
    .set({
      deletedAt: new Date(),
      deletedByUserId: currentActiveUser.id,
      updatedAt: new Date(),
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(userRoles.id, targetUserRole[0].id));

  return {
    ok: true,
    message: `Role "${targetRole[0].name}" removed successfully.`,
  };
}

export async function removeUserRoleFromForm(
  _prevState: RemoveUserRoleFormState,
  formData: FormData
): Promise<RemoveUserRoleFormState> {
  const userId = Number(formData.get("userId"));
  const roleId = Number(formData.get("roleId"));

  const result = await removeUserRole({
    userId,
    roleId,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidatePath("/users");

  return {
    status: "success",
    message: result.message,
  };
}
