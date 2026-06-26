import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";

const originalDatabaseUrl = process.env.DATABASE_URL;
const databaseName = `test-ai-navigation-${process.pid}-${randomUUID()}.db`;
const databasePath = path.join(process.cwd(), "prisma", "data", databaseName);
const databaseUrl = `file:./data/${databaseName}`;
const databaseFiles = [databasePath, `${databasePath}-wal`, `${databasePath}-shm`];

describe("database seed", () => {
  let prisma: typeof import("@/lib/prisma").prisma;
  let seed: typeof import("@/prisma/seed").seed;
  let queries: typeof import("@/lib/queries");

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
    ({ seed } = await import("@/prisma/seed"));
    queries = await import("@/lib/queries");
  });

  beforeEach(async () => {
    await prisma.adminSession.deleteMany();
    await prisma.toolTag.deleteMany();
    await prisma.tool.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();
    await prisma.advertisement.deleteMany();
    await prisma.siteSetting.deleteMany();
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

  test("uses an isolated database for this test process", () => {
    expect(databaseName).toContain(`-${process.pid}-`);
    expect(databasePath).not.toContain("ai-navigation.db");
    expect(process.env.DATABASE_URL).toBe(databaseUrl);
  });

  test("rolls back every seed write when a later write fails", async () => {
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER fail_advertisement_seed
      BEFORE INSERT ON Advertisement
      BEGIN
        SELECT RAISE(ABORT, 'forced seed failure');
      END;
    `);

    let counts: number[];
    try {
      await expect(seed(prisma)).rejects.toThrow();
      counts = await Promise.all([
        prisma.category.count(),
        prisma.tool.count(),
        prisma.tag.count(),
        prisma.toolTag.count(),
        prisma.advertisement.count(),
        prisma.siteSetting.count(),
      ]);
    } finally {
      await prisma.$executeRawUnsafe("DROP TRIGGER fail_advertisement_seed");
    }

    expect(counts!).toEqual([0, 0, 0, 0, 0, 0]);
  });

  test("seeds the navigation catalog idempotently", async () => {
    await seed(prisma);

    const categoryCounts = await prisma.category.findMany({
      where: { slug: { in: ["chat", "writing", "image", "coding"] } },
      orderBy: { sortOrder: "asc" },
      select: {
        name: true,
        slug: true,
        _count: { select: { tools: true } },
      },
    });
    const catalogTools = await prisma.tool.findMany({
      where: {
        category: { slug: { in: ["chat", "writing", "image", "coding"] } },
      },
      select: { slug: true, logoUrl: true },
    });

    expect(categoryCounts).toEqual([
      { name: "AI 对话", slug: "chat", _count: { tools: 10 } },
      { name: "AI 写作", slug: "writing", _count: { tools: 10 } },
      { name: "图像生成", slug: "image", _count: { tools: 10 } },
      { name: "编程开发", slug: "coding", _count: { tools: 10 } },
    ]);
    expect(catalogTools).toHaveLength(40);
    expect(new Set(catalogTools.map(({ slug }) => slug)).size).toBe(40);
    expect(
      catalogTools.every(({ logoUrl }) => logoUrl?.startsWith("https://")),
    ).toBe(true);

    const firstCounts = {
      categories: await prisma.category.count(),
      tools: await prisma.tool.count(),
      tags: await prisma.tag.count(),
      toolTags: await prisma.toolTag.count(),
      advertisements: await prisma.advertisement.count(),
      siteSettings: await prisma.siteSetting.count(),
    };

    expect(firstCounts.categories).toBeGreaterThan(0);
    expect(firstCounts.tools).toBeGreaterThan(0);
    expect(firstCounts.tags).toBeGreaterThan(0);
    expect(firstCounts.toolTags).toBeGreaterThan(0);
    expect(firstCounts.advertisements).toBeGreaterThan(0);
    expect(firstCounts.siteSettings).toBe(1);
    await expect(prisma.siteSetting.findUnique({ where: { id: 1 } })).resolves.toMatchObject({
      id: 1,
      siteName: "AI 导航",
    });

    const customCategory = await prisma.category.create({
      data: { name: "自定义", slug: "custom", sortOrder: 100 },
    });
    await prisma.tool.create({
      data: {
        categoryId: customCategory.id,
        name: "内部工具",
        slug: "internal-tool",
        summary: "后台手工添加",
        description: "不得被目录同步删除或修改。",
        websiteUrl: "https://example.com/internal",
      },
    });
    await prisma.siteSetting.update({
      where: { id: 1 },
      data: { siteDescription: "管理员修改后的简介" },
    });
    await prisma.advertisement.update({
      where: { id: 1 },
      data: { title: "管理员修改后的广告" },
    });

    await seed(prisma);

    await expect(prisma.tool.findUnique({ where: { slug: "internal-tool" } }))
      .resolves.toMatchObject({ name: "内部工具" });
    await expect(prisma.siteSetting.findUnique({ where: { id: 1 } }))
      .resolves.toMatchObject({ siteDescription: "管理员修改后的简介" });
    await expect(prisma.advertisement.findUnique({ where: { id: 1 } }))
      .resolves.toMatchObject({ title: "管理员修改后的广告" });
    await expect(prisma.category.count()).resolves.toBe(firstCounts.categories + 1);
    await expect(prisma.tool.count()).resolves.toBe(firstCounts.tools + 1);
    await expect(prisma.tag.count()).resolves.toBe(firstCounts.tags);
    await expect(prisma.toolTag.count()).resolves.toBe(firstCounts.toolTags);
    await expect(prisma.advertisement.count()).resolves.toBe(
      firstCounts.advertisements,
    );
    await expect(prisma.siteSetting.count()).resolves.toBe(
      firstCounts.siteSettings,
    );
  });

  test("returns singleton settings and active categories in display order", async () => {
    await prisma.siteSetting.create({
      data: {
        id: 1,
        siteName: "AI 导航",
        siteDescription: "精选工具",
        footerText: "Footer",
      },
    });
    await prisma.category.createMany({
      data: [
        { name: "后排", slug: "later", sortOrder: 20, isActive: true },
        { name: "隐藏", slug: "hidden", sortOrder: 0, isActive: false },
        { name: "前排", slug: "first", sortOrder: 10, isActive: true },
      ],
    });

    await expect(queries.getSiteSetting()).resolves.toMatchObject({
      id: 1,
      siteName: "AI 导航",
    });
    await expect(queries.getActiveCategories()).resolves.toEqual([
      expect.objectContaining({ slug: "first" }),
      expect.objectContaining({ slug: "later" }),
    ]);
  });

  test("filters active tools by category and a case-insensitive keyword", async () => {
    const writing = await prisma.category.create({
      data: { name: "写作", slug: "writing", sortOrder: 10 },
    });
    const coding = await prisma.category.create({
      data: { name: "编程", slug: "coding", sortOrder: 20 },
    });
    await prisma.tool.createMany({
      data: [
        {
          categoryId: writing.id,
          name: "Draft Pilot",
          slug: "draft-pilot",
          summary: "Smart copy assistant",
          description: "Writing",
          websiteUrl: "https://example.com/draft",
          sortOrder: 20,
        },
        {
          categoryId: writing.id,
          name: "Quiet Editor",
          slug: "quiet-editor",
          summary: "Polish prose",
          description: "Editing",
          websiteUrl: "https://example.com/editor",
          sortOrder: 10,
        },
        {
          categoryId: coding.id,
          name: "Code Pilot",
          slug: "code-pilot",
          summary: "Smart coding assistant",
          description: "Coding",
          websiteUrl: "https://example.com/code",
          sortOrder: 0,
        },
      ],
    });

    const tools = await queries.getTools({ category: "writing", query: "SMART" });

    expect(tools).toHaveLength(1);
    expect(tools[0]).toMatchObject({
      slug: "draft-pilot",
      category: { slug: "writing" },
      tags: [],
    });
  });

  test("matches tag names and always excludes inactive tools", async () => {
    const category = await prisma.category.create({
      data: { name: "图像", slug: "image" },
    });
    const tag = await prisma.tag.create({
      data: { name: "Concept Art", slug: "concept-art" },
    });
    const active = await prisma.tool.create({
      data: {
        categoryId: category.id,
        name: "Canvas",
        slug: "canvas",
        summary: "Image studio",
        description: "Active",
        websiteUrl: "https://example.com/canvas",
        tags: { create: { tagId: tag.id } },
      },
    });
    await prisma.tool.create({
      data: {
        categoryId: category.id,
        name: "Hidden Concept Art",
        slug: "hidden-art",
        summary: "Inactive",
        description: "Inactive",
        websiteUrl: "https://example.com/hidden",
        isActive: false,
        tags: { create: { tagId: tag.id } },
      },
    });

    const tools = await queries.getTools({ query: "concept art" });

    expect(tools.map((tool) => tool.id)).toEqual([active.id]);
    expect(tools[0].tags[0].tag.name).toBe("Concept Art");
  });

  test("matches tool names and orders ordinary results with relations", async () => {
    const category = await prisma.category.create({
      data: { name: "Search", slug: "search" },
    });
    const tag = await prisma.tag.create({
      data: { name: "Assistant", slug: "assistant" },
    });
    const later = await prisma.tool.create({
      data: {
        categoryId: category.id,
        name: "Pilot Later",
        slug: "pilot-later",
        summary: "Later",
        description: "Later",
        websiteUrl: "https://example.com/later",
        sortOrder: 20,
      },
    });
    const first = await prisma.tool.create({
      data: {
        categoryId: category.id,
        name: "Pilot First",
        slug: "pilot-first",
        summary: "First",
        description: "First",
        websiteUrl: "https://example.com/first",
        sortOrder: 10,
        tags: { create: { tagId: tag.id } },
      },
    });

    const tools = await queries.getTools({ query: "PILOT" });

    expect(tools.map((tool) => tool.id)).toEqual([first.id, later.id]);
    expect(tools[0]).toMatchObject({
      category: { slug: "search" },
      tags: [{ tag: { slug: "assistant" } }],
    });
  });

  test("never exposes tools that belong to inactive categories", async () => {
    const visibleCategory = await prisma.category.create({
      data: { name: "Visible", slug: "visible" },
    });
    const hiddenCategory = await prisma.category.create({
      data: { name: "Hidden", slug: "hidden", isActive: false },
    });
    const visible = await prisma.tool.create({
      data: {
        categoryId: visibleCategory.id,
        name: "Visible Tool",
        slug: "visible-tool",
        summary: "Visible",
        description: "Visible",
        websiteUrl: "https://example.com/visible",
        isFeatured: true,
      },
    });
    const hidden = await prisma.tool.create({
      data: {
        categoryId: hiddenCategory.id,
        name: "Hidden Tool",
        slug: "hidden-tool",
        summary: "Hidden",
        description: "Hidden",
        websiteUrl: "https://example.com/hidden",
        isFeatured: true,
      },
    });

    await expect(queries.getTools()).resolves.toEqual([
      expect.objectContaining({ id: visible.id }),
    ]);
    await expect(queries.getFeaturedTools()).resolves.toEqual([
      expect.objectContaining({ id: visible.id }),
    ]);
    await expect(queries.getToolBySlug(hidden.slug)).resolves.toBeNull();
    await expect(
      queries.getRelatedTools(hiddenCategory.id, -1),
    ).resolves.toEqual([]);
    await expect(
      queries.getDashboardStats(new Date("2026-06-12T12:00:00.000Z")),
    ).resolves.toMatchObject({ featuredTools: 1 });
  });

  test("returns featured tools in display order with relations", async () => {
    const category = await prisma.category.create({
      data: { name: "对话", slug: "chat" },
    });
    await prisma.tool.createMany({
      data: [
        {
          categoryId: category.id,
          name: "Second",
          slug: "second",
          summary: "Second",
          description: "Second",
          websiteUrl: "https://example.com/second",
          isFeatured: true,
          sortOrder: 20,
        },
        {
          categoryId: category.id,
          name: "First",
          slug: "first",
          summary: "First",
          description: "First",
          websiteUrl: "https://example.com/first",
          isFeatured: true,
          sortOrder: 10,
        },
        {
          categoryId: category.id,
          name: "Inactive",
          slug: "inactive",
          summary: "Inactive",
          description: "Inactive",
          websiteUrl: "https://example.com/inactive",
          isFeatured: true,
          isActive: false,
        },
      ],
    });

    const tools = await queries.getFeaturedTools();

    expect(tools.map((tool) => tool.slug)).toEqual(["first", "second"]);
    expect(tools[0]).toMatchObject({ category: { slug: "chat" }, tags: [] });
  });

  test("returns active tool details and related active tools from its category", async () => {
    const category = await prisma.category.create({
      data: { name: "编程", slug: "coding" },
    });
    const selected = await prisma.tool.create({
      data: {
        categoryId: category.id,
        name: "Selected",
        slug: "selected",
        summary: "Selected",
        description: "Selected",
        websiteUrl: "https://example.com/selected",
      },
    });
    await prisma.tool.createMany({
      data: [
        {
          categoryId: category.id,
          name: "Later",
          slug: "later",
          summary: "Later",
          description: "Later",
          websiteUrl: "https://example.com/later",
          sortOrder: 20,
        },
        {
          categoryId: category.id,
          name: "Sooner",
          slug: "sooner",
          summary: "Sooner",
          description: "Sooner",
          websiteUrl: "https://example.com/sooner",
          sortOrder: 10,
        },
        {
          categoryId: category.id,
          name: "Hidden",
          slug: "hidden-related",
          summary: "Hidden",
          description: "Hidden",
          websiteUrl: "https://example.com/hidden-related",
          isActive: false,
        },
      ],
    });

    await expect(queries.getToolBySlug("selected")).resolves.toMatchObject({
      id: selected.id,
      category: { slug: "coding" },
      tags: [],
    });
    await expect(queries.getToolBySlug("hidden-related")).resolves.toBeNull();
    await expect(queries.getRelatedTools(category.id, selected.id)).resolves.toEqual([
      expect.objectContaining({
        slug: "sooner",
        category: expect.objectContaining({ slug: "coding" }),
        tags: [],
      }),
      expect.objectContaining({ slug: "later" }),
    ]);
  });

  test("returns dashboard totals for tools, active categories, visible ads, and featured tools", async () => {
    const now = new Date("2026-06-12T12:00:00.000Z");
    const activeCategory = await prisma.category.create({
      data: { name: "Active", slug: "active" },
    });
    await prisma.category.create({
      data: { name: "Inactive", slug: "inactive-category", isActive: false },
    });
    await prisma.tool.createMany({
      data: [
        {
          categoryId: activeCategory.id,
          name: "Featured",
          slug: "featured",
          summary: "Featured",
          description: "Featured",
          websiteUrl: "https://example.com/featured",
          isFeatured: true,
        },
        {
          categoryId: activeCategory.id,
          name: "Inactive Featured",
          slug: "inactive-featured",
          summary: "Inactive",
          description: "Inactive",
          websiteUrl: "https://example.com/inactive-featured",
          isFeatured: true,
          isActive: false,
        },
      ],
    });
    await prisma.advertisement.createMany({
      data: [
        {
          title: "Current",
          imageUrl: "https://example.com/current.png",
          targetUrl: "https://example.com/current",
          placement: "HOME_BANNER",
          startsAt: now,
          endsAt: now,
        },
        {
          title: "Future",
          imageUrl: "https://example.com/future.png",
          targetUrl: "https://example.com/future",
          placement: "HOME_SIDEBAR",
          startsAt: new Date("2026-06-12T12:00:01.000Z"),
        },
      ],
    });

    await expect(queries.getDashboardStats(now)).resolves.toEqual({
      totalTools: 2,
      activeCategories: 1,
      visibleAds: 1,
      featuredTools: 1,
    });
  });
});
