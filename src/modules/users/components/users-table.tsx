import { Badge } from "@/components/ui/badge";
import { StarIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssignUserRoleDialog } from "@/modules/users/components/assign-user-role-dialog";
import { EditUserDialog } from "@/modules/users/components/edit-user-dialog";
import { RemoveUserRoleForm } from "@/modules/users/components/remove-user-role-form";
import { ResetUserPasswordDialog } from "@/modules/users/components/reset-user-password-dialog";
import { ToggleUserActiveForm } from "@/modules/users/components/toggle-user-active-form";

type UserRow = {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isLashist: boolean;
  isSystem: boolean;
  roles: Array<{
    id: number;
    code: string;
    name: string;
    isSystem: boolean;
    isActive: boolean;
  }>;
};

type UsersTableProps = {
  users: UserRow[];
  currentUser: {
    id: number;
    fullName: string;
    email: string;
  } | null;
  canUpdateUsers: boolean;
  canToggleActive?: boolean;
  canAssignRoles?: boolean;
  canAssignLashist?: boolean;
  assignableRoles?: Array<{
    id: number;
    code: string;
    name: string;
    isSystem: boolean;
    isActive: boolean;
  }>;
  currentUserIsSuperadmin: boolean;
  canResetPassword: boolean;
};

export async function UsersTable({
  users,
  currentUser,
  canUpdateUsers,
  canToggleActive = false,
  canAssignRoles = false,
  canAssignLashist = false,
  assignableRoles = [],
  currentUserIsSuperadmin,
  canResetPassword = false,
}: UsersTableProps) {
  const currentUserId = currentUser?.id ?? null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead>Is Lash Artist</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Editing</TableHead>
          <TableHead>Activation</TableHead>
          <TableHead>Password</TableHead>
          <TableHead>Role assignment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone ?? "No phone number"}</TableCell>
              <TableCell>
                {user.roles.length === 0 ? (
                  <span className="text-xs text-muted-foreground">No role</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles.map((role) =>
                      canAssignRoles && user.id !== currentUserId ? (
                        <div
                          key={role.id}
                          className="flex items-center gap-1 rounded-md border px-2 py-1"
                        >
                          <Badge variant="outline">{role.name}</Badge>
                          {/* Solo superadmins pueden quitar rol superadmin */}
                          {role.code !== "superadmin" || currentUserIsSuperadmin ? (
                            <RemoveUserRoleForm userId={user.id} roleId={role.id} />
                          ) : null}
                        </div>
                      ) : (
                        <Badge key={role.id} variant="outline">
                          {role.name}
                        </Badge>
                      )
                    )}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {user.isLashist ? (
                  <StarIcon className="h-4 w-4 text-brand-600" />
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? "secondary" : "outline"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell>
                {canUpdateUsers ? (
                  user.isSystem && !currentUserIsSuperadmin ? (
                    <span className="text-xs text-muted-foreground">System</span>
                  ) : user.id === currentUserId ? (
                    <span className="text-xs text-muted-foreground">Your user</span>
                  ) : (
                    <EditUserDialog
                      userId={user.id}
                      email={user.email}
                      fullName={user.fullName}
                      phone={user.phone}
                      isLashist={user.isLashist}
                      canAssignLashist={canAssignLashist}
                    />
                  )
                ) : (
                  <span className="text-xs text-muted-foreground">No permission</span>
                )}
              </TableCell>
              <TableCell>
                {canToggleActive ? (
                  user.isSystem && !currentUserIsSuperadmin ? (
                    <span className="text-xs text-muted-foreground">System</span>
                  ) : user.id === currentUserId ? (
                    <span className="text-xs text-muted-foreground">Your user</span>
                  ) : (
                    <ToggleUserActiveForm userId={user.id} isActive={user.isActive} />
                  )
                ) : (
                  <span className="text-xs text-muted-foreground">No permission</span>
                )}
              </TableCell>
              <TableCell>
                {canResetPassword ? (
                  user.isSystem && !currentUserIsSuperadmin ? (
                    <span className="text-xs text-muted-foreground">System</span>
                  ) : user.id === currentUserId ? (
                    <span className="text-xs text-muted-foreground">Your user</span>
                  ) : (
                    <ResetUserPasswordDialog userId={user.id} fullName={user.fullName} />
                  )
                ) : (
                  <span className="text-xs text-muted-foreground">No permission</span>
                )}
              </TableCell>
              <TableCell>
                {canAssignRoles ? (
                  user.id === currentUserId ? (
                    <span className="text-xs text-muted-foreground">Your user</span>
                  ) : (
                    <AssignUserRoleDialog
                      userId={user.id}
                      fullName={user.fullName}
                      assignedRoleIds={user.roles.map((role) => role.id)}
                      assignableRoles={assignableRoles}
                      currentUserId={currentUserId ?? undefined}
                    />
                  )
                ) : (
                  <span className="text-xs text-muted-foreground">No permission</span>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
