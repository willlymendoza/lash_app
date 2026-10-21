"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { roles } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

const toggleRoleActiveSchema = z.object({
  roleId: z.number().int().positive(),
  isActive: z.boolean(),
});

export type ToggleRoleActiveResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function toggleRoleActive(
  input: unknown
): Promise<ToggleRoleActiveResult> {
  await requirePermission("roles.toggle-active");

  const parsedInput = toggleRoleActiveSchema.safeParse(input);

  if (!parsedInput.success) {
    return { ok: false, message: "Invalid data for updating the role." };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { roleId, isActive } = parsedInput.data;

  const [targetRole] = await db
    .select({
      id: roles.id,
      code: roles.code,
      name: roles.name,
      isSystem: roles.isSystem,
      isActive: roles.isActive,
    })
    .from(roles)
    .where(and(eq(roles.id, roleId), isNull(roles.deletedAt)))
    .limit(1);

  if (!targetRole) {
    return { ok: false, message: "The role does not exist or is no longer available." };
  }

  if (targetRole.isSystem && !isActive) {
    return {
      ok: false,
      message: "A system role cannot be deactivated.",
    };
  }

  if (targetRole.code === "superadmin" && !isActive) {
    return {
      ok: false,
      message: "The superadmin role cannot be deactivated.",
    };
  }

  if (targetRole.isActive === isActive) {
    return {
      ok: true,
      message: isActive ? "The role was already active." : "The role was already inactive.",
    };
  }

  await db
    .update(roles)
    .set({
      isActive,
      updatedAt: new Date(),
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(roles.id, targetRole.id));

  return {
    ok: true,
    message: isActive
      ? `Role "${targetRole.name}" activated successfully.`
      : `Role "${targetRole.name}" deactivated successfully.`,
  };
}

export type ToggleRoleActiveFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export async function toggleRoleActiveFromForm(
  _prevState: ToggleRoleActiveFormState,
  formData: FormData
): Promise<ToggleRoleActiveFormState> {
  const result = await toggleRoleActive({
    roleId: Number(formData.get("roleId")),
    isActive: formData.get("nextIsActive") === "true",
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
    };
  }

  revalidatePath("/roles");

  return {
    status: "success",
    message: result.message,
  };
}
