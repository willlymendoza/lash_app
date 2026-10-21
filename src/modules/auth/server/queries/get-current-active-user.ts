import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";

import { getCurrentUser } from "./get-current-user";

export async function getCurrentActiveUser() {
  const authUser = await getCurrentUser();

  if (!authUser?.email) {
    return null;
  }

  const [appUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, authUser.email))
    .limit(1);

  if (!appUser || !appUser.isActive || appUser.deletedAt) {
    return null;
  }

  return appUser;
}
