import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { ToolsDirectory } from "@/components/public/tools-directory";
import { getVisibleAds } from "@/lib/ads";
import {
  getActiveCategories,
  getCategoryBySlug,
  getFeaturedTools,
  getSiteSetting,
  getTools,
} from "@/lib/queries";
import { buildMetadata, categorySeo } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const seo = categorySeo(slug);
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: `/categories/${slug}`,
    keywords: ["AI tools", slug, "AI directory"],
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ slug }, { q }] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const [setting, categories, featured, tools, banners, sidebarAds] = await Promise.all([
    getSiteSetting(),
    getActiveCategories(),
    getFeaturedTools(),
    getTools({ query: q, category: slug }),
    getVisibleAds("HOME_BANNER"),
    getVisibleAds("HOME_SIDEBAR"),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${category.name} tools`,
          itemListElement: tools.slice(0, 20).map((tool, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`/tools/${tool.slug}`),
            name: tool.name,
          })),
        }}
      />
      <ToolsDirectory
        setting={setting}
        categories={categories}
        featured={featured.filter((tool) => tool.category.slug === slug)}
        tools={tools}
        banners={banners}
        sidebarAds={sidebarAds}
        selectedCategory={slug}
        query={q}
        searchAction={`/categories/${slug}`}
        heroLabel="CATEGORY"
        heroTitle={category.name}
        heroDescription={`Explore curated ${category.name.toLowerCase()} with direct links, pricing notes, and practical summaries.`}
      />
    </>
  );
}
