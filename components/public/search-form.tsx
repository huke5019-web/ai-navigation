"use client";

import { trackEvent } from "@/lib/analytics";

export function SearchForm({
  query,
  category,
  action = "/",
}: {
  query?: string;
  category?: string;
  action?: string;
}) {
  return (
    <form
      className="search-form"
      role="search"
      action={action}
      onSubmit={(event) => {
        const form = event.currentTarget;
        const data = new FormData(form);
        trackEvent("search", {
          search_term: String(data.get("q") ?? ""),
          category: String(data.get("category") ?? category ?? ""),
        });
      }}
    >
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <label className="sr-only" htmlFor="tool-search">
        Search AI tools
      </label>
      <input
        id="tool-search"
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Search tools, use cases, or features"
        aria-label="Search AI tools"
      />
      <button type="submit">Search</button>
    </form>
  );
}
