import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/public/ad-slot";
import { ToolCard } from "@/components/public/tool-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";
import { getTools } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-config";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = await getBlogPostBySlug((await params).slug);

  if (!post) {
    return buildMetadata({
      title: "Article Not Found",
      description: "The requested article is not available.",
      path: "/blog",
    });
  }

  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: [post.category, "AI blog", "AI tools guide"],
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const tools = await getTools();
  const recommendedTools = tools.filter((tool) => post.recommendedTools?.includes(tool.slug));
  const relatedPosts = (await getBlogPosts())
    .filter((item) => item.slug !== post.slug && post.relatedSlugs?.includes(item.slug))
    .slice(0, 3);

  return (
    <main className="article-page">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.publishedAt,
          dateModified: post.updatedAt ?? post.publishedAt,
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          publisher: {
            "@type": "Organization",
            name: "AI Navigation",
          },
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />
      <header className="article-header">
        <span className="blog-meta">
          {post.category} · {post.readingTime}
        </span>
        <h1>{post.title}</h1>
        <p>{post.description}</p>
      </header>
      <div className="article-layout">
        <aside className="article-toc">
          <div className="article-toc-card">
            <h2>Contents</h2>
            <ul>
              {post.toc.map((item) => (
                <li className={`toc-level-${item.level}`} key={item.id}>
                  <a href={`#${item.id}`}>{item.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <article className="article-card">
          {recommendedTools.length ? (
            <section className="article-tool-picks">
              <div className="section-title">
                <h2>Recommended Tools</h2>
                <span>Editor picks for this topic</span>
              </div>
              <div className="tool-grid">
                {recommendedTools.slice(0, 4).map((tool) => <ToolCard tool={tool} key={tool.id} />)}
              </div>
            </section>
          ) : null}
          <AdSlot kind="article" position="articleInline" className="article-ad-slot" />
          <div dangerouslySetInnerHTML={{ __html: post.html }} />
          <div className="article-disclaimer">
            Disclaimer: We may earn a commission from some partner links. Recommendations are
            based on editorial judgment and practical use cases, not paid placement alone.
          </div>
        </article>
      </div>
      {relatedPosts.length ? (
        <section className="related-posts">
          <div className="section-title">
            <h2>Related Articles</h2>
          </div>
          <div className="blog-list compact-blog-list">
            {relatedPosts.map((item) => (
              <article className="blog-card" key={item.slug}>
                <span className="blog-meta">{item.category}</span>
                <h2><a href={`/blog/${item.slug}`}>{item.title}</a></h2>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
