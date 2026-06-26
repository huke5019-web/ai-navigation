import { TrackedLink } from "@/components/analytics/tracked-link";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getBlogPosts } from "@/lib/blog";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-config";

export async function generateMetadata() {
  return buildMetadata({
    title: "AI Blog - Guides, Reviews and Buying Advice",
    description:
      "Read practical AI tool guides, comparisons, and curated lists designed to grow organic search traffic.",
    path: "/blog",
    keywords: ["AI blog", "AI tools guide", "best AI tools"],
  });
}

export default async function BlogIndexPage() {
  const posts = await getBlogPosts();

  return (
    <main className="content-page">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "AI Navigation blog posts",
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(`/blog/${post.slug}`),
            name: post.title,
          })),
        }}
      />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
      <header className="content-page-header">
        <h1>AI Blog</h1>
        <p>Evergreen buying guides, product comparisons, and practical recommendations.</p>
      </header>
      <div className="blog-list">
        {posts.map((post) => (
          <article className="blog-card" key={post.slug}>
            <span className="blog-meta">
              {post.category} · {post.readingTime}
            </span>
            <h2>
              <TrackedLink
                href={`/blog/${post.slug}`}
                eventName="blog_click"
                eventParams={{ slug: post.slug }}
              >
                {post.title}
              </TrackedLink>
            </h2>
            <p>{post.description}</p>
            <TrackedLink
              className="secondary-button inline-button"
              href={`/blog/${post.slug}`}
              eventName="blog_click"
              eventParams={{ slug: post.slug, source: "index" }}
            >
              Read article
            </TrackedLink>
          </article>
        ))}
      </div>
    </main>
  );
}
