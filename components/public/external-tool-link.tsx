"use client";

import { trackEvent } from "@/lib/analytics";
import { buildToolOutboundHref } from "@/lib/click-paths";
import {
  getExternalRel,
  getSponsorLabel,
  getToolCtaLabel,
  getToolLinkType,
} from "@/lib/tool-links";

type ExternalToolLinkProps = {
  tool: {
    slug: string;
    name: string;
    affiliateUrl?: string | null;
    officialUrl?: string | null;
    websiteUrl?: string | null;
    isSponsored?: boolean | null;
    sponsorLabel?: string | null;
    category: { name: string; slug: string };
  };
  className?: string;
  children?: string;
};

export function ExternalToolLink({
  tool,
  className,
  children,
}: ExternalToolLinkProps) {
  const href = buildToolOutboundHref(tool.slug);
  const rel = getExternalRel(tool);
  const linkType = getToolLinkType(tool);
  const label = getSponsorLabel(tool);

  return (
    <a
      href={href}
      target="_blank"
      rel={rel}
      className={className}
      aria-label={`Visit ${tool.name}`}
      onClick={() =>
        trackEvent("affiliate_click", {
          tool_name: tool.name,
          category: tool.category.slug,
          link_type: linkType,
        })
      }
    >
      {children ?? getToolCtaLabel(tool)} {label ? <span className="sponsored-inline">{label}</span> : null}
    </a>
  );
}
