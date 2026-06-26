import { getVisibleAds } from "@/lib/ads";
import { getActiveCategories, getFeaturedTools, getSiteSetting, getTools } from "@/lib/queries";
import { categorySeo, buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolsDirectory } from "@/components/public/tools-directory";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export async function generateMetadata() {
  const seo = categorySeo();
  return buildMetadata({
    title: seo.title,
    description: seo.description,
    path: "/",
    keywords: ["AI tools", "AI directory", "best AI tools", "AI productivity"],
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const [setting, categories, featured, tools, banners, sidebarAds] = await Promise.all([
    getSiteSetting(),
    getActiveCategories(),
    getFeaturedTools(),
    getTools({ query: q }),
    getVisibleAds("HOME_BANNER"),
    getVisibleAds("HOME_SIDEBAR"),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "AI Navigation directory",
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
        featured={featured}
        tools={tools}
        banners={banners}
        sidebarAds={sidebarAds}
        query={q}
        heroLabel="BEST AI TOOLS"
        heroTitle={setting?.siteName ?? siteConfig.name}
        heroDescription={
          setting?.siteDescription ??
          "Browse practical AI tools for chat, writing, image generation, coding, and business workflows."
        }
      />
    </>
  );
}
