import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { hasPermissions } from "@/modules/permissions/server/queries";
import { getRoles } from "@/modules/roles/server/queries/get-roles";
import { getUserRoles } from "@/modules/roles/server/queries/get-user-roles";
import { CreateUserDialog } from "@/modules/users/components/create-user-dialog";
import { UsersTable } from "@/modules/users/components/users-table";
import { getUsers } from "@/modules/users/server/queries/get-users";

export async function UsersManagement() {
  const [users, currentUser, permissions] = await Promise.all([
    getUsers(),
    getCurrentActiveUser(),
    hasPermissions([
      "users.create",
      "users.update",
      "users.toggle-active",
      "roles.assign",
      "users.reset-password",
      "users.assign-lashist",
    ]),
  ]);
  const canCreateUsers = permissions["users.create"];
  const canUpdateUsers = permissions["users.update"];
  const canToggleActive = permissions["users.toggle-active"];
  const canAssignRoles = permissions["roles.assign"];
  const canResetPassword = permissions["users.reset-password"];
  const canAssignLashist = permissions["users.assign-lashist"];
  const assignableRoles = canAssignRoles ? await getRoles() : [];

  // Get the current user's roles to check superadmin access
  const currentUserRoles = currentUser
    ? await getUserRoles(currentUser.id)
    : [];
  const currentUserIsSuperadmin = currentUserRoles.some(
    (role) => role.roleCode === "superadmin",
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>System users</CardTitle>
            <CardDescription>
              List of active and inactive users registered in the application.
            </CardDescription>
          </div>
          {canCreateUsers && <CreateUserDialog canAssignLashist={canAssignLashist} />}
        </div>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No users registered yet.
          </p>
        ) : (
          <UsersTable
            users={users}
            currentUser={currentUser}
            canUpdateUsers={canUpdateUsers}
            canToggleActive={canToggleActive}
            canAssignRoles={canAssignRoles}
            canAssignLashist={canAssignLashist}
            canResetPassword={canResetPassword}
            assignableRoles={assignableRoles}
            currentUserIsSuperadmin={currentUserIsSuperadmin}
          />
        )}
      </CardContent>
    </Card>
  );
}
