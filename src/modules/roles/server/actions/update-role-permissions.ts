"use server";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { permissions, rolePermissions, roles } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";
import { updateRolePermissionsSchema } from "@/modules/roles/schemas/role-permissions-schema";

export type UpdateRolePermissionsResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export type UpdateRolePermissionsFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function updateRolePermissions(input: unknown): Promise<UpdateRolePermissionsResult> {
  await requirePermission("permissions.assign");

  const parsedInput = updateRolePermissionsSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for updating role permissions.",
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { roleId, permissionIds } = parsedInput.data;

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

  // Get current permissions assigned to role
  const currentPermissions = await db
    .select({ permissionId: rolePermissions.permissionId })
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        isNull(rolePermissions.deletedAt)
      )
    );

  const currentPermissionIds = currentPermissions.map((p) => p.permissionId);

  // Calculate permissions to add and remove
  const permissionsToAdd = permissionIds.filter((id) => !currentPermissionIds.includes(id));
  const permissionsToRemove = currentPermissionIds.filter((id) => !permissionIds.includes(id));

  // If removing permissions, require permissions.remove permission
  if (permissionsToRemove.length > 0) {
    await requirePermission("permissions.remove");
  }

  // Use transaction to ensure atomicity
  await db.transaction(async (tx) => {
    // Remove permissions that are no longer in the new list
    if (permissionsToRemove.length > 0) {
      await tx
        .update(rolePermissions)
        .set({
          deletedAt: new Date(),
          deletedByUserId: currentActiveUser.id,
        })
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            inArray(rolePermissions.permissionId, permissionsToRemove),
            isNull(rolePermissions.deletedAt)
          )
        );
    }

    // Add new permissions
    if (permissionsToAdd.length > 0) {
      for (const permissionId of permissionsToAdd) {
        // Verify permission exists and is active
        const [permission] = await tx
          .select({ id: permissions.id })
          .from(permissions)
          .where(
            and(
              eq(permissions.id, permissionId),
              isNull(permissions.deletedAt)
            )
          )
          .limit(1);

        if (permission) {
          await tx.insert(rolePermissions).values({
            roleId,
            permissionId,
            createdByUserId: currentActiveUser.id,
            updatedByUserId: currentActiveUser.id,
          });
        }
      }
    }
  });

  return {
    ok: true,
    message: "Role permissions updated successfully.",
  };
}

export async function updateRolePermissionsFromForm(
  _prevState: UpdateRolePermissionsFormState,
  formData: FormData
): Promise<UpdateRolePermissionsFormState> {
  const permissionIds = formData.getAll("permissionIds").map((id) => Number(id));

  const result = await updateRolePermissions({
    roleId: Number(formData.get("roleId")),
    permissionIds,
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
