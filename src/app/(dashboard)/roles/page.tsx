import type { Metadata } from "next";

import { hasPermission, requirePermission } from "@/modules/permissions/server/queries";
import { CreateRoleForm } from "@/modules/roles/components/create-role-form";
import { RolesManagement } from "@/modules/roles/components/roles-management";

export const metadata: Metadata = {
  title: "Roles",
};

export default async function RolesPage() {
  await requirePermission("roles.read");
  const canCreateRoles = await hasPermission("roles.create");

  return (
    <div className="space-y-4">
      {canCreateRoles && <CreateRoleForm />}
      <RolesManagement />
    </div>
  );
}
