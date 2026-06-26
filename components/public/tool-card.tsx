import type { Prisma } from "@prisma/client";

import { TrackedLink } from "@/components/analytics/tracked-link";
import { ToolIcon } from "@/components/public/tool-icon";
import { ExternalToolLink } from "@/components/public/external-tool-link";

type Tool = Prisma.ToolGetPayload<{ include: { category: true; tags: { include: { tag: true } } } }>;

export function ToolCard({ tool }: { tool: Tool }) {
  return (
    <article className="tool-card">
      <div className="tool-icon">
        <ToolIcon logoUrl={tool.logoUrl} name={tool.name} />
      </div>
      <div className="tool-card-copy">
        <div className="tool-card-meta">
          <span className="category-label">{tool.category.name}</span>
          {tool.isSponsored ? (
            <span className="tool-sponsored-badge">{tool.sponsorLabel ?? "Sponsored"}</span>
          ) : null}
        </div>
        <h3>
          <TrackedLink
            href={`/tools/${tool.slug}`}
            eventName="tool_detail_click"
            eventParams={{ tool_name: tool.name, category: tool.category.slug }}
            ariaLabel={`View ${tool.name} details`}
          >
            {tool.name}
          </TrackedLink>
        </h3>
        <p>{tool.summary}</p>
        <div className="tool-card-tags">
          {tool.pricing ? <span>{tool.pricing}</span> : null}
          {tool.couponCode ? <span>Coupon: {tool.couponCode}</span> : null}
          {tool.tags.slice(0, 3).map(({ tag }) => <span key={tag.id}>{tag.name}</span>)}
        </div>
        <div className="tool-actions">
          <TrackedLink
            href={`/tools/${tool.slug}`}
            eventName="tool_detail_click"
            eventParams={{ tool_name: tool.name, category: tool.category.slug, source: "card" }}
            ariaLabel={`View ${tool.name} details`}
          >
            View Details
          </TrackedLink>
          <ExternalToolLink tool={tool} className="tool-external-link">
            Visit Website
          </ExternalToolLink>
        </div>
      </div>
    </article>
  );
}
