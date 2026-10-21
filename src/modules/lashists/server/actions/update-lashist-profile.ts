"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { lashistProfiles } from "@/db/schema";
import { requirePermission } from "@/modules/permissions/server/queries";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import {
  updateLashistProfileSchema,
  type UpdateLashistProfileInput,
} from "@/modules/lashists/schemas/lashist-profile.schema";

type UpdateLashistProfileFieldErrors = Partial<
  Record<keyof z.infer<typeof updateLashistProfileSchema>, string[]>
>;

export type UpdateLashistProfileResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: UpdateLashistProfileFieldErrors };

export type UpdateLashistProfileFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: UpdateLashistProfileFieldErrors;
  values?: {
    defaultCommissionType: string;
    defaultCommissionValue: string;
    color: string;
  };
};

export async function updateLashistProfile(
  id: number,
  input: unknown,
): Promise<UpdateLashistProfileResult> {
  await requirePermission("lashists.update");

  const parsedInput = updateLashistProfileSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for updating the lash artist profile.",
      fieldErrors: parsedInput.error.flatten()
        .fieldErrors as UpdateLashistProfileFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const [existingProfile] = await db
    .select({ id: lashistProfiles.id })
    .from(lashistProfiles)
    .where(and(eq(lashistProfiles.id, id), isNull(lashistProfiles.deletedAt)))
    .limit(1);

  if (!existingProfile) {
    return { ok: false, message: "Lash artist profile not found or deleted." };
  }

  const { defaultCommissionType, defaultCommissionValue, color } = parsedInput.data;

  await db
    .update(lashistProfiles)
    .set({
      defaultCommissionType,
      defaultCommissionValue: String(defaultCommissionValue),
      color: color || null,
      updatedAt: new Date(),
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(lashistProfiles.id, id));

  return {
    ok: true,
    message: "Lash artist profile updated successfully.",
  };
}

export async function updateLashistProfileFromForm(
  _prevState: UpdateLashistProfileFormState,
  formData: FormData,
): Promise<UpdateLashistProfileFormState> {
  const id = Number(formData.get("id"));
  const defaultCommissionType = String(formData.get("defaultCommissionType") ?? "");
  const defaultCommissionValue = String(formData.get("defaultCommissionValue") ?? "");
  const color = String(formData.get("color") ?? "");

  const result = await updateLashistProfile(id, {
    defaultCommissionType,
    defaultCommissionValue,
    color: color || undefined,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
      values: {
        defaultCommissionType,
        defaultCommissionValue,
        color,
      },
    };
  }

  revalidatePath("/lashists");

  return {
    status: "success",
    message: result.message,
  };
}
