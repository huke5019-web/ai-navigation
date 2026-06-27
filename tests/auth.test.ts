import { execFileSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { hash } from "bcryptjs";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const cookieValues = new Map<string, string>();
const cookieWrites: Array<{
  name: string;
  value: string;
  options?: Record<string, unknown>;
}> = [];

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieValues.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set: (
      name: string,
      value: string,
      options?: Record<string, unknown>,
    ) => {
      cookieValues.set(name, value);
      cookieWrites.push({ name, value, options });
    },
    delete: (name: string) => {
      cookieValues.delete(name);
    },
  }),
}));

const redirectMock = vi.fn((path: string): never => {
  throw new Error(`REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

const databaseName = `auth-${process.pid}-${Date.now()}.db`;
const databasePath = resolve("prisma", databaseName);
const databaseUrl = `file:./${databaseName}`;
const originalEnv = {
  ADMIN_USERNAME: process.env.ADMIN_USERNAME,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
  SESSION_SECRET: process.env.SESSION_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
};

let auth: typeof import("@/lib/auth");
let schemas: typeof import("@/lib/schemas");
let actions: typeof import("@/app/admin/actions");
let prisma: (typeof import("@/lib/prisma"))["prisma"];

beforeAll(async () => {
  process.env.DATABASE_URL = databaseUrl;
  process.env.ADMIN_USERNAME = "admin";
  process.env.ADMIN_PASSWORD_HASH = await hash("secret", 4);
  process.env.SESSION_SECRET = "test-session-secret-that-is-at-least-32-characters";
  writeFileSync(databasePath, "");

  execFileSync(
    process.execPath,
    [
      resolve("node_modules", "prisma", "build", "index.js"),
      "migrate",
      "deploy",
    ],
    {
      cwd: resolve("."),
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: "pipe",
    },
  );

  auth = await import("@/lib/auth");
  schemas = await import("@/lib/schemas");
  actions = await import("@/app/admin/actions");
  prisma = (await import("@/lib/prisma")).prisma;
});

beforeEach(async () => {
  cookieValues.clear();
  cookieWrites.length = 0;
  redirectMock.mockClear();
  await prisma.adminSession.deleteMany();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

afterAll(async () => {
  await prisma?.$disconnect();
  if (existsSync(databasePath)) {
    rmSync(databasePath, { force: true });
  }
  for (const suffix of ["-journal", "-shm", "-wal"]) {
    rmSync(`${databasePath}${suffix}`, { force: true });
  }

  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("admin authentication", () => {
  it("accepts only the configured username and password", async () => {
    await expect(auth.verifyAdminCredentials("admin", "secret")).resolves.toBe(true);
    await expect(auth.verifyAdminCredentials("wrong", "secret")).resolves.toBe(false);
    await expect(auth.verifyAdminCredentials("admin", "wrong")).resolves.toBe(false);
  });

  it("returns false when auth environment is missing", async () => {
    vi.stubEnv("ADMIN_USERNAME", "");
    await expect(auth.verifyAdminCredentials("admin", "secret")).resolves.toBe(false);
  });

  it("validates required authentication environment variables", () => {
    expect(() =>
      auth.parseAuthEnvironment({
        ADMIN_USERNAME: "admin",
        ADMIN_PASSWORD_HASH: "hash",
        SESSION_SECRET: "short",
      }),
    ).toThrow(/SESSION_SECRET/);
  });

  it("creates a signed session cookie", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await auth.createAdminSession();

    const rawToken = cookieValues.get("admin_session");
    expect(rawToken).toBeTruthy();
    expect(rawToken?.split(".")).toHaveLength(3);
    expect(cookieWrites.at(-1)).toMatchObject({
      name: "admin_session",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        maxAge: 7 * 24 * 60 * 60,
      },
    });
  });

  it("creates a reusable signed session value", () => {
    const value = auth.createSignedSessionValue("admin", Date.now() + 60_000);
    expect(value.split(".")).toHaveLength(3);
  });

  it("returns a valid session and rejects expired cookies", async () => {
    vi.stubEnv("NODE_ENV", "test");
    await auth.createAdminSession();
    await expect(auth.getAdminSession()).resolves.toMatchObject({
      username: "admin",
    });

    const expiredValue = auth.createSignedSessionValue("admin", Date.now() - 1_000);
    cookieValues.set("admin_session", expiredValue);
    await expect(auth.getAdminSession()).resolves.toBeNull();
  });

  it("rotates the current session cookie", async () => {
    await auth.createAdminSession();
    const previousToken = cookieValues.get("admin_session")!;

    await auth.createAdminSession();

    expect(cookieValues.get("admin_session")).not.toBe(previousToken);
  });

  it("uses a non-secure cookie outside production", async () => {
    vi.stubEnv("NODE_ENV", "test");
    await auth.createAdminSession();
    expect(cookieWrites.at(-1)?.options?.secure).toBe(false);
  });

  it("requires a session and destroys cookie state", async () => {
    await expect(auth.requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");

    await auth.createAdminSession();
    await expect(auth.requireAdmin()).resolves.toBeTruthy();
    await auth.destroyAdminSession();

    expect(cookieValues.has("admin_session")).toBe(false);
  });
});

describe("admin schemas", () => {
  it("validates login, category, and tool data", () => {
    expect(schemas.loginSchema.safeParse({ username: "admin", password: "secret" }).success).toBe(true);
    expect(
      schemas.categorySchema.safeParse({
        name: "AI Writing",
        slug: "writing",
        icon: "PenLine",
        sortOrder: "10",
        isActive: "on",
      }).success,
    ).toBe(true);
    expect(
      schemas.toolSchema.safeParse({
        categoryId: "1",
        name: "ChatGPT",
        slug: "chatgpt",
        logoUrl: "",
        summary: "Summary",
        description: "Description",
        websiteUrl: "https://chatgpt.com",
        tags: "chat, writing",
        sortOrder: "10",
        isActive: "on",
        isFeatured: "on",
      }).success,
    ).toBe(true);
    expect(
      schemas.toolSchema.safeParse({
        categoryId: 1,
        name: "Bad",
        slug: "bad",
        summary: "Summary",
        description: "Description",
        websiteUrl: "javascript:alert(1)",
      }).success,
    ).toBe(false);
  });

  it("preserves password whitespace", () => {
    const result = schemas.loginSchema.parse({
      username: " admin ",
      password: " secret ",
    });
    expect(result.username).toBe("admin");
    expect(result.password).toBe(" secret ");
  });

  it("accepts only HTTP(S) URLs and ordered advertisement dates", () => {
    const valid = {
      title: "Ad",
      imageUrl: "https://example.com/ad.png",
      targetUrl: "http://example.com",
      placement: "HOME_BANNER",
      startsAt: "2026-06-01",
      endsAt: "2026-06-30",
      sortOrder: "1",
      isActive: "on",
    };

    expect(schemas.adSchema.safeParse(valid).success).toBe(true);
    expect(
      schemas.adSchema.safeParse({
        ...valid,
        imageUrl: "data:image/png;base64,abc",
      }).success,
    ).toBe(false);
    expect(
      schemas.adSchema.safeParse({
        ...valid,
        startsAt: "2026-02-30",
      }).success,
    ).toBe(false);
    expect(
      schemas.adSchema.safeParse({
        ...valid,
        startsAt: "2026-07-01",
        endsAt: "2026-06-30",
      }).success,
    ).toBe(false);
  });

  it("validates site settings with an optional HTTP(S) logo", () => {
    expect(
      schemas.settingsSchema.safeParse({
        siteName: "AI Navigation",
        siteDescription: "Curated AI tools",
        logoUrl: "",
        footerText: "AI Navigation",
      }).success,
    ).toBe(true);
    expect(
      schemas.settingsSchema.safeParse({
        siteName: "AI Navigation",
        siteDescription: "Curated AI tools",
        logoUrl: "ftp://example.com/logo.png",
        footerText: "AI Navigation",
      }).success,
    ).toBe(false);
  });
});

describe("admin actions", () => {
  it("returns the same message for invalid form data and invalid credentials", async () => {
    const missing = await actions.loginAction({}, new FormData());
    const wrong = new FormData();
    wrong.set("username", "admin");
    wrong.set("password", "wrong");

    expect(missing).toEqual({ error: "Invalid username or password." });
    await expect(actions.loginAction({}, wrong)).resolves.toEqual({
      error: "Invalid username or password.",
    });
  });

  it("creates a session and redirects after a valid login", async () => {
    const formData = new FormData();
    formData.set("username", "admin");
    formData.set("password", "secret");

    await expect(actions.loginAction({}, formData)).rejects.toThrow(
      "REDIRECT:/admin",
    );
    expect(cookieValues.has("admin_session")).toBe(true);
  });

  it("destroys the session and redirects on logout", async () => {
    await auth.createAdminSession();
    await expect(actions.logoutAction()).rejects.toThrow(
      "REDIRECT:/admin/login",
    );
    expect(cookieValues.has("admin_session")).toBe(false);
  });

  it("returns a clear error when admin auth is not configured", async () => {
    vi.stubEnv("ADMIN_USERNAME", "");

    const formData = new FormData();
    formData.set("username", "admin");
    formData.set("password", "secret");

    await expect(actions.loginAction({}, formData)).resolves.toEqual({
      error: "Admin login is not configured yet.",
    });
  });
});
