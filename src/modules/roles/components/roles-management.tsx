import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasPermissions } from "@/modules/permissions/server/queries";
import { getRoles } from "@/modules/roles/server/queries/get-roles";

import { RolesTable } from "./roles-table";

export async function RolesManagement() {
  const [roles, permissions] = await Promise.all([
    getRoles(),
    hasPermissions(["roles.update", "permissions.assign", "roles.toggle-active"]),
  ]);

  const canUpdateRoles = permissions["roles.update"];
  const canAssignPermissions = permissions["permissions.assign"];
  const canToggleActive = permissions["roles.toggle-active"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System roles</CardTitle>
        <CardDescription>
          Manage available roles and their operational status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {roles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No roles available to display.
          </p>
        ) : (
          <RolesTable
            roles={roles}
            canUpdateRoles={canUpdateRoles}
            canAssignPermissions={canAssignPermissions}
            canToggleActive={canToggleActive}
          />
        )}
      </CardContent>
    </Card>
  );
}
