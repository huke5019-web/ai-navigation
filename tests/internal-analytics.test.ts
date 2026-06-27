import { describe, expect, test, vi } from "vitest";

import {
  hasPersistentAnalyticsStore,
  summarizeStoredAnalyticsEvents,
  type StoredAnalyticsEvent,
} from "@/lib/internal-analytics";

describe("internal analytics helpers", () => {
  test("detects Redis-style environment variables", () => {
    vi.stubEnv("KV_REST_API_URL", "https://example.upstash.io");
    vi.stubEnv("KV_REST_API_TOKEN", "token");

    expect(hasPersistentAnalyticsStore()).toBe(true);
  });

  test("summarizes page views, searches, tools, and sponsors", () => {
    const events: StoredAnalyticsEvent[] = [
      {
        id: "1",
        eventName: "page_view",
        params: { page_path: "/categories/coding" },
        createdAt: "2026-06-27T10:00:00.000Z",
      },
      {
        id: "2",
        eventName: "search",
        params: { search_term: "chatgpt" },
        createdAt: "2026-06-27T10:05:00.000Z",
      },
      {
        id: "3",
        eventName: "outbound_tool_click",
        params: { tool_slug: "cursor", tool_name: "Cursor" },
        createdAt: "2026-06-27T10:10:00.000Z",
      },
      {
        id: "4",
        eventName: "outbound_tool_click",
        params: { tool_slug: "cursor", tool_name: "Cursor" },
        createdAt: "2026-06-27T10:15:00.000Z",
      },
      {
        id: "5",
        eventName: "outbound_sponsor_click",
        params: { sponsor_id: "sidebar-1", sponsor_title: "Advertise Here" },
        createdAt: "2026-06-27T10:20:00.000Z",
      },
    ];

    const summary = summarizeStoredAnalyticsEvents(events);

    expect(summary.totalEvents).toBe(5);
    expect(summary.eventCounts[0]).toMatchObject({
      key: "outbound_tool_click",
      count: 2,
    });
    expect(summary.topPages[0]).toMatchObject({
      label: "/categories/coding",
      count: 1,
    });
    expect(summary.topSearches[0]).toMatchObject({
      label: "chatgpt",
      count: 1,
    });
    expect(summary.topTools[0]).toMatchObject({
      key: "cursor",
      label: "Cursor",
      count: 2,
    });
    expect(summary.topSponsors[0]).toMatchObject({
      key: "sidebar-1",
      label: "Advertise Here",
      count: 1,
    });
  });
});
