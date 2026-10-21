import { redirect } from "next/navigation";

import { getCurrentActiveUser } from "./get-current-active-user";
import { getSession } from "./get-session";

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const activeUser = await getCurrentActiveUser();

  if (!activeUser) {
    redirect("/login");
  }

  return session;
}
