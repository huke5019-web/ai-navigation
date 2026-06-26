import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const { requireAdminMock, revalidatePathMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, requireAdmin: requireAdminMock };
});

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string): never => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

const originalDatabaseUrl = process.env.DATABASE_URL;
const databaseName = `mutations-${process.pid}-${randomUUID()}.db`;
const databasePath = path.join(process.cwd(), "prisma", "data", databaseName);
const databaseUrl = `file:./data/${databaseName}`;
const databaseFiles = [databasePath, `${databasePath}-journal`, `${databasePath}-wal`, `${databasePath}-shm`];

let prisma: typeof import("@/lib/prisma").prisma;
let mutations: typeof import("@/lib/mutations");
let actions: typeof import("@/app/admin/actions");

function categoryInput(overrides: Record<string, unknown> = {}) {
  return {
    name: "Writing",
    slug: "writing",
    icon: "PenLine",
    sortOrder: 10,
    isActive: true,
    ...overrides,
  };
}

function toolInput(categoryId: number, overrides: Record<string, unknown> = {}) {
  return {
    categoryId,
    name: "Draft Pilot",
    slug: "draft-pilot",
    logoUrl: "",
    summary: "AI writing assistant",
    description: "Creates and edits drafts.",
    websiteUrl: "https://example.com/draft",
    tags: "Writing, Productivity, writing",
    sortOrder: 10,
    isActive: true,
    isFeatured: false,
    ...overrides,
  };
}

function adInput(overrides: Record<string, unknown> = {}) {
  return {
    title: "Homepage sponsor",
    imageUrl: "https://example.com/ad.png",
    targetUrl: "https://example.com/sponsor",
    placement: "HOME_BANNER",
    startsAt: "2026-06-01",
    endsAt: "2026-06-30",
    sortOrder: 10,
    isActive: true,
    ...overrides,
  };
}

function toFormData(input: Record<string, unknown>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(input)) {
    if (value === true) {
      formData.set(key, "on");
    } else if (value !== false && value !== null && value !== undefined) {
      formData.set(key, String(value));
    }
  }
  return formData;
}

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
  mutations = await import("@/lib/mutations");
  actions = await import("@/app/admin/actions");
});

beforeEach(async () => {
  requireAdminMock.mockReset();
  requireAdminMock.mockResolvedValue({ id: "session" });
  revalidatePathMock.mockReset();

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
    if (existsSync(file)) rmSync(file, { force: true });
  }

  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
});

describe("category mutations", () => {
  it("creates, updates, and deletes a category", async () => {
    const created = await mutations.createCategory(categoryInput());
    expect(created).toMatchObject({ name: "Writing", slug: "writing" });

    const updated = await mutations.updateCategory(
      created.id,
      categoryInput({ name: "AI Writing", slug: "ai-writing", isActive: false }),
    );
    expect(updated).toMatchObject({
      id: created.id,
      name: "AI Writing",
      slug: "ai-writing",
      isActive: false,
    });

    await mutations.deleteCategory(created.id);
    await expect(prisma.category.findUnique({ where: { id: created.id } })).resolves.toBeNull();
  });

  it("prevents deleting a category that still has tools", async () => {
    const category = await prisma.category.create({ data: categoryInput() });
    const input = toolInput(category.id);
    const toolData = {
      categoryId: input.categoryId,
      name: input.name,
      slug: input.slug,
      logoUrl: input.logoUrl,
      summary: input.summary,
      description: input.description,
      websiteUrl: input.websiteUrl,
      sortOrder: input.sortOrder,
      isActive: input.isActive,
      isFeatured: input.isFeatured,
    };
    await prisma.tool.create({ data: toolData });

    await expect(mutations.deleteCategory(category.id)).rejects.toThrow(
      "请先转移或删除该分类下的工具",
    );
    await expect(prisma.category.findUnique({ where: { id: category.id } })).resolves.toBeTruthy();
  });
});

describe("tool mutations", () => {
  it("creates and updates a tool with normalized tag relations", async () => {
    const category = await prisma.category.create({ data: categoryInput() });

    const created = await mutations.createTool(toolInput(category.id));
    await expect(
      prisma.tool.findUnique({
        where: { id: created.id },
        include: { tags: { include: { tag: true } } },
      }),
    ).resolves.toMatchObject({
      slug: "draft-pilot",
      tags: [
        { tag: { name: "Writing", slug: "writing" } },
        { tag: { name: "Productivity", slug: "productivity" } },
      ],
    });

    const updated = await mutations.updateTool(
      created.id,
      toolInput(category.id, {
        slug: "draft-pilot-pro",
        tags: "Editing, Research",
        isFeatured: true,
      }),
    );
    expect(updated.slug).toBe("draft-pilot-pro");
    await expect(
      prisma.tool.findUnique({
        where: { id: created.id },
        include: { tags: { include: { tag: true } }, category: true },
      }),
    ).resolves.toMatchObject({
      slug: "draft-pilot-pro",
      isFeatured: true,
      category: { id: category.id },
      tags: [
        { tag: { slug: "editing" } },
        { tag: { slug: "research" } },
      ],
    });

    await mutations.deleteTool(created.id);
    await expect(prisma.tool.findUnique({ where: { id: created.id } })).resolves.toBeNull();
  });

  it("rejects duplicate tool slugs with a slug field error", async () => {
    const category = await prisma.category.create({ data: categoryInput() });
    await mutations.createTool(toolInput(category.id));

    await expect(
      mutations.createTool(toolInput(category.id, { name: "Another Tool" })),
    ).rejects.toMatchObject({
      fieldErrors: { slug: expect.any(Array) },
    });
  });
});

describe("advertisement and setting mutations", () => {
  it("creates, updates, and deletes an advertisement with valid dates", async () => {
    const created = await mutations.createAdvertisement(adInput());
    expect(created).toMatchObject({
      placement: "HOME_BANNER",
      startsAt: new Date("2026-06-01"),
      endsAt: new Date("2026-06-30"),
    });

    const updated = await mutations.updateAdvertisement(
      created.id,
      adInput({ title: "Sidebar sponsor", placement: "HOME_SIDEBAR", endsAt: "" }),
    );
    expect(updated).toMatchObject({
      title: "Sidebar sponsor",
      placement: "HOME_SIDEBAR",
      endsAt: null,
    });

    await mutations.deleteAdvertisement(created.id);
    await expect(
      prisma.advertisement.findUnique({ where: { id: created.id } }),
    ).resolves.toBeNull();
  });

  it("rejects an advertisement whose end date precedes its start date", async () => {
    await expect(
      mutations.createAdvertisement(
        adInput({ startsAt: "2026-07-01", endsAt: "2026-06-30" }),
      ),
    ).rejects.toMatchObject({
      fieldErrors: { endsAt: expect.any(Array) },
    });
    await expect(prisma.advertisement.count()).resolves.toBe(0);
  });

  it("updates only the singleton site setting", async () => {
    await mutations.updateSiteSetting({
      siteName: "AI 导航",
      siteDescription: "精选 AI 工具",
      logoUrl: "",
      footerText: "AI 导航",
    });
    await mutations.updateSiteSetting({
      siteName: "AI 工具导航",
      siteDescription: "发现好用的 AI 工具",
      logoUrl: "https://example.com/logo.png",
      footerText: "Copyright",
    });

    await expect(prisma.siteSetting.count()).resolves.toBe(1);
    await expect(prisma.siteSetting.findUnique({ where: { id: 1 } })).resolves.toMatchObject({
      id: 1,
      siteName: "AI 工具导航",
      logoUrl: "https://example.com/logo.png",
    });
  });
});

describe("authenticated server actions", () => {
  it("requires an admin before every CRUD write action", async () => {
    const category = toFormData(categoryInput());
    const tool = toFormData(toolInput(1));
    const advertisement = toFormData(adInput());
    const settings = toFormData({
      siteName: "AI 导航",
      siteDescription: "精选 AI 工具",
      logoUrl: "",
      footerText: "AI 导航",
    });
    const calls: Array<() => Promise<unknown>> = [
      () => actions.createCategoryAction({}, category),
      () => actions.updateCategoryAction(1, {}, category),
      () => actions.deleteCategoryAction(1),
      () => actions.createToolAction({}, tool),
      () => actions.updateToolAction(1, {}, tool),
      () => actions.deleteToolAction(1),
      () => actions.createAdvertisementAction({}, advertisement),
      () => actions.updateAdvertisementAction(1, {}, advertisement),
      () => actions.deleteAdvertisementAction(1),
      () => actions.updateSiteSettingAction({}, settings),
    ];

    for (const call of calls) {
      requireAdminMock.mockRejectedValueOnce(new Error("AUTH_REQUIRED"));
      await expect(call()).rejects.toThrow("AUTH_REQUIRED");
    }

    expect(requireAdminMock).toHaveBeenCalledTimes(calls.length);
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });

  it("returns validation fields and revalidates successful writes", async () => {
    const invalid = await actions.createCategoryAction({}, new FormData());
    expect(invalid.fieldErrors).toMatchObject({
      name: expect.any(Array),
      slug: expect.any(Array),
    });

    const created = await actions.createCategoryAction(
      {},
      toFormData(categoryInput({ slug: "action-category" })),
    );
    expect(created).toMatchObject({ success: true });
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
    expect(revalidatePathMock).toHaveBeenCalledWith("/admin/categories");
  });
});
