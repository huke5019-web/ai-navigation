import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
} from "@/lib/constants";

const authEnvironmentSchema = z.object({
  ADMIN_USERNAME: z.string().min(1),
  ADMIN_PASSWORD_HASH: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
});

type AuthEnvironment = z.infer<typeof authEnvironmentSchema>;

export function parseAuthEnvironment(environment: {
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD_HASH?: string;
  SESSION_SECRET?: string;
}) {
  return authEnvironmentSchema.parse(environment);
}

function getAuthEnvironmentSafe(): AuthEnvironment | null {
  const result = authEnvironmentSchema.safeParse({
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
    SESSION_SECRET: process.env.SESSION_SECRET,
  });

  return result.success ? result.data : null;
}

function getAuthEnvironment() {
  const environment = getAuthEnvironmentSafe();
  if (!environment) {
    throw new Error("Admin login is not configured yet.");
  }
  return environment;
}

function signSessionValue(username: string, expiresAt: number, secret: string) {
  return createHmac("sha256", secret)
    .update(`${username}.${expiresAt}`)
    .digest("base64url");
}

export function createSignedSessionValue(username: string, expiresAt: number) {
  return `${username}.${expiresAt}.${signSessionValue(username, expiresAt, getAuthEnvironment().SESSION_SECRET)}`;
}

export async function verifyAdminCredentials(username: string, password: string) {
  const environment = getAuthEnvironmentSafe();
  if (!environment) {
    return false;
  }

  const passwordMatches = await compare(password, environment.ADMIN_PASSWORD_HASH);
  return username === environment.ADMIN_USERNAME && passwordMatches;
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  const environment = getAuthEnvironment();
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE * 1000 + randomInt(1, 1000);
  const token = createSignedSessionValue(environment.ADMIN_USERNAME, expiresAt);

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: ADMIN_SESSION_MAX_AGE,
    expires: new Date(expiresAt),
  });
}

export async function getAdminSession() {
  const environment = getAuthEnvironmentSafe();
  if (!environment) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const [username, expiresRaw, signature] = token.split(".");
  if (!username || !expiresRaw || !signature) {
    return null;
  }

  const expiresAt = Number(expiresRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return null;
  }

  const expectedSignature = signSessionValue(username, expiresAt, environment.SESSION_SECRET);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  if (username !== environment.ADMIN_USERNAME) {
    return null;
  }

  return {
    username,
    expiresAt: new Date(expiresAt),
  };
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
