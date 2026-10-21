import Link from "next/link";

import { Button } from "@/components/ui/button";
import { UpdateRolePermissionsForm } from "./update-role-permissions-form";

type RolePermissionsManagementProps = {
  role: {
    id: number;
    code: string;
    name: string;
    description: string | null;
  };
  permissionsByModule: Record<any, any[]>;
};

export function RolePermissionsManagement({
  role,
  permissionsByModule,
}: RolePermissionsManagementProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Role permissions: {role.name}</h1>
        {role.description && (
          <p className="text-muted-foreground">{role.description}</p>
        )}
      </div>

      <UpdateRolePermissionsForm
        roleId={role.id}
        permissionsByModule={permissionsByModule}
      />
    </div>
  );
}
