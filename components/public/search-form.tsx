export function SearchForm({ query, category }: { query?: string; category?: string }) {
  return <form className="search-form" role="search">
    {category && <input type="hidden" name="category" value={category} />}
    <label className="sr-only" htmlFor="tool-search">搜索 AI 工具</label>
    <input id="tool-search" type="search" name="q" defaultValue={query} placeholder="搜索工具、功能或关键词" aria-label="搜索 AI 工具" />
    <button type="submit">搜索</button>
  </form>;
}
