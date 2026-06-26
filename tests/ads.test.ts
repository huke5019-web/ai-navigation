import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { Advertisement } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

const originalDatabaseUrl = process.env.DATABASE_URL;
const databaseName = `test-ai-navigation-ads-${process.pid}-${randomUUID()}.db`;
const databasePath = path.join(process.cwd(), "prisma", "data", databaseName);
const databaseUrl = `file:./data/${databaseName}`;
const databaseFiles = [databasePath, `${databasePath}-wal`, `${databasePath}-shm`];
const now = new Date("2026-06-12T12:00:00.000Z");

function ad(overrides: Partial<Advertisement> = {}): Advertisement {
  return {
    id: 1,
    title: "Advertisement",
    imageUrl: "https://example.com/ad.png",
    targetUrl: "https://example.com/",
    placement: "HOME_BANNER",
    startsAt: null,
    endsAt: null,
    isActive: true,
    sortOrder: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("advertisement visibility", () => {
  let prisma: typeof import("@/lib/prisma").prisma;
  let ads: typeof import("@/lib/ads");

  beforeAll(async () => {
    process.env.DATABASE_URL = databaseUrl;
    mkdirSync(path.dirname(databasePath), { recursive: true });
    writeFileSync(databasePath, "");

    execFileSync(
      process.execPath,
      [path.join(process.cwd(), "node_modules", "prisma", "build", "index.js"), "migrate", "deploy"],
      {
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: databaseUrl },
        stdio: "pipe",
      },
    );

    ({ prisma } = await import("@/lib/prisma"));
    ads = await import("@/lib/ads");
  });

  beforeEach(async () => {
    await prisma.advertisement.deleteMany();
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    for (const file of databaseFiles) {
      if (existsSync(file)) {
        rmSync(file);
      }
    }

    if (originalDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = originalDatabaseUrl;
    }
  });

  test("treats active open-ended and current ads as visible", () => {
    expect(ads.isAdVisible(ad(), now)).toBe(true);
    expect(ads.isAdVisible(ad({ startsAt: now }), now)).toBe(true);
    expect(ads.isAdVisible(ad({ endsAt: now }), now)).toBe(true);
  });

  test("rejects disabled, future, and expired ads", () => {
    expect(ads.isAdVisible(ad({ isActive: false }), now)).toBe(false);
    expect(
      ads.isAdVisible(ad({ startsAt: new Date("2026-06-12T12:00:00.001Z") }), now),
    ).toBe(false);
    expect(
      ads.isAdVisible(ad({ endsAt: new Date("2026-06-12T11:59:59.999Z") }), now),
    ).toBe(false);
  });

  test("returns only visible ads for the placement in display order", async () => {
    await prisma.advertisement.createMany({
      data: [
        {
          title: "Second",
          imageUrl: "https://example.com/second.png",
          targetUrl: "https://example.com/second",
          placement: "HOME_BANNER",
          sortOrder: 20,
        },
        {
          title: "First",
          imageUrl: "https://example.com/first.png",
          targetUrl: "https://example.com/first",
          placement: "HOME_BANNER",
          startsAt: now,
          endsAt: now,
          sortOrder: 10,
        },
        {
          title: "Future",
          imageUrl: "https://example.com/future.png",
          targetUrl: "https://example.com/future",
          placement: "HOME_BANNER",
          startsAt: new Date("2026-06-12T12:00:00.001Z"),
          sortOrder: 0,
        },
        {
          title: "Expired",
          imageUrl: "https://example.com/expired.png",
          targetUrl: "https://example.com/expired",
          placement: "HOME_BANNER",
          endsAt: new Date("2026-06-12T11:59:59.999Z"),
          sortOrder: 0,
        },
        {
          title: "Disabled",
          imageUrl: "https://example.com/disabled.png",
          targetUrl: "https://example.com/disabled",
          placement: "HOME_BANNER",
          isActive: false,
          sortOrder: 0,
        },
        {
          title: "Other placement",
          imageUrl: "https://example.com/sidebar.png",
          targetUrl: "https://example.com/sidebar",
          placement: "HOME_SIDEBAR",
          sortOrder: 0,
        },
      ],
    });

    const visible = await ads.getVisibleAds("HOME_BANNER", now);

    expect(visible.map((item) => item.title)).toEqual(["First", "Second"]);
  });
});
