import { Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { adSchema, categorySchema, settingsSchema, toolSchema } from "@/lib/schemas";

type Input = Record<string, unknown>;

function parse<T>(schema: z.ZodType<T>, input: Input): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw result.error.flatten();
  }

  return result.data;
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const createCategory = (input: Input) =>
  prisma.category.create({ data: parse(categorySchema, input) });

export const updateCategory = (id: number, input: Input) =>
  prisma.category.update({ where: { id }, data: parse(categorySchema, input) });

export async function deleteCategory(id: number) {
  if (await prisma.tool.count({ where: { categoryId: id } })) {
    throw new Error("Please move or delete tools in this category first.");
  }

  return prisma.category.delete({ where: { id } });
}

async function saveTool(id: number | null, input: Input) {
  const data = parse(toolSchema, input);
  const tagMap = new Map<string, string>();

  for (const name of data.tags.split(",").map((item) => item.trim()).filter(Boolean)) {
    const key = slugify(name);
    if (!tagMap.has(key)) {
      tagMap.set(key, name);
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const records = [];
      for (const [tagSlug, name] of tagMap) {
        records.push(
          await tx.tag.upsert({
            where: { slug: tagSlug },
            update: {},
            create: { slug: tagSlug, name },
          }),
        );
      }

      const officialUrl = data.officialUrl ?? data.websiteUrl;
      const payload = {
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logoUrl ?? null,
        summary: data.summary,
        description: data.description,
        websiteUrl: officialUrl,
        officialUrl,
        affiliateUrl: data.affiliateUrl ?? null,
        isSponsored: data.isSponsored,
        sponsorLabel: data.sponsorLabel || null,
        couponCode: data.couponCode || null,
        pricing: data.pricing || null,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      };

      const tool = id
        ? await tx.tool.update({ where: { id }, data: payload })
        : await tx.tool.create({ data: payload });

      await tx.toolTag.deleteMany({ where: { toolId: tool.id } });
      if (records.length) {
        await tx.toolTag.createMany({
          data: records.map((tag) => ({ toolId: tool.id, tagId: tag.id })),
        });
      }

      return tool;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw { formErrors: [], fieldErrors: { slug: ["Slug already exists"] } };
    }

    throw error;
  }
}

export const createTool = (input: Input) => saveTool(null, input);
export const updateTool = (id: number, input: Input) => saveTool(id, input);
export const deleteTool = (id: number) => prisma.tool.delete({ where: { id } });

export async function createAdvertisement(input: Input) {
  return prisma.advertisement.create({ data: parse(adSchema, input) });
}

export async function updateAdvertisement(id: number, input: Input) {
  return prisma.advertisement.update({ where: { id }, data: parse(adSchema, input) });
}

export const deleteAdvertisement = (id: number) =>
  prisma.advertisement.delete({ where: { id } });

export async function updateSiteSetting(input: Input) {
  const data = parse(settingsSchema, input);
  return prisma.siteSetting.upsert({
    where: { id: 1 },
    update: { ...data, logoUrl: data.logoUrl ?? null },
    create: { id: 1, ...data, logoUrl: data.logoUrl ?? null },
  });
}
