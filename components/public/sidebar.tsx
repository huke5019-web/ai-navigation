import Link from "next/link";
import type { Category, SiteSetting } from "@prisma/client";
import { CategoryNav } from "./category-nav";

export function Sidebar({ setting, categories, selected, query }: { setting: SiteSetting | null; categories: Category[]; selected?: string; query?: string }) {
  return <aside className="desktop-sidebar">
    <Link className="brand" href="/"><span>AI</span>{setting?.siteName ?? "AI 导航"}</Link>
    <p className="sidebar-kicker">探索人工智能</p>
    <CategoryNav categories={categories} selected={selected} query={query} />
    <Link className="admin-link" href="/admin">管理后台</Link>
  </aside>;
}
