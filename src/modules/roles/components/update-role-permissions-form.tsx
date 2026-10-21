"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  updateRolePermissionsFromForm,
  type UpdateRolePermissionsFormState,
} from "@/modules/roles/server/actions/update-role-permissions";

type Permission = {
  id: number;
  key: string;
  module: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  isAssigned: boolean;
};

type UpdateRolePermissionsFormProps = {
  roleId: number;
  permissionsByModule: Record<string, Permission[]>;
};

const initialState: UpdateRolePermissionsFormState = {
  status: "idle",
  message: null,
};

export function UpdateRolePermissionsForm({
  roleId,
  permissionsByModule,
}: UpdateRolePermissionsFormProps) {
  const router = useRouter();
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    Object.values(permissionsByModule).forEach((permissions) => {
      permissions.forEach((permission) => {
        if (permission.isAssigned) {
          initial.add(permission.id);
        }
      });
    });
    return initial;
  });

  const [state, action, isPending] = useActionState(
    updateRolePermissionsFromForm,
    initialState
  );

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Permissions updated successfully.", {
        duration: 2000,
        closeButton: true,
        richColors: true,
      });
      router.refresh();
    }
  }, [state, router]);

  useEffect(() => {
    const initial = new Set<number>();
    Object.values(permissionsByModule).forEach((permissions) => {
      permissions.forEach((permission) => {
        if (permission.isAssigned) {
          initial.add(permission.id);
        }
      });
    });
    setSelectedPermissionIds(initial);
  }, [permissionsByModule]);

  const handlePermissionToggle = (permissionId: number, checked: boolean) => {
    const newSelected = new Set(selectedPermissionIds);
    if (checked) {
      newSelected.add(permissionId);
    } else {
      newSelected.delete(permissionId);
    }
    setSelectedPermissionIds(newSelected);
  };

  const handleModuleToggle = (modulePermissions: Permission[], checked: boolean) => {
    const newSelected = new Set(selectedPermissionIds);
    if (checked) {
      modulePermissions.forEach((p) => newSelected.add(p.id));
    } else {
      modulePermissions.forEach((p) => newSelected.delete(p.id));
    }
    setSelectedPermissionIds(newSelected);
  };

  const isModuleFullySelected = (modulePermissions: Permission[]) => {
    return modulePermissions.every((p) => selectedPermissionIds.has(p.id));
  };

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="roleId" value={roleId} />
      {Array.from(selectedPermissionIds).map((id) => (
        <input key={id} type="hidden" name="permissionIds" value={id} />
      ))}

      <div className="space-y-4">
        {Object.entries(permissionsByModule).map(([module, permissions]) => (
          <div key={module} className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`module-${module}`}
                checked={isModuleFullySelected(permissions)}
                onCheckedChange={(checked) => handleModuleToggle(permissions, checked === true)}
              />
              <h2 className="text-lg font-semibold">{module}</h2>
            </div>
            <div className="space-y-2">
              {permissions.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50"
                >
                  <Checkbox
                    id={`permission-${permission.id}`}
                    name={permission.key}
                    checked={selectedPermissionIds.has(permission.id)}
                    onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked === true)}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor={`permission-${permission.id}`}
                      className="cursor-pointer font-normal"
                    >
                      <span className="font-medium">{permission.name}</span>
                      {permission.description && (
                        <span className="text-sm text-muted-foreground ml-2">
                          - {permission.description}
                        </span>
                      )}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {state.message && state.status === "error" ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Link href="/roles">
          <Button type="button" variant="outline" className="cursor-pointer">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isPending} className="cursor-pointer">
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
