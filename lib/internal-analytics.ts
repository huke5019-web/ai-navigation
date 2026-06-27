import { randomUUID } from "node:crypto";

import { getAdminSession } from "@/lib/auth";

const REDIS_EVENT_KEY = "ai-navigation:analytics:events";
const REDIS_EVENT_LIMIT = 5000;

export type StoredAnalyticsEvent = {
  id: string;
  eventName: string;
  params: Record<string, string | number | boolean | null>;
  createdAt: string;
};

type SummaryItem = {
  key: string;
  label: string;
  count: number;
  latestAt: string;
};

type RedisConfig = {
  url: string;
  token: string;
};

function normalizeValue(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return null;
}

function getRedisConfig(): RedisConfig | null {
  const url =
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    "";
  const token =
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    "";

  if (!url || !token) {
    return null;
  }

  return { url: url.replace(/\/+$/, ""), token };
}

export function hasPersistentAnalyticsStore() {
  return Boolean(getRedisConfig());
}

async function executeRedisCommand<T>(command: unknown[]): Promise<T | null> {
  const config = getRedisConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Analytics store request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as { result?: T };
  return payload.result ?? null;
}

async function executeRedisPipeline(commands: unknown[][]) {
  const config = getRedisConfig();
  if (!config) {
    return;
  }

  const response = await fetch(`${config.url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Analytics store pipeline failed with ${response.status}.`);
  }
}

function sortSummaryItems(map: Map<string, SummaryItem>) {
  return [...map.values()].sort((left, right) => {
    return right.count - left.count || right.latestAt.localeCompare(left.latestAt);
  });
}

export async function recordStoredAnalyticsEvent(input: {
  eventName: string;
  params?: Record<string, unknown>;
}) {
  if (!(await shouldRecordInternalAnalytics())) {
    return null;
  }

  const config = getRedisConfig();
  if (!config) {
    return null;
  }

  const params = Object.fromEntries(
    Object.entries(input.params ?? {}).map(([key, value]) => [key, normalizeValue(value)]),
  );

  const event: StoredAnalyticsEvent = {
    id: randomUUID(),
    eventName: input.eventName,
    params,
    createdAt: new Date().toISOString(),
  };

  await executeRedisPipeline([
    ["LPUSH", REDIS_EVENT_KEY, JSON.stringify(event)],
    ["LTRIM", REDIS_EVENT_KEY, 0, REDIS_EVENT_LIMIT - 1],
  ]);

  return event;
}

export async function getStoredAnalyticsEvents(limit = 500): Promise<StoredAnalyticsEvent[]> {
  if (!getRedisConfig()) {
    return [];
  }

  const result = await executeRedisCommand<string[]>(["LRANGE", REDIS_EVENT_KEY, 0, limit - 1]);
  return (result ?? [])
    .map((entry) => {
      try {
        return JSON.parse(entry) as StoredAnalyticsEvent;
      } catch {
        return null;
      }
    })
    .filter((event): event is StoredAnalyticsEvent => Boolean(event?.eventName && event?.createdAt));
}

async function shouldRecordInternalAnalytics() {
  const adminSession = await getAdminSession();
  return !adminSession;
}

export function summarizeStoredAnalyticsEvents(events: StoredAnalyticsEvent[]) {
  const eventCounts = new Map<string, SummaryItem>();
  const topPages = new Map<string, SummaryItem>();
  const topSearches = new Map<string, SummaryItem>();
  const topTools = new Map<string, SummaryItem>();
  const topSponsors = new Map<string, SummaryItem>();

  for (const event of events) {
    const createdAt = event.createdAt;
    const existingEvent = eventCounts.get(event.eventName);
    if (existingEvent) {
      existingEvent.count += 1;
      if (createdAt > existingEvent.latestAt) {
        existingEvent.latestAt = createdAt;
      }
    } else {
      eventCounts.set(event.eventName, {
        key: event.eventName,
        label: event.eventName,
        count: 1,
        latestAt: createdAt,
      });
    }

    const pagePath = typeof event.params.page_path === "string" ? event.params.page_path : null;
    if (event.eventName === "page_view" && pagePath) {
      const existingPage = topPages.get(pagePath);
      if (existingPage) {
        existingPage.count += 1;
        if (createdAt > existingPage.latestAt) {
          existingPage.latestAt = createdAt;
        }
      } else {
        topPages.set(pagePath, {
          key: pagePath,
          label: pagePath,
          count: 1,
          latestAt: createdAt,
        });
      }
    }

    const searchTerm =
      typeof event.params.search_term === "string" ? event.params.search_term.trim() : "";
    if (event.eventName === "search" && searchTerm) {
      const existingSearch = topSearches.get(searchTerm);
      if (existingSearch) {
        existingSearch.count += 1;
        if (createdAt > existingSearch.latestAt) {
          existingSearch.latestAt = createdAt;
        }
      } else {
        topSearches.set(searchTerm, {
          key: searchTerm,
          label: searchTerm,
          count: 1,
          latestAt: createdAt,
        });
      }
    }

    const toolKey =
      typeof event.params.tool_slug === "string"
        ? event.params.tool_slug
        : typeof event.params.tool_name === "string"
          ? event.params.tool_name
          : "";
    const toolLabel =
      typeof event.params.tool_name === "string" ? event.params.tool_name : toolKey;
    if (
      (event.eventName === "tool_detail_click" ||
        event.eventName === "affiliate_click" ||
        event.eventName === "outbound_tool_click") &&
      toolKey
    ) {
      const existingTool = topTools.get(toolKey);
      if (existingTool) {
        existingTool.count += 1;
        if (createdAt > existingTool.latestAt) {
          existingTool.latestAt = createdAt;
        }
      } else {
        topTools.set(toolKey, {
          key: toolKey,
          label: toolLabel,
          count: 1,
          latestAt: createdAt,
        });
      }
    }

    const sponsorKey =
      typeof event.params.sponsor_id === "string"
        ? event.params.sponsor_id
        : typeof event.params.sponsor_title === "string"
          ? event.params.sponsor_title
          : "";
    const sponsorLabel =
      typeof event.params.sponsor_title === "string" ? event.params.sponsor_title : sponsorKey;
    if (event.eventName === "outbound_sponsor_click" && sponsorKey) {
      const existingSponsor = topSponsors.get(sponsorKey);
      if (existingSponsor) {
        existingSponsor.count += 1;
        if (createdAt > existingSponsor.latestAt) {
          existingSponsor.latestAt = createdAt;
        }
      } else {
        topSponsors.set(sponsorKey, {
          key: sponsorKey,
          label: sponsorLabel,
          count: 1,
          latestAt: createdAt,
        });
      }
    }
  }

  return {
    totalEvents: events.length,
    eventCounts: sortSummaryItems(eventCounts),
    topPages: sortSummaryItems(topPages),
    topSearches: sortSummaryItems(topSearches),
    topTools: sortSummaryItems(topTools),
    topSponsors: sortSummaryItems(topSponsors),
    recentEvents: [...events].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
  };
}
