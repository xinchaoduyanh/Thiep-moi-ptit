import { cookies } from "next/headers";

const ADMIN_COOKIE = "ptit_admin";

function adminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

export async function isAdminLoggedIn() {
  const cookieStore = await cookies();
  const sessionSecret = adminSessionSecret();

  return Boolean(sessionSecret && cookieStore.get(ADMIN_COOKIE)?.value === sessionSecret);
}

export async function setAdminSession() {
  const cookieStore = await cookies();
  const sessionSecret = adminSessionSecret();

  if (!sessionSecret) {
    throw new Error("ADMIN_SESSION_SECRET is required");
  }

  cookieStore.set(ADMIN_COOKIE, sessionSecret, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(ADMIN_COOKIE);
}
