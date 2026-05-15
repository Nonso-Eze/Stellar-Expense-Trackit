// Simple session-based auth using cookies
// In production, replace with NextAuth or a proper auth solution

import { cookies } from "next/headers";
import { prisma } from "./db";

const SESSION_COOKIE = "ses_user";

/** Get the currently logged-in user from the session cookie */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  return prisma.user.findUnique({ where: { id: userId } });
}

/** Set the session cookie after login */
export function setSessionCookie(userId: string) {
  // This is called from API routes, not server components
  return { name: SESSION_COOKIE, value: userId };
}

export { SESSION_COOKIE };
