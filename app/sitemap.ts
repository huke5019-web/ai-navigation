import type { MetadataRoute } from "next";

import { getSitemapTools } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const tools = await getSitemapTools();

  return [
    { url: base, lastModified: new Date(), priority: 1 },
    ...tools.map((tool) => ({
      url: `${base}/tools/${tool.slug}`,
      lastModified: tool.updatedAt,
      priority: 0.8,
    })),
  ];
}
