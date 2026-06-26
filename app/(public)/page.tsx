import { getVisibleAds } from "@/lib/ads";
import { getActiveCategories, getFeaturedTools, getSiteSetting, getTools } from "@/lib/queries";
import { AdSlot } from "@/components/public/ad-slot";
import { CategoryNav } from "@/components/public/category-nav";
import { SearchForm } from "@/components/public/search-form";
import { Sidebar } from "@/components/public/sidebar";
import { ToolCard } from "@/components/public/tool-card";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q, category } = await searchParams;
  const [setting, categories, featured, tools, banners, sidebarAds] = await Promise.all([
    getSiteSetting(), getActiveCategories(), getFeaturedTools(), getTools({ query: q, category }),
    getVisibleAds("HOME_BANNER"), getVisibleAds("HOME_SIDEBAR"),
  ]);
  return <div className="public-shell">
    <Sidebar setting={setting} categories={categories} selected={category} query={q} />
    <main className="main-content">
      <header className="hero"><p>CURATED AI TOOLS</p><h1>{setting?.siteName ?? "AI 导航"}</h1><span>{setting?.siteDescription ?? "发现真正实用的 AI 工具"}</span></header>
      <SearchForm query={q} category={category} />
      <CategoryNav mobile categories={categories} selected={category} query={q} />
      <AdSlot ads={banners} className="banner-ads" />
      {!!featured.length && <section><div className="section-title"><h2>精选工具</h2><span>编辑推荐</span></div><div className="tool-grid">{featured.map((tool) => <ToolCard tool={tool} key={`featured-${tool.id}`} />)}</div></section>}
      <section><div className="section-title"><h2>工具目录</h2><span>{tools.length} 个工具</span></div>
        {tools.length ? <div className="tool-grid">{tools.map((tool) => <ToolCard tool={tool} key={tool.id} />)}</div> : <div className="empty-state" role="status">没有找到匹配的工具，请尝试其他关键词或分类。</div>}
      </section>
      <footer>{setting?.footerText ?? "AI 导航"}</footer>
    </main>
    <aside className="ad-rail"><div className="rail-title">合作推荐</div><AdSlot ads={sidebarAds} /></aside>
  </div>;
}
