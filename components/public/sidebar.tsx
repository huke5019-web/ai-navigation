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
  const siteName = setting?.siteName ?? "AI Navigation";

  return (
    <aside className="desktop-sidebar">
      <Link className="brand" href="/">
        <span aria-hidden="true" className="brand-mark" translate="no">
          AI
        </span>
        <span className="brand-copy">
          <strong className="brand-title" translate="no">
            {siteName}
          </strong>
          <span className="brand-subtitle">Curated tools for work and creativity</span>
        </span>
      </Link>
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
