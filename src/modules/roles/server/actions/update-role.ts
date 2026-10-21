"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { roles } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

const updateRoleSchema = z.object({
  roleId: z.number().int().positive(),
  name: z
    .string()
    .trim()
    .min(2, "The name must contain at least 2 characters.")
    .max(80, "The name is too long."),
  description: z
    .string()
    .trim()
    .max(250, "The description is too long.")
    .optional()
    .or(z.literal("")),
});

type UpdateRoleFieldErrors = {
  name?: string[];
  description?: string[];
};

export type UpdateRoleResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: UpdateRoleFieldErrors };

export type UpdateRoleFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: UpdateRoleFieldErrors;
};

function toRoleCode(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function updateRole(input: unknown): Promise<UpdateRoleResult> {
  await requirePermission("roles.update");

  const parsedInput = updateRoleSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for updating the role.",
      fieldErrors: parsedInput.error.flatten().fieldErrors as UpdateRoleFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { roleId, name, description } = parsedInput.data;

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

  if (targetRole.isSystem) {
    return {
      ok: false,
      message: "System roles cannot be edited.",
    };
  }

  const nextCode = toRoleCode(name);

  if (!nextCode) {
    return {
      ok: false,
      message: "Could not generate a valid role code.",
      fieldErrors: {
        name: ["Use a name containing letters or numbers."],
      },
    };
  }

  const [existingRoleWithCode] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(and(eq(roles.code, nextCode), isNull(roles.deletedAt)))
    .limit(1);

  if (existingRoleWithCode && existingRoleWithCode.id !== roleId) {
    return {
      ok: false,
      message: "A role with this name or code already exists.",
      fieldErrors: {
        name: ["The name generates a code that already exists."],
      },
    };
  }

  await db
    .update(roles)
    .set({
      code: nextCode,
      name,
      description: description || null,
      updatedAt: new Date(),
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(roles.id, roleId));

  return {
    ok: true,
    message: `Role "${name}" updated successfully.`,
  };
}

export async function updateRoleFromForm(
  _prevState: UpdateRoleFormState,
  formData: FormData
): Promise<UpdateRoleFormState> {
  const roleId = Number(formData.get("roleId"));
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");

  const result = await updateRole({
    roleId,
    name,
    description,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/roles");

  return {
    status: "success",
    message: result.message,
  };
}
