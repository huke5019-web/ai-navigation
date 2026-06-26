import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdSlot } from "@/components/public/ad-slot";
import { ExternalToolLink } from "@/components/public/external-tool-link";
import { ToolCard } from "@/components/public/tool-card";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { getVisibleAds } from "@/lib/ads";
import { getRelatedTools, getToolBySlug } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const tool = await getToolBySlug((await params).slug);

  if (!tool) {
    return buildMetadata({
      title: "Tool Not Found",
      description: "The requested AI tool listing is not available.",
      path: "/tools",
    });
  }

  return buildMetadata({
    title: `${tool.name} Review, Pricing, Features and Alternatives`,
    description: tool.summary,
    path: `/tools/${tool.slug}`,
    keywords: [tool.name, tool.category.name, "AI tool review", "AI software"],
  });
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) {
    notFound();
  }

  const [related, ads] = await Promise.all([
    getRelatedTools(tool.categoryId, tool.id),
    getVisibleAds("TOOL_DETAIL"),
  ]);

  return (
    <main className="detail-page">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: tool.name,
          applicationCategory: tool.category.name,
          operatingSystem: "Web",
          description: tool.summary,
          url: absoluteUrl(`/tools/${tool.slug}`),
          offers: tool.pricing ? { "@type": "Offer", description: tool.pricing } : undefined,
        }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: tool.category.name, href: `/categories/${tool.category.slug}` },
          { label: tool.name },
        ]}
      />
      <Link className="back-link" href={`/categories/${tool.category.slug}`}>
        Back to {tool.category.name}
      </Link>
      <article className="detail-card">
        <div className="detail-header">
          <span className="category-label">{tool.category.name}</span>
          {tool.isSponsored ? (
            <span className="tool-sponsored-badge">{tool.sponsorLabel ?? "Sponsored"}</span>
          ) : null}
        </div>
        <h1>{tool.name}</h1>
        <p className="detail-summary">{tool.summary}</p>
        <div className="tag-list">
          {tool.pricing ? <span>{tool.pricing}</span> : null}
          {tool.couponCode ? <span>Coupon: {tool.couponCode}</span> : null}
          {tool.tags.map(({ tag }) => <span key={tag.id}>{tag.name}</span>)}
        </div>
        <p className="description">{tool.description}</p>
        <div className="detail-actions">
          <ExternalToolLink tool={tool} className="primary-button">
            Try Now
          </ExternalToolLink>
          <Link className="secondary-button" href="/advertise">
            Sponsor This Category
          </Link>
        </div>
      </article>
      <AdSlot ads={ads} kind="footer" position="toolDetail" className="detail-ads" />
      {related.length ? (
        <section>
          <div className="section-title">
            <h2>Related Tools</h2>
          </div>
          <div className="tool-grid">
            {related.map((item) => <ToolCard tool={item} key={item.id} />)}
          </div>
        </section>
      ) : null}
    </main>
  );
}
