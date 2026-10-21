import type { Metadata } from "next";

import { notFound } from "next/navigation";

import { requirePermission } from "@/modules/permissions/server/queries";
import { getPermissionsByRole } from "@/modules/permissions/server/queries/get-permissions-by-role";
import { getAvailablePermissions } from "@/modules/permissions/server/queries/get-available-permissions";
import { getRoleById } from "@/modules/roles/server/queries/get-role-by-id";
import { RolePermissionsManagement } from "@/modules/roles/components/role-permissions-management";

interface RolePermissionsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RolePermissionsPageProps): Promise<Metadata> {
  const { id } = await params;
  const role = await getRoleById(Number(id));

  if (!role) {
    return {
      title: "Role not found",
    };
  }

  return {
    title: `Permissions - ${role.name}`,
  };
}

export default async function RolePermissionsPage({ params }: RolePermissionsPageProps) {
  await requirePermission("permissions.assign");

  const { id } = await params;
  const roleId = Number(id);

  const [role, currentPermissions, availablePermissions] = await Promise.all([
    getRoleById(roleId),
    getPermissionsByRole(roleId),
    getAvailablePermissions(),
  ]);

  if (!role) {
    notFound();
  }

  const currentPermissionIds = new Set(currentPermissions.map((p) => p.id));

  const permissionsWithStatus = availablePermissions.map((permission) => ({
    ...permission,
    isAssigned: currentPermissionIds.has(permission.id),
  }));

  // Group permissions by module
  const permissionsByModule = permissionsWithStatus.reduce(
    (acc, permission) => {
      const module = permission.module;
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(permission);
      return acc;
    },
    {} as Record<string, typeof permissionsWithStatus>
  );

  return (
    <RolePermissionsManagement
      role={role}
      permissionsByModule={permissionsByModule}
    />
  );
}
