import { Prisma } from "@prisma/client";
import type { ClickEvent, ClickLinkType } from "@prisma/client";

import { getAdminSession } from "@/lib/auth";
import { buildSponsorOutboundHref, buildToolOutboundHref } from "@/lib/click-paths";
import { hasDatabaseUrl, prisma } from "@/lib/prisma";
import { getToolBySlug } from "@/lib/queries";
import { getSponsorById } from "@/lib/sponsors";
import { getToolLinkType, getToolPrimaryUrl } from "@/lib/tool-links";

export { buildSponsorOutboundHref, buildToolOutboundHref } from "@/lib/click-paths";

export type AnalyticsEvent = Pick<
  ClickEvent,
  | "id"
  | "targetType"
  | "linkType"
  | "toolSlug"
  | "toolName"
  | "categorySlug"
  | "sponsorId"
  | "sponsorTitle"
  | "sponsorPosition"
  | "sponsorCategory"
  | "targetUrl"
  | "createdAt"
>;

type AggregatedTool = {
  slug: string;
  name: string;
  category: string;
  linkType: ClickLinkType | null;
  clicks: number;
  latestAt: Date;
};

type AggregatedSponsor = {
  id: string;
  title: string;
  position: string;
  category: string;
  linkType: ClickLinkType | null;
  clicks: number;
  latestAt: Date;
};

function shouldUseFallback(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2021" || error.code === "P2022")
  );
}

function asClickLinkType(linkType: string): ClickLinkType {
  return linkType === "affiliate" ? "AFFILIATE" : "OFFICIAL";
}

async function shouldSkipTracking() {
  if (!hasDatabaseUrl()) {
    return true;
  }

  const adminSession = await getAdminSession();
  return Boolean(adminSession);
}

export async function resolveTrackedTool(slug: string) {
  const tool = await getToolBySlug(slug);
  if (!tool) {
    return null;
  }

  return {
    tool,
    targetUrl: getToolPrimaryUrl(tool),
    linkType: asClickLinkType(getToolLinkType(tool)),
  };
}

export async function resolveTrackedSponsor(id: string) {
  const sponsor = getSponsorById(id);
  if (!sponsor) {
    return null;
  }

  return {
    sponsor,
    targetUrl: sponsor.link,
    linkType:
      sponsor.type === "affiliate"
        ? "AFFILIATE"
        : sponsor.type === "adsense"
          ? "ADSENSE"
          : "DIRECT",
  } as const;
}

export async function recordToolClick(slug: string) {
  const resolved = await resolveTrackedTool(slug);
  if (!resolved) {
    return null;
  }

  if (!(await shouldSkipTracking())) {
    try {
      await prisma.clickEvent.create({
        data: {
          targetType: "TOOL",
          linkType: resolved.linkType,
          toolSlug: resolved.tool.slug,
          toolName: resolved.tool.name,
          categorySlug: resolved.tool.category.slug,
          targetUrl: resolved.targetUrl,
        },
      });
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }
    }
  }

  return resolved.targetUrl;
}

export async function recordSponsorClick(id: string) {
  const resolved = await resolveTrackedSponsor(id);
  if (!resolved) {
    return null;
  }

  if (!(await shouldSkipTracking())) {
    try {
      await prisma.clickEvent.create({
        data: {
          targetType: "SPONSOR",
          linkType: resolved.linkType,
          sponsorId: resolved.sponsor.id,
          sponsorTitle: resolved.sponsor.title,
          sponsorPosition: resolved.sponsor.position,
          sponsorCategory: resolved.sponsor.category ?? "all",
          targetUrl: resolved.targetUrl,
        },
      });
    } catch (error) {
      if (!shouldUseFallback(error)) {
        throw error;
      }
    }
  }

  return resolved.targetUrl;
}

export async function getRecentClickEvents(limit = 50): Promise<AnalyticsEvent[]> {
  if (!hasDatabaseUrl()) {
    return [];
  }

  try {
    return await prisma.clickEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        targetType: true,
        linkType: true,
        toolSlug: true,
        toolName: true,
        categorySlug: true,
        sponsorId: true,
        sponsorTitle: true,
        sponsorPosition: true,
        sponsorCategory: true,
        targetUrl: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (shouldUseFallback(error)) {
      return [];
    }
    throw error;
  }
}

export async function getClickCounts(days: number) {
  if (!hasDatabaseUrl()) {
    return { total: 0, tools: 0, sponsors: 0 };
  }

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [total, tools, sponsors] = await prisma.$transaction([
      prisma.clickEvent.count({ where: { createdAt: { gte: since } } }),
      prisma.clickEvent.count({
        where: { createdAt: { gte: since }, targetType: "TOOL" },
      }),
      prisma.clickEvent.count({
        where: { createdAt: { gte: since }, targetType: "SPONSOR" },
      }),
    ]);

    return { total, tools, sponsors };
  } catch (error) {
    if (shouldUseFallback(error)) {
      return { total: 0, tools: 0, sponsors: 0 };
    }
    throw error;
  }
}

export function summarizeClickEvents(events: AnalyticsEvent[]) {
  const topTools = new Map<string, AggregatedTool>();
  const topSponsors = new Map<string, AggregatedSponsor>();

  for (const event of events) {
    if (event.targetType === "TOOL" && event.toolSlug && event.toolName && event.categorySlug) {
      const existing = topTools.get(event.toolSlug);
      if (existing) {
        existing.clicks += 1;
        if (event.createdAt > existing.latestAt) {
          existing.latestAt = event.createdAt;
        }
      } else {
        topTools.set(event.toolSlug, {
          slug: event.toolSlug,
          name: event.toolName,
          category: event.categorySlug,
          linkType: event.linkType,
          clicks: 1,
          latestAt: event.createdAt,
        });
      }
    }

    if (event.targetType === "SPONSOR" && event.sponsorId && event.sponsorTitle) {
      const existing = topSponsors.get(event.sponsorId);
      if (existing) {
        existing.clicks += 1;
        if (event.createdAt > existing.latestAt) {
          existing.latestAt = event.createdAt;
        }
      } else {
        topSponsors.set(event.sponsorId, {
          id: event.sponsorId,
          title: event.sponsorTitle,
          position: event.sponsorPosition ?? "",
          category: event.sponsorCategory ?? "all",
          linkType: event.linkType,
          clicks: 1,
          latestAt: event.createdAt,
        });
      }
    }
  }

  return {
    totalClicks: events.length,
    toolClicks: events.filter((event) => event.targetType === "TOOL").length,
    sponsorClicks: events.filter((event) => event.targetType === "SPONSOR").length,
    topTools: [...topTools.values()].sort(
      (left, right) =>
        right.clicks - left.clicks || right.latestAt.getTime() - left.latestAt.getTime(),
    ),
    topSponsors: [...topSponsors.values()].sort(
      (left, right) =>
        right.clicks - left.clicks || right.latestAt.getTime() - left.latestAt.getTime(),
    ),
    recentEvents: [...events].sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    ),
  };
}
