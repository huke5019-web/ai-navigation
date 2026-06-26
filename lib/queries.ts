import type { Prisma } from "@prisma/client";

import { visibleAdWhere } from "@/lib/ads";
import { prisma } from "@/lib/prisma";

const toolRelations = {
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.ToolInclude;

const publicToolWhere = {
  isActive: true,
  category: { isActive: true },
} satisfies Prisma.ToolWhereInput;

export async function getSiteSetting() {
  return prisma.siteSetting.findUnique({ where: { id: 1 } });
}

export async function getActiveCategories() {
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
  return prisma.tool.findMany({
    where: { ...publicToolWhere, isFeatured: true },
    include: toolRelations,
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}

export async function getToolBySlug(slug: string) {
  return prisma.tool.findFirst({
    where: { ...publicToolWhere, slug },
    include: toolRelations,
  });
}

export async function getRelatedTools(
  categoryId: number,
  excludedToolId: number,
) {
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

export async function getDashboardStats(now = new Date()) {
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
