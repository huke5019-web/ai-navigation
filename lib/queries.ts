import type { Prisma } from "@prisma/client";

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

const fallbackCategoriesBySlug = new Map(
  fallbackCategories.map((category) => [category.slug, category] as const),
);

const fallbackTagsBySlug = new Map(
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

export async function getSiteSetting() {
  if (!hasDatabaseUrl()) {
    return fallbackSiteSetting;
  }

  return prisma.siteSetting.findUnique({ where: { id: 1 } });
}

export async function getActiveCategories() {
  if (!hasDatabaseUrl()) {
    return [...fallbackCategories];
  }

  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
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
  return prisma.tool.findMany({
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
}

export async function getFeaturedTools() {
  if (!hasDatabaseUrl()) {
    return listFallbackTools().filter((tool) => tool.isFeatured);
  }

  return prisma.tool.findMany({
    where: { ...publicToolWhere, isFeatured: true },
    include: toolRelations,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}

export async function getToolBySlug(slug: string) {
  if (!hasDatabaseUrl()) {
    return fallbackTools.find((tool) => tool.slug === slug) ?? null;
  }

  return prisma.tool.findFirst({
    where: { ...publicToolWhere, slug },
    include: toolRelations,
  });
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

  return prisma.tool.findMany({
    where: {
      ...publicToolWhere,
      categoryId,
      id: { not: excludedToolId },
    },
    include: toolRelations,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    take: 6,
  });
}

export async function getSitemapTools() {
  if (!hasDatabaseUrl()) {
    return listFallbackTools().map(({ slug, updatedAt }) => ({ slug, updatedAt }));
  }

  return prisma.tool.findMany({
    where: publicToolWhere,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { slug: true, updatedAt: true },
  });
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
}
