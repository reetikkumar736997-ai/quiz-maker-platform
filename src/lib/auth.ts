import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSessionSignature, isSignatureValid } from "@/lib/utils";

const SESSION_COOKIE = "quizmaker_admin_session";

function getSessionSecret() {
  return process.env.SESSION_SECRET ?? "dev-only-session-secret";
}

export async function createAdminSession(adminId: string) {
  const cookieStore = await cookies();
  const signature = createSessionSignature(adminId, getSessionSecret());

  cookieStore.set(SESSION_COOKIE, `${adminId}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;

  if (!session) {
    return null;
  }

  const [adminId, signature] = session.split(".");

  if (!adminId || !signature || !isSignatureValid(adminId, signature, getSessionSecret())) {
    return null;
  }

  return prisma.adminUser.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}

export async function requireAdminUser() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}
