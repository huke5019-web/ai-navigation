import { pathToFileURL } from "node:url";

import { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "../lib/prisma";
import {
  catalogCategories,
  catalogTags,
  catalogTools,
  defaultAdvertisements,
  defaultSiteSetting,
} from "./catalog";

async function seedWithinTransaction(
  client: Prisma.TransactionClient,
): Promise<void> {
  const categoryIds = new Map<string, number>();
  for (const category of catalogCategories) {
    const saved = await client.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categoryIds.set(category.slug, saved.id);
  }

  const tagIds = new Map<string, number>();
  for (const tag of catalogTags) {
    const saved = await client.tag.upsert({
      where: { slug: tag.slug },
      update: tag,
      create: tag,
    });
    tagIds.set(tag.slug, saved.id);
  }

  const managedTagSlugs = catalogTags.map(({ slug }) => slug);
  for (const tool of catalogTools) {
    const { categorySlug, tagSlugs, ...toolData } = tool;
    const categoryId = categoryIds.get(categorySlug);
    if (!categoryId) {
      throw new Error(`Missing seeded category: ${categorySlug}`);
    }

    const savedTool = await client.tool.upsert({
      where: { slug: tool.slug },
      update: { ...toolData, categoryId },
      create: { ...toolData, categoryId },
    });

    await client.toolTag.deleteMany({
      where: {
        toolId: savedTool.id,
        tag: { slug: { in: [...managedTagSlugs] } },
      },
    });

    for (const tagSlug of tagSlugs) {
      const tagId = tagIds.get(tagSlug);
      if (!tagId) {
        throw new Error(`Missing seeded tag: ${tagSlug}`);
      }
      await client.toolTag.create({
        data: { toolId: savedTool.id, tagId },
      });
    }
  }

  for (const advertisement of defaultAdvertisements) {
    const existing = await client.advertisement.findUnique({
      where: { id: advertisement.id },
      select: { id: true },
    });
    if (!existing) {
      await client.advertisement.create({ data: advertisement });
    }
  }

  const existingSettings = await client.siteSetting.findUnique({
    where: { id: defaultSiteSetting.id },
    select: { id: true },
  });
  if (!existingSettings) {
    await client.siteSetting.create({ data: defaultSiteSetting });
  }
}

export async function seed(client: PrismaClient = prisma): Promise<void> {
  await client.$transaction(async (transaction) => {
    await seedWithinTransaction(transaction);
  });
}

const isDirectRun =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  seed()
    .then(() => prisma.$disconnect())
    .catch(async (error: unknown) => {
      console.error(error);
      await prisma.$disconnect();
      process.exitCode = 1;
    });
}
