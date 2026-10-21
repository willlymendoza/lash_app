import { getSession } from "./get-session";

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return session.user;
}
