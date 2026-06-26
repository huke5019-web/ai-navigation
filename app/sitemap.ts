import type { MetadataRoute } from "next";

import { getBlogPosts } from "@/lib/blog";
import { getSitemapCategories, getSitemapTools } from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tools, categories, posts] = await Promise.all([
    getSitemapTools(),
    getSitemapCategories(),
    getBlogPosts(),
  ]);

  return [
    {
      url: siteConfig.siteUrl,
      lastModified: new Date(),
      priority: 1,
    },
    ...["about", "contact", "privacy-policy", "terms", "advertise", "submit-tool", "blog"].map(
      (path) => ({
        url: `${siteConfig.siteUrl}/${path}`,
        lastModified: new Date(),
        priority: path === "blog" ? 0.8 : 0.5,
      }),
    ),
    ...categories.map((category) => ({
      url: `${siteConfig.siteUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt,
      priority: 0.8,
    })),
    ...tools.map((tool) => ({
      url: `${siteConfig.siteUrl}/tools/${tool.slug}`,
      lastModified: tool.updatedAt,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: `${siteConfig.siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      priority: 0.7,
    })),
  ];
}
