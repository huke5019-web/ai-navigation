import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { ToolIcon } from "@/components/public/tool-icon";

type Tool = Prisma.ToolGetPayload<{ include: { category: true; tags: { include: { tag: true } } } }>;

export function ToolCard({ tool }: { tool: Tool }) {
  return <article className="tool-card">
    <div className="tool-icon">
      <ToolIcon logoUrl={tool.logoUrl} name={tool.name} />
    </div>
    <div className="tool-card-copy">
      <span className="category-label">{tool.category.name}</span>
      <h3><Link href={`/tools/${tool.slug}`}>{tool.name}</Link></h3>
      <p>{tool.summary}</p>
      <div className="tool-actions">
        <Link href={`/tools/${tool.slug}`} aria-label={`查看${tool.name}详情`}>查看详情</Link>
        <a href={tool.websiteUrl} target="_blank" rel="noreferrer" aria-label={`访问${tool.name}`}>访问官网 ↗</a>
      </div>
    </div>
  </article>;
}
