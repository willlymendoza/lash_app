"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { roles } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

const createRoleSchema = z.object({
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

type CreateRoleFieldErrors = {
  name?: string[];
  description?: string[];
};

export type CreateRoleResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: CreateRoleFieldErrors };

export type CreateRoleFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: CreateRoleFieldErrors;
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

export async function createRole(input: unknown): Promise<CreateRoleResult> {
  await requirePermission("roles.create");

  const parsedInput = createRoleSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for creating the role.",
      fieldErrors: parsedInput.error.flatten().fieldErrors as CreateRoleFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { name, description } = parsedInput.data;
  const code = toRoleCode(name);

  if (!code) {
    return {
      ok: false,
      message: "Could not generate a valid role code.",
      fieldErrors: {
        name: ["Use a name containing letters or numbers."],
      },
    };
  }

  if (code === "superadmin") {
    return {
      ok: false,
      message: "The superadmin code is reserved by the system.",
      fieldErrors: {
        name: ["This name generates a reserved code."],
      },
    };
  }

  const [existingRole] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(
      and(
        isNull(roles.deletedAt),
        eq(roles.code, code)
      )
    )
    .limit(1);

  if (existingRole) {
    return {
      ok: false,
      message: "A role with this name or code already exists.",
      fieldErrors: {
        name: ["The name generates a code that already exists."],
      },
    };
  }

  await db.insert(roles).values({
    code,
    name,
    description: description || null,
    isSystem: false,
    isActive: true,
    createdByUserId: currentActiveUser.id,
    updatedByUserId: currentActiveUser.id,
  });

  return {
    ok: true,
    message: "Role created successfully.",
  };
}

export async function createRoleFromForm(
  _prevState: CreateRoleFormState,
  formData: FormData
): Promise<CreateRoleFormState> {
  const result = await createRole({
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
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
