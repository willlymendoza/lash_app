"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { permissions, rolePermissions, roles } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

const addPermissionToRoleSchema = z.object({
  roleId: z.number().int().positive(),
  permissionId: z.number().int().positive(),
});

export type AddPermissionToRoleResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type AddPermissionToRoleFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function addPermissionToRole(input: unknown): Promise<AddPermissionToRoleResult> {
  await requirePermission("permissions.assign");

  const parsedInput = addPermissionToRoleSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for adding a permission to the role.",
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

  // Check if permission is already assigned to role
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

  if (existingAssignment) {
    return { ok: false, message: "The permission is already assigned to this role." };
  }

  // Add permission to role
  await db.insert(rolePermissions).values({
    roleId,
    permissionId,
    createdByUserId: currentActiveUser.id,
    updatedByUserId: currentActiveUser.id,
  });

  return {
    ok: true,
    message: "Permission added to the role successfully.",
  };
}

// Form action for adding permission to role
export async function addPermissionToRoleFromForm(
  _prevState: AddPermissionToRoleFormState,
  formData: FormData
): Promise<AddPermissionToRoleFormState> {
  const result = await addPermissionToRole({
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
