"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { user as authUsers, lashistProfiles, roles, userRoles, users } from "@/db/schema";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

const updateUserSchema = z.object({
  userId: z.number().int().positive(),
  email: z
    .string()
    .trim()
    .email("Invalid email.")
    .min(1, "The email is required.")
    .max(255, "The email is too long."),
  fullName: z
    .string()
    .trim()
    .min(3, "The name must contain at least 3 characters.")
    .max(120, "The name is too long."),
  phone: z
    .string()
    .trim()
    .max(40, "The phone number is too long.")
    .optional()
    .or(z.literal("")),
  isLashist: z.boolean().optional(),
});

type UpdateUserFieldErrors = {
  email?: string[];
  fullName?: string[];
  phone?: string[];
};

export type UpdateUserResult =
  | { ok: true; message: string }
  | { ok: false; message: string; fieldErrors?: UpdateUserFieldErrors };

export type UpdateUserFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: UpdateUserFieldErrors;
};

export async function updateUser(input: unknown): Promise<UpdateUserResult> {
  await requirePermission("users.update");

  const parsedInput = updateUserSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for updating the user.",
      fieldErrors: parsedInput.error.flatten().fieldErrors as UpdateUserFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { userId, email, fullName, phone, isLashist } = parsedInput.data;

  const [targetUser, existingLashistProfile, actorSuperadminMatch, targetAdminMatch] = await Promise.all([
    db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        createdByUserId: users.createdByUserId,
      })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1),
    db
      .select({ id: lashistProfiles.id })
      .from(lashistProfiles)
      .where(and(eq(lashistProfiles.userId, userId), isNull(lashistProfiles.deletedAt)))
      .limit(1),
    db
      .select({ id: userRoles.id })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(
        and(
          eq(userRoles.userId, currentActiveUser.id),
          isNull(userRoles.deletedAt),
          isNull(roles.deletedAt),
          eq(roles.isActive, true),
          eq(roles.code, "superadmin")
        )
      )
      .limit(1),
    db
      .select({ id: userRoles.id })
      .from(userRoles)
      .innerJoin(roles, eq(roles.id, userRoles.roleId))
      .where(
        and(
          eq(userRoles.userId, userId),
          isNull(userRoles.deletedAt),
          isNull(roles.deletedAt),
          eq(roles.isActive, true),
          eq(roles.code, "admin")
        )
      )
      .limit(1),
  ]);

  if (!targetUser[0]) {
    return { ok: false, message: "The user does not exist or is not available." };
  }

  // Check if email is being changed
  const emailChanged = targetUser[0].email !== email;

  if (emailChanged) {
    // Check if email already exists in app users table
    const [existingAppUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    if (existingAppUser) {
      return {
        ok: false,
        message: "The email is already registered in the system.",
        fieldErrors: { email: ["The email is already registered."] },
      };
    }

    // Check if email already exists in Better Auth users table
    const [existingAuthUser] = await db
      .select({ id: authUsers.id })
      .from(authUsers)
      .where(eq(authUsers.email, email))
      .limit(1);

    if (existingAuthUser) {
      return {
        ok: false,
        message: "The email is already registered in the authentication system.",
        fieldErrors: { email: ["The email is already registered."] },
      };
    }
  }

  const actorIsSuperadmin = Boolean(actorSuperadminMatch[0]);
  const targetIsAdmin = Boolean(targetAdminMatch[0]);
  const actorIsCreator = targetUser[0].createdByUserId === currentActiveUser.id;

  if (targetIsAdmin && !actorIsSuperadmin && !actorIsCreator) {
    return {
      ok: false,
      message: "Only the creator or a superadmin can edit this administrator.",
    };
  }

  // Check if isLashist is being changed
  const currentIsLashist = Boolean(existingLashistProfile[0]);
  const isLashistChanged = isLashist !== undefined && isLashist !== currentIsLashist;

  if (isLashistChanged) {
    await requirePermission("users.assign-lashist");
  }

  // Handle lashist profile creation/deletion
  if (isLashistChanged) {
    if (isLashist) {
      // Marking as lashist: create or reactivate profile
      const [allProfiles] = await db
        .select({ id: lashistProfiles.id })
        .from(lashistProfiles)
        .where(eq(lashistProfiles.userId, userId))
        .limit(1);

      if (allProfiles) {
        // Reactivate soft-deleted profile
        await db
          .update(lashistProfiles)
          .set({
            deletedAt: null,
            deletedByUserId: null,
            updatedAt: new Date(),
            updatedByUserId: currentActiveUser.id,
          })
          .where(eq(lashistProfiles.id, allProfiles.id));
      } else {
        // Create new profile
        await db.insert(lashistProfiles).values({
          userId,
          defaultCommissionType: "percent",
          defaultCommissionValue: 1,
          createdByUserId: currentActiveUser.id,
          updatedByUserId: currentActiveUser.id,
        });
      }
    } else {
      // Unmarking as lashist: soft-delete profile
      // TODO: Validate that the user doesn't have active/future appointments before allowing deactivation
      await db
        .update(lashistProfiles)
        .set({
          deletedAt: new Date(),
          deletedByUserId: currentActiveUser.id,
          updatedAt: new Date(),
          updatedByUserId: currentActiveUser.id,
        })
        .where(and(eq(lashistProfiles.userId, userId), isNull(lashistProfiles.deletedAt)));
    }
  }

  await db
    .update(users)
    .set({
      email,
      fullName,
      phone: phone || null,
      updatedAt: new Date(),
      updatedByUserId: currentActiveUser.id,
    })
    .where(eq(users.id, targetUser[0].id));

  // Update email in Better Auth users table if changed
  if (emailChanged) {
    try {
      await db
        .update(authUsers)
        .set({ email, name: fullName })
        .where(eq(authUsers.email, targetUser[0].email));
    } catch (error) {
      console.error("Error updating email in Better Auth:", error);
      return {
        ok: false,
        message: "The user was updated, but updating the email in the authentication system failed.",
      };
    }
  }

  return {
    ok: true,
    message: `User "${fullName}" updated successfully.`,
  };
}

export async function updateUserFromForm(
  _prevState: UpdateUserFormState,
  formData: FormData
): Promise<UpdateUserFormState> {
  const userId = Number(formData.get("userId"));
  const email = String(formData.get("email") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const isLashist = String(formData.get("isLashist") ?? "false") === "true";

  const result = await updateUser({
    userId,
    email,
    fullName,
    phone,
    isLashist,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  revalidatePath("/users");

  return {
    status: "success",
    message: result.message,
  };
}
