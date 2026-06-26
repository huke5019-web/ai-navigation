import { afterEach, describe, expect, test, vi } from "vitest";

const originalDatabaseUrl = process.env.DATABASE_URL;

afterEach(() => {
  if (originalDatabaseUrl === undefined) {
    delete process.env.DATABASE_URL;
  } else {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
  vi.resetModules();
});

describe("public catalog fallback", () => {
  test("serves site settings, categories, featured tools, and ads without DATABASE_URL", async () => {
    process.env.DATABASE_URL = "";
    vi.resetModules();

    const queries = await import("@/lib/queries");
    const ads = await import("@/lib/ads");
    const catalog = await import("@/prisma/catalog");

    await expect(queries.getSiteSetting()).resolves.toMatchObject({
      id: catalog.defaultSiteSetting.id,
      siteName: catalog.defaultSiteSetting.siteName,
    });

    await expect(queries.getActiveCategories()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: "chat", isActive: true }),
        expect.objectContaining({ slug: "writing", isActive: true }),
        expect.objectContaining({ slug: "image", isActive: true }),
        expect.objectContaining({ slug: "coding", isActive: true }),
      ]),
    );

    await expect(queries.getFeaturedTools()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          slug: "chatgpt",
          category: expect.objectContaining({ slug: "chat" }),
        }),
      ]),
    );

    await expect(ads.getVisibleAds("HOME_BANNER")).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          placement: "HOME_BANNER",
          title: catalog.defaultAdvertisements[0].title,
        }),
      ]),
    );
  });

  test("filters catalog tools and related tools without DATABASE_URL", async () => {
    process.env.DATABASE_URL = "";
    vi.resetModules();

    const queries = await import("@/lib/queries");

    const chatTools = await queries.getTools({ category: "chat", query: "OpenAI" });
    expect(chatTools).toEqual([
      expect.objectContaining({
        slug: "chatgpt",
        category: expect.objectContaining({ slug: "chat" }),
      }),
    ]);

    const tool = await queries.getToolBySlug("claude");
    expect(tool).toMatchObject({
      slug: "claude",
      category: { slug: "chat" },
    });

    const related = await queries.getRelatedTools(tool!.categoryId, tool!.id);
    expect(related).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ slug: "claude" })]),
    );
    expect(related).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: expect.objectContaining({ slug: "chat" }),
        }),
      ]),
    );
  });
});
