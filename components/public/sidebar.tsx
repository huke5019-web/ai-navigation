import Link from "next/link";
import type { Category, SiteSetting } from "@prisma/client";

import { CategoryNav } from "@/components/public/category-nav";

export function Sidebar({
  setting,
  categories,
  selected,
  query,
}: {
  setting: SiteSetting | null;
  categories: Category[];
  selected?: string;
  query?: string;
}) {
  return (
    <aside className="desktop-sidebar">
      <Link className="brand" href="/">
        <span>AI</span>
        {setting?.siteName ?? "AI Navigation"}
      </Link>
      <p className="sidebar-kicker">Curated tools for work and creativity</p>
      <CategoryNav categories={categories} selected={selected} query={query} />
      <div className="sidebar-links">
        <Link href="/blog">Blog</Link>
        <Link href="/about">About</Link>
        <Link href="/advertise">Advertise</Link>
        <Link href="/submit-tool">Submit Tool</Link>
      </div>
      <Link className="admin-link" href="/admin">
        Admin
      </Link>
    </aside>
  );
}
