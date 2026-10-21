"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { roles, userRoles, users } from "@/db/schema";
import { MAX_SUPERADMINS } from "@/lib/constants/app-constants";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";
import {
  getActiveSuperadminCount,
  isUserSuperadmin,
} from "@/modules/users/server/utils/superadmin-utils";

const assignUserRoleSchema = z.object({
  userId: z.number().int().positive(),
  roleId: z.number().int().positive(),
});

export type AssignUserRoleResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function assignUserRole(
  input: unknown
): Promise<AssignUserRoleResult> {
  await requirePermission("roles.assign");

  const parsedInput = assignUserRoleSchema.safeParse(input);

  if (!parsedInput.success) {
    return { ok: false, message: "Invalid data for assigning the role." };
  }

  const currentUser = await getCurrentActiveUser();

  if (!currentUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { userId, roleId } = parsedInput.data;

  // Prevent users from assigning roles to themselves
  if (userId === currentUser.id) {
    return { ok: false, message: "You cannot assign a role to yourself." };
  }

  const [targetUser, targetRole] = await Promise.all([
    db
      .select({ id: users.id, fullName: users.fullName })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1),
    db
      .select({
        id: roles.id,
        code: roles.code,
        name: roles.name,
        isActive: roles.isActive,
      })
      .from(roles)
      .where(and(eq(roles.id, roleId), isNull(roles.deletedAt)))
      .limit(1),
  ]);

  if (!targetUser[0]) {
    return { ok: false, message: "The target user does not exist or is not available." };
  }

  if (!targetRole[0]) {
    return { ok: false, message: "The role does not exist or is not available." };
  }

  if (!targetRole[0].isActive) {
    return { ok: false, message: "An inactive role cannot be assigned." };
  }

  const actorIsSuperadmin = await isUserSuperadmin(currentUser.id);

  // Superadmin puede asignar cualquier rol
  if (actorIsSuperadmin) {
    // Enforce the superadmin limit
    if (targetRole[0].code === "superadmin") {
      const currentSuperadminCount = await getActiveSuperadminCount();

      if (currentSuperadminCount >= MAX_SUPERADMINS) {
        return {
          ok: false,
          message: `There are already ${MAX_SUPERADMINS} superadmins in the system (maximum reached).`,
        };
      }
    }
  }
  // Regular users cannot assign the superadmin role
  else {
    if (targetRole[0].code === "superadmin") {
      return {
        ok: false,
        message: "Only superadmins can assign the superadmin role.",
      };
    }
  }

  const [existingUserRole] = await db
    .select({
      id: userRoles.id,
      deletedAt: userRoles.deletedAt,
    })
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
    .limit(1);

  if (existingUserRole && !existingUserRole.deletedAt) {
    return { ok: true, message: "The user already had this role assigned." };
  }

  if (!existingUserRole) {
    await db.insert(userRoles).values({
      userId,
      roleId,
      createdByUserId: currentUser.id,
      updatedByUserId: currentUser.id,
    });
  } else {
    await db
      .update(userRoles)
      .set({
        deletedAt: null,
        deletedByUserId: null,
        updatedAt: new Date(),
        updatedByUserId: currentUser.id,
      })
      .where(eq(userRoles.id, existingUserRole.id));
  }

  return {
    ok: true,
    message: `Role "${targetRole[0].name}" assigned to ${targetUser[0].fullName}.`,
  };
}

export type AssignUserRoleFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function assignUserRoleFromForm(
  _prevState: AssignUserRoleFormState,
  formData: FormData
): Promise<AssignUserRoleFormState> {
  if (!formData || typeof formData.get !== "function") {
    return {
      status: "error",
      message: "Invalid form data",
    };
  }

  const userId = Number(formData.get("userId"));
  const roleId = Number(formData.get("roleId"));

  const result = await assignUserRole({
    userId,
    roleId,
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
