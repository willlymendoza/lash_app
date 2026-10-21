import "server-only";

import { redirect } from "next/navigation";

import { getCurrentActiveUser } from "@/modules/auth/server/queries/get-current-active-user";
import type { PermissionKey } from "@/scripts/permission-catalog";
import { getEffectivePermissionSetForUser } from "./get-effective-permission-set-for-user";
import { getUserRoles } from "@/modules/roles/server/queries/get-user-roles";

export const getEffectivePermissions = async () => {
  const currentUser = await getCurrentActiveUser();

  if (!currentUser) {
    return [] as PermissionKey[];
  }

  return Array.from(await getEffectivePermissionSetForUser(currentUser.id));
};

export const isAdminUser = async (userId: number) => {
  const userRoles = await getUserRoles(userId);
  return userRoles.some((role) => role.roleCode === "superadmin");
};

export const hasPermission = async (permissionKey: PermissionKey | PermissionKey[]): Promise<boolean | Record<PermissionKey, boolean>> => {
  if (Array.isArray(permissionKey)) {
    return hasPermissions(permissionKey);
  }

  const currentUser = await getCurrentActiveUser();

  if (!currentUser) {
    return false;
  }

  const isAdmin = await isAdminUser(currentUser.id);

  if (isAdmin) return true;

  const effectivePermissions = await getEffectivePermissions();
  return effectivePermissions.includes(permissionKey);
};

export const hasPermissions = async (permissionKeys: PermissionKey[]): Promise<Record<PermissionKey, boolean>> => {
  const currentUser = await getCurrentActiveUser();

  if (!currentUser) {
    return Object.fromEntries(permissionKeys.map((key) => [key, false])) as Record<PermissionKey, boolean>;
  }

  const isAdmin = await isAdminUser(currentUser.id);

  if (isAdmin) {
    return Object.fromEntries(permissionKeys.map((key) => [key, true])) as Record<PermissionKey, boolean>;
  }

  const effectivePermissions = await getEffectivePermissions();
  const result: Record<PermissionKey, boolean> = {} as Record<PermissionKey, boolean>;

  for (const key of permissionKeys) {
    result[key] = effectivePermissions.includes(key);
  }

  return result;
};

export const requirePermission = async (permissionKey: PermissionKey) => {
  const currentUser = await getCurrentActiveUser();
  
  if (!currentUser) {
    redirect("/access-denied");
  }

  const isAdmin = await isAdminUser(currentUser.id);
  
  if (isAdmin) return true;
  
  const hasPerm = await hasPermission(permissionKey);
  
  if (!hasPerm) {
    redirect("/access-denied");
  }

  return true;
};
