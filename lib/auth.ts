import { createHash, randomBytes } from "node:crypto";

import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

const authEnvironmentSchema = z.object({
  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD_HASH: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
});

export function parseAuthEnvironment(environment: {
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
}) {
  return authEnvironmentSchema.parse(environment);
}

function getAuthEnvironment() {
  return parseAuthEnvironment({
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
    SESSION_SECRET: process.env.SESSION_SECRET,
  });
}

export async function verifyAdminCredentials(username: string, password: string) {
  const environment = getAuthEnvironment();
  const passwordMatches = await compare(password, environment.ADMIN_PASSWORD_HASH);
  return username === environment.ADMIN_USERNAME && passwordMatches;
}

export function generateSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256")
    .update(`${getAuthEnvironment().SESSION_SECRET}:${token}`)
    .digest("hex");
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  const previousToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_MAX_AGE * 1000);
  const staleSessionFilters = [
    { expiresAt: { lte: new Date() } },
    ...(previousToken
      ? [{ tokenHash: hashSessionToken(previousToken) }]
      : []),
  ];

  await prisma.$transaction([
    prisma.adminSession.deleteMany({
      where: { OR: staleSessionFilters },
    }),
    prisma.adminSession.create({
      data: { tokenHash: hashSessionToken(token), expiresAt },
    }),
  ]);

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_MAX_AGE,
    expires: expiresAt,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
  });
  if (!session) return null;

  if (session.expiresAt <= new Date()) {
    await prisma.adminSession.deleteMany({ where: { id: session.id } });
    return null;
  }

  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({
      where: { tokenHash: hashSessionToken(token) },
    });
  }
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
