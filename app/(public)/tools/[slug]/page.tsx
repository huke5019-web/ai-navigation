import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getVisibleAds } from "@/lib/ads";
import { getRelatedTools, getToolBySlug } from "@/lib/queries";
import { AdSlot } from "@/components/public/ad-slot";
import { ToolCard } from "@/components/public/tool-card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const tool = await getToolBySlug((await params).slug);
  return tool ? { title: tool.name, description: tool.summary } : { title: "工具未找到" };
}

export default async function ToolDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) notFound();
  const [related, ads] = await Promise.all([getRelatedTools(tool.categoryId, tool.id), getVisibleAds("TOOL_DETAIL")]);
  return <main className="detail-page">
    <Link className="back-link" href="/">← 返回工具目录</Link>
    <article className="detail-card">
      <span className="category-label">{tool.category.name}</span>
      <h1>{tool.name}</h1><p className="detail-summary">{tool.summary}</p>
      <div className="tag-list">{tool.tags.map(({ tag }) => <span key={tag.id}>{tag.name}</span>)}</div>
      <p className="description">{tool.description}</p>
      <a className="primary-button" href={tool.websiteUrl} target="_blank" rel="noreferrer" aria-label={`访问${tool.name}官网`}>访问官方网站 ↗</a>
    </article>
    <AdSlot ads={ads} className="detail-ads" />
    {!!related.length && <section><div className="section-title"><h2>相关推荐</h2></div><div className="tool-grid">{related.map((item) => <ToolCard tool={item} key={item.id} />)}</div></section>}
  </main>;
}
