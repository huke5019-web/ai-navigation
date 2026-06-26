import { Prisma } from "@prisma/client";

import { visibleAdWhere } from "@/lib/ads";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import {
  catalogCategories,
  catalogTags,
  catalogTools,
  defaultAdvertisements,
  defaultSiteSetting,
} from "@/prisma/catalog";

const toolRelations = {
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.ToolInclude;

const publicToolWhere = {
  isActive: true,
  category: { isActive: true },
} satisfies Prisma.ToolWhereInput;

type PublicTool = Prisma.ToolGetPayload<{
  include: typeof toolRelations;
}>;

const fallbackTimestamp = new Date("2026-06-15T00:00:00.000Z");

const fallbackCategories = catalogCategories.map((category, index) => ({
  id: index + 1,
  name: category.name,
  slug: category.slug,
  icon: category.icon,
  sortOrder: category.sortOrder,
  isActive: true,
  createdAt: fallbackTimestamp,
  updatedAt: fallbackTimestamp,
}));

const fallbackTags = catalogTags.map((tag, index) => ({
  id: index + 1,
  name: tag.name,
  slug: tag.slug,
}));

const fallbackCategoriesBySlug = new Map<string, (typeof fallbackCategories)[number]>(
  fallbackCategories.map((category) => [category.slug, category] as const),
);

const fallbackTagsBySlug = new Map<string, (typeof fallbackTags)[number]>(
  fallbackTags.map((tag) => [tag.slug, tag] as const),
);

const fallbackTools: PublicTool[] = catalogTools.map((tool, index) => {
  const category = fallbackCategoriesBySlug.get(tool.categorySlug);
  if (!category) {
    throw new Error(`Missing fallback category for ${tool.slug}`);
  }

  const id = index + 1;
  return {
    id,
    categoryId: category.id,
    category,
    name: tool.name,
    slug: tool.slug,
    logoUrl: tool.logoUrl,
    summary: tool.summary,
    description: tool.description,
    websiteUrl: tool.websiteUrl,
    officialUrl: tool.officialUrl ?? tool.websiteUrl,
    affiliateUrl: tool.affiliateUrl ?? null,
    isSponsored: tool.isSponsored ?? false,
    sponsorLabel: tool.sponsorLabel ?? null,
    couponCode: tool.couponCode ?? null,
    pricing: tool.pricing ?? null,
    sortOrder: tool.sortOrder,
    isActive: true,
    isFeatured: tool.isFeatured,
    createdAt: fallbackTimestamp,
    updatedAt: fallbackTimestamp,
    tags: tool.tagSlugs.flatMap((slug) => {
      const tag = fallbackTagsBySlug.get(slug);
      return tag ? [{ toolId: id, tagId: tag.id, tag }] : [];
    }),
  };
});

const fallbackSiteSetting = {
  ...defaultSiteSetting,
  updatedAt: fallbackTimestamp,
};

const fallbackVisibleAdvertisementCount = defaultAdvertisements.length;

function matchesKeyword(tool: PublicTool, keyword?: string) {
  if (!keyword) {
    return true;
  }

  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) {
    return true;
  }

  return (
    tool.name.toLowerCase().includes(normalizedKeyword) ||
    tool.summary.toLowerCase().includes(normalizedKeyword) ||
    tool.tags.some(({ tag }) => tag.name.toLowerCase().includes(normalizedKeyword))
  );
}

function listFallbackTools() {
  return [...fallbackTools].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.id - right.id,
  );
}

function shouldUseFallback(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2022" || error.code === "P2021")
  );
}

export async function getSiteSetting() {
  if (!hasDatabaseUrl()) {
    return fallbackSiteSetting;
  }

  try {
    return await prisma.siteSetting.findUnique({ where: { id: 1 } });
  } catch (error) {
    if (shouldUseFallback(error)) {
      return fallbackSiteSetting;
    }
    throw error;
  }
}

export async function getActiveCategories() {
  if (!hasDatabaseUrl()) {
    return [...fallbackCategories];
  }

  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
  } catch (error) {
    if (shouldUseFallback(error)) {
      return [...fallbackCategories];
    }
    throw error;
  }
}

export async function getCategoryBySlug(slug: string) {
  if (!hasDatabaseUrl()) {
    return fallbackCategories.find((category) => category.slug === slug) ?? null;
  }

  try {
    return await prisma.category.findFirst({
      where: { slug, isActive: true },
    });
  } catch (error) {
    if (shouldUseFallback(error)) {
      return fallbackCategories.find((category) => category.slug === slug) ?? null;
    }
    throw error;
  }
}

export async function getTools({
  category,
  query,
}: {
  category?: string;
  query?: string;
} = {}) {
  if (!hasDatabaseUrl()) {
    return listFallbackTools().filter(
      (tool) =>
        (!category || tool.category.slug === category) && matchesKeyword(tool, query),
    );
  }

  const keyword = query?.trim();
  try {
    return await prisma.tool.findMany({
      where: {
        ...publicToolWhere,
        ...(category
          ? { category: { slug: category, isActive: true } }
          : {}),
        ...(keyword
          ? {
              OR: [
                { name: { contains: keyword } },
                { summary: { contains: keyword } },
                { tags: { some: { tag: { name: { contains: keyword } } } } },
              ],
            }
          : {}),
      },
      include: toolRelations,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
  } catch (error) {
    if (shouldUseFallback(error)) {
      return listFallbackTools().filter(
        (tool) =>
          (!category || tool.category.slug === category) && matchesKeyword(tool, query),
      );
    }
    throw error;
  }
}

export async function getFeaturedTools() {
  if (!hasDatabaseUrl()) {
    return listFallbackTools().filter((tool) => tool.isFeatured);
  }

  try {
    return await prisma.tool.findMany({
      where: { ...publicToolWhere, isFeatured: true },
      include: toolRelations,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
  } catch (error) {
    if (shouldUseFallback(error)) {
      return listFallbackTools().filter((tool) => tool.isFeatured);
    }
    throw error;
  }
}

export async function getToolBySlug(slug: string) {
  if (!hasDatabaseUrl()) {
    return fallbackTools.find((tool) => tool.slug === slug) ?? null;
  }

  try {
    return await prisma.tool.findFirst({
      where: { ...publicToolWhere, slug },
      include: toolRelations,
    });
  } catch (error) {
    if (shouldUseFallback(error)) {
      return fallbackTools.find((tool) => tool.slug === slug) ?? null;
    }
    throw error;
  }
}

export async function getRelatedTools(
  categoryId: number,
  excludedToolId: number,
) {
  if (!hasDatabaseUrl()) {
    return listFallbackTools()
      .filter((tool) => tool.categoryId === categoryId && tool.id !== excludedToolId)
      .slice(0, 6);
  }

  try {
    return await prisma.tool.findMany({
      where: {
        ...publicToolWhere,
        categoryId,
        id: { not: excludedToolId },
      },
      include: toolRelations,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      take: 6,
    });
  } catch (error) {
    if (shouldUseFallback(error)) {
      return listFallbackTools()
        .filter((tool) => tool.categoryId === categoryId && tool.id !== excludedToolId)
        .slice(0, 6);
    }
    throw error;
  }
}

export async function getSitemapTools() {
  if (!hasDatabaseUrl()) {
    return listFallbackTools().map(({ slug, updatedAt }) => ({ slug, updatedAt }));
  }

  try {
    return await prisma.tool.findMany({
      where: publicToolWhere,
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { slug: true, updatedAt: true },
    });
  } catch (error) {
    if (shouldUseFallback(error)) {
      return listFallbackTools().map(({ slug, updatedAt }) => ({ slug, updatedAt }));
    }
    throw error;
  }
}

export async function getSitemapCategories() {
  if (!hasDatabaseUrl()) {
    return fallbackCategories.map(({ slug, updatedAt }) => ({ slug, updatedAt }));
  }

  try {
    return await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { slug: true, updatedAt: true },
    });
  } catch (error) {
    if (shouldUseFallback(error)) {
      return fallbackCategories.map(({ slug, updatedAt }) => ({ slug, updatedAt }));
    }
    throw error;
  }
}

export async function getDashboardStats(now = new Date()) {
  if (!hasDatabaseUrl()) {
    return {
      totalTools: fallbackTools.length,
      activeCategories: fallbackCategories.length,
      visibleAds: fallbackVisibleAdvertisementCount,
      featuredTools: fallbackTools.filter((tool) => tool.isFeatured).length,
    };
  }

  try {
    const [totalTools, activeCategories, visibleAds, featuredTools] =
      await prisma.$transaction([
        prisma.tool.count(),
        prisma.category.count({ where: { isActive: true } }),
        prisma.advertisement.count({ where: visibleAdWhere(now) }),
        prisma.tool.count({
          where: { ...publicToolWhere, isFeatured: true },
        }),
      ]);

    return { totalTools, activeCategories, visibleAds, featuredTools };
  } catch (error) {
    if (shouldUseFallback(error)) {
      return {
        totalTools: fallbackTools.length,
        activeCategories: fallbackCategories.length,
        visibleAds: fallbackVisibleAdvertisementCount,
        featuredTools: fallbackTools.filter((tool) => tool.isFeatured).length,
      };
    }
    throw error;
  }
}
