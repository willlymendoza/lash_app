"use server";

import { generateInitialPassword } from "@/lib/password";
import { getRequiredEnv } from "@/lib/env";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { user as authUsers, lashistProfiles, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getCurrentActiveUser } from "@/modules/auth/server/queries";
import { requirePermission } from "@/modules/permissions/server/queries";

const createUserSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email.")
    .min(1, "The email is required.")
    .max(255, "The email is too long.")
    .toLowerCase(),
  fullName: z
    .string()
    .trim()
    .min(3, "The name must contain at least 3 characters.")
    .max(120, "The name is too long."),
  phone: z
    .string()
    .trim()
    .max(8, "The phone number must contain at most 8 characters.")
    .regex(/^\d{8}$/, "The phone number must contain exactly 8 digits.")
    .optional()
    .or(z.literal("")),
  isLashist: z.boolean().optional(),
});

type CreateUserFieldErrors = {
  email?: string[];
  fullName?: string[];
  phone?: string[];
};

export type CreateUserResult =
  | { ok: true; message: string; initialPassword?: string }
  | { ok: false; message: string; fieldErrors?: CreateUserFieldErrors };

export type CreateUserFormState = {
  status: "idle" | "success" | "error";
  message: string | null;
  fieldErrors?: CreateUserFieldErrors;
  initialPassword?: string;
};

export async function createUser(input: unknown): Promise<CreateUserResult> {
  await requirePermission("users.create");

  const parsedInput = createUserSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      message: "Invalid data for creating the user.",
      fieldErrors: parsedInput.error.flatten().fieldErrors as CreateUserFieldErrors,
    };
  }

  const currentActiveUser = await getCurrentActiveUser();

  if (!currentActiveUser) {
    return { ok: false, message: "Could not validate the signed-in user." };
  }

  const { email, fullName, phone, isLashist } = parsedInput.data;

  // Require permission to assign a user as a lash artist
  if (isLashist) {
    await requirePermission("users.assign-lashist");
  }

  // Check if email already exists in auth users table
  const [existingAuthUser] = await db
    .select({ id: authUsers.id })
    .from(authUsers)
    .where(eq(authUsers.email, email))
    .limit(1);

  if (existingAuthUser) {
    return {
      ok: false,
      message: "The email is already registered in the system.",
      fieldErrors: { email: ["The email is already registered."] },
    };
  }

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

  // Generate initial password
  const initialPassword = generateInitialPassword();

  // Get BETTER_AUTH_URL from environment
  const baseUrl = getRequiredEnv("BETTER_AUTH_URL");

  // Create user in Better Auth
  try {
    await auth.api.signUpEmail({
      body: {
        name: fullName,
        email,
        password: initialPassword,
      },
      headers: new Headers({
        origin: baseUrl,
      }),
    });
  } catch (error) {
    console.error("Error creating user in Better Auth:", error);
    return { ok: false, message: "Error creating the user in the authentication system." };
  }

  // Create user in app users table
  const [newUser] = await db
    .insert(users)
    .values({
      fullName,
      email,
      phone: phone || null,
      isActive: true,
      createdByUserId: currentActiveUser.id,
      updatedByUserId: currentActiveUser.id,
    })
    .returning({ id: users.id, fullName: users.fullName, email: users.email });

  if (!newUser) {
    return { ok: false, message: "Error creating the user in the application." };
  }

  // Create lashist profile if isLashist is true
  if (isLashist) {
    await db.insert(lashistProfiles).values({
      userId: newUser.id,
      defaultCommissionType: "percent",
      defaultCommissionValue: 1,
      createdByUserId: currentActiveUser.id,
      updatedByUserId: currentActiveUser.id,
    });
  }

  return {
    ok: true,
    message: `User "${fullName}" created successfully.`,
    initialPassword,
  };
}

export async function createUserFromForm(
  _prevState: CreateUserFormState,
  formData: FormData
): Promise<CreateUserFormState> {
  const email = String(formData.get("email") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const phone = String(formData.get("phone") ?? "");
  const isLashist = String(formData.get("isLashist") ?? "false") === "true";

  const result = await createUser({
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
    initialPassword: result.initialPassword,
  };
}
