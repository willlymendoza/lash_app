"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { permissions, rolePermissions, roles } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

const removePermissionFromRoleSchema = z.object({
  roleId: z.number().int().positive(),
  permissionId: z.number().int().positive(),
});

export type RemovePermissionFromRoleResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type RemovePermissionFromRoleFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function removePermissionFromRole(input: unknown): Promise<RemovePermissionFromRoleResult> {
  await requirePermission("permissions.remove");

  const parsedInput = removePermissionFromRoleSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for removing a permission from the role.",
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { roleId, permissionId } = parsedInput.data;

  // Check if role exists and is active
  const [role] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(
      and(
        eq(roles.id, roleId),
        isNull(roles.deletedAt)
      )
    )
    .limit(1);

  if (!role) {
    return { ok: false, message: "The role does not exist or is inactive." };
  }

  // Check if permission exists and is active
  const [permission] = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(
      and(
        eq(permissions.id, permissionId),
        isNull(permissions.deletedAt)
      )
    )
    .limit(1);

  if (!permission) {
    return { ok: false, message: "The permission does not exist or is inactive." };
  }

  // Check if permission is assigned to role
  const [existingAssignment] = await db
    .select({ id: rolePermissions.id })
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId),
        isNull(rolePermissions.deletedAt)
      )
    )
    .limit(1);

  if (!existingAssignment) {
    return { ok: false, message: "The permission is not assigned to this role." };
  }

  // Remove permission from role
  await db
    .update(rolePermissions)
    .set({
      deletedAt: new Date(),
      deletedByUserId: currentActiveUser.id,
    })
    .where(eq(rolePermissions.id, existingAssignment.id));

  return {
    ok: true,
    message: "Permission removed from the role successfully.",
  };
}

// Form action for removing permission from role
export async function removePermissionFromRoleFromForm(
  _prevState: RemovePermissionFromRoleFormState,
  formData: FormData
): Promise<RemovePermissionFromRoleFormState> {
  const result = await removePermissionFromRole({
    roleId: Number(formData.get("roleId")),
    permissionId: Number(formData.get("permissionId")),
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidatePath("/roles");
  revalidatePath(`/roles/${formData.get("roleId")}/permissions`);

  return {
    status: "success",
    message: result.message,
  };
}
