import type { Advertisement, Category, Prisma, SiteSetting } from "@prisma/client";
import type { ReactNode } from "react";

import { AdSlot } from "@/components/public/ad-slot";
import { CategoryNav } from "@/components/public/category-nav";
import { SearchForm } from "@/components/public/search-form";
import { Sidebar } from "@/components/public/sidebar";
import { ToolCard } from "@/components/public/tool-card";
import type { SponsorPosition } from "@/lib/sponsors";

type PublicTool = Prisma.ToolGetPayload<{
  include: { category: true; tags: { include: { tag: true } } };
}>;

function interleaveToolsWithAds(tools: PublicTool[]) {
  const items: ReactNode[] = [];

  tools.forEach((tool, index) => {
    items.push(<ToolCard tool={tool} key={`tool-${tool.id}`} />);

    if ((index + 1) % 6 === 0 && index !== tools.length - 1) {
      items.push(
        <AdSlot
          key={`in-feed-ad-${tool.id}`}
          kind="inFeed"
          position="in-feed"
          className="tool-card tool-card-ad"
        />,
      );
    }
  });

  return items;
}

export function ToolsDirectory({
  setting,
  categories,
  featured,
  tools,
  banners,
  sidebarAds,
  selectedCategory,
  query,
  heroLabel,
  heroTitle,
  heroDescription,
  searchAction = "/",
  bannerPosition = "home-banner",
  sidebarPosition = "sidebar",
  sponsorCategory,
}: {
  setting: SiteSetting | null;
  categories: Category[];
  featured: PublicTool[];
  tools: PublicTool[];
  banners: Advertisement[];
  sidebarAds: Advertisement[];
  selectedCategory?: string;
  query?: string;
  heroLabel: string;
  heroTitle: string;
  heroDescription: string;
  searchAction?: string;
  bannerPosition?: SponsorPosition;
  sidebarPosition?: SponsorPosition;
  sponsorCategory?: string;
}) {
  return (
    <div className="public-shell">
      <Sidebar
        setting={setting}
        categories={categories}
        selected={selectedCategory}
        query={query}
      />
      <main className="main-content">
        <header className="hero">
          <p>{heroLabel}</p>
          <h1>{heroTitle}</h1>
          <span>{heroDescription}</span>
        </header>
        <SearchForm query={query} category={selectedCategory} action={searchAction} />
        <CategoryNav mobile categories={categories} selected={selectedCategory} query={query} />
        <AdSlot
          kind="banner"
          ads={banners}
          position={bannerPosition}
          category={sponsorCategory}
          className="banner-ads"
        />
        {featured.length ? (
          <section>
            <div className="section-title">
              <h2>Featured Tools</h2>
              <span>Editor picks</span>
            </div>
            <div className="tool-grid">{featured.map((tool) => <ToolCard tool={tool} key={`featured-${tool.id}`} />)}</div>
          </section>
        ) : null}
        <section>
          <div className="section-title">
            <h2>Tool Directory</h2>
            <span>{tools.length} tools</span>
          </div>
          {tools.length ? (
            <div className="tool-grid">{interleaveToolsWithAds(tools)}</div>
          ) : (
            <div className="empty-state" role="status">
              No matching tools yet. Try a different keyword or category.
            </div>
          )}
        </section>
        <footer>{setting?.footerText ?? "AI Navigation"}</footer>
      </main>
      <aside className="ad-rail">
        <div className="rail-title">Sponsored</div>
        <AdSlot
          kind="sidebar"
          ads={sidebarAds}
          position={sidebarPosition}
          category={sponsorCategory}
        />
      </aside>
    </div>
  );
}
