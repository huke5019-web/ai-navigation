"use client";

import type { Category } from "@prisma/client";

import { TrackedLink } from "@/components/analytics/tracked-link";

function href(slug?: string, query?: string) {
  if (!slug) {
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    return params.size ? `/?${params.toString()}` : "/";
  }

  const params = new URLSearchParams();
  if (query) {
    params.set("q", query);
  }
  return params.size ? `/categories/${slug}?${params.toString()}` : `/categories/${slug}`;
}

export function CategoryNav({
  categories,
  selected,
  query,
  mobile = false,
}: {
  categories: Category[];
  selected?: string;
  query?: string;
  mobile?: boolean;
}) {
  return (
    <nav
      aria-label="Tool categories"
      className={mobile ? "mobile-category-nav" : "category-nav"}
    >
      <TrackedLink
        className={!selected ? "active" : ""}
        href={href(undefined, query)}
        eventName="category_click"
        eventParams={{ category: "all", location: mobile ? "mobile-nav" : "sidebar-nav" }}
      >
        All Tools
      </TrackedLink>
      {categories.map((item) => (
        <TrackedLink
          className={selected === item.slug ? "active" : ""}
          href={href(item.slug, query)}
          eventName="category_click"
          eventParams={{
            category: item.slug,
            location: mobile ? "mobile-nav" : "sidebar-nav",
          }}
          key={item.id}
        >
          {item.name}
        </TrackedLink>
      ))}
    </nav>
  );
}
