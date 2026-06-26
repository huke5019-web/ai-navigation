type ToolLinkShape = {
  affiliateUrl?: string | null;
  officialUrl?: string | null;
  websiteUrl?: string | null;
  isSponsored?: boolean | null;
  sponsorLabel?: string | null;
};

export function getToolPrimaryUrl(tool: ToolLinkShape) {
  return tool.affiliateUrl || tool.officialUrl || tool.websiteUrl || "#";
}

export function getToolLinkType(tool: ToolLinkShape) {
  return tool.affiliateUrl ? "affiliate" : "official";
}

export function getExternalRel(tool: ToolLinkShape) {
  const base = ["noopener", "noreferrer"];
  if (tool.affiliateUrl || tool.isSponsored) {
    base.unshift("nofollow", "sponsored");
  }
  return base.join(" ");
}

export function getSponsorLabel(tool: ToolLinkShape) {
  return tool.sponsorLabel?.trim() || (tool.isSponsored ? "Sponsored" : "");
}

export function getToolCtaLabel(tool: ToolLinkShape) {
  if (tool.affiliateUrl) {
    return "Try Now";
  }
  return "Visit Website";
}
