import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils/format-date-time";
import type { RoleListItem } from "@/modules/roles/server/queries/get-roles";
import { EditRoleForm } from "./edit-role-form";
import { ToggleRoleForm } from "./toggle-role-form";
import Link from "next/link";

type RolesTableProps = {
  roles: RoleListItem[];
  canUpdateRoles?: boolean;
  canAssignPermissions?: boolean;
  canToggleActive?: boolean;
};

export function RolesTable({
  roles,
  canUpdateRoles = false,
  canAssignPermissions = false,
  canToggleActive = false,
}: RolesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Role</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role Type</TableHead>
          <TableHead>Last updated</TableHead>
          <TableHead>Edit</TableHead>
          <TableHead>Permissions</TableHead>
          <TableHead>Activate/Deactivate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="font-medium">{role.name}</TableCell>
            <TableCell>{role.code}</TableCell>
            <TableCell>
              <Badge variant={role.isActive ? "secondary" : "outline"}>
                {role.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                {role.isSystem ? (
                  <Badge variant="outline">System</Badge>
                ) : (
                  <Badge variant="outline">Operational</Badge>
                )}
              </div>
            </TableCell>
            <TableCell>{formatDateTime(role.updatedAt)}</TableCell>
            <TableCell>
              {!role.isSystem && canUpdateRoles ? (
                <EditRoleForm
                  roleId={role.id}
                  name={role.name}
                  description={role.description}
                />
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              {!role.isSystem && canAssignPermissions ? (
                <Link href={`/roles/${role.id}/permissions`}>
                  <Button size="sm" variant="outline" className="cursor-pointer">
                    Permissions
                  </Button>
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              {!role.isSystem && canToggleActive ? (
                <ToggleRoleForm
                  roleId={role.id}
                  isActive={role.isActive}
                />
              ) : (
                <span className="text-xs text-muted-foreground">Protected</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
