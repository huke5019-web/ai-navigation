import Link from "next/link";
import type { Category } from "@prisma/client";

function href(slug?: string, query?: string) {
  const params = new URLSearchParams();
  if (slug) params.set("category", slug);
  if (query) params.set("q", query);
  return params.size ? `/?${params}` : "/";
}
export function CategoryNav({ categories, selected, query, mobile = false }: { categories: Category[]; selected?: string; query?: string; mobile?: boolean }) {
  return <nav aria-label="工具分类" className={mobile ? "mobile-category-nav" : "category-nav"}>
    <Link className={!selected ? "active" : ""} href={href(undefined, query)}>全部工具</Link>
    {categories.map((item) => <Link className={selected === item.slug ? "active" : ""} href={href(item.slug, query)} key={item.id}>{item.name}</Link>)}
  </nav>;
}
