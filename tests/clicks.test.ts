import { describe, expect, test } from "vitest";

import {
  buildSponsorOutboundHref,
  buildToolOutboundHref,
  summarizeClickEvents,
  type AnalyticsEvent,
} from "@/lib/clicks";

describe("outbound click helpers", () => {
  test("builds stable tracking routes for tools and sponsors", () => {
    expect(buildToolOutboundHref("chatgpt")).toBe("/out/tool/chatgpt");
    expect(buildSponsorOutboundHref("homepage-banner-001")).toBe("/out/sponsor/homepage-banner-001");
  });

  test("summarizes recent click events into top lists", () => {
    const events: AnalyticsEvent[] = [
      {
        id: "1",
        targetType: "TOOL",
        linkType: "AFFILIATE",
        toolSlug: "cursor",
        toolName: "Cursor",
        categorySlug: "coding",
        sponsorId: null,
        sponsorTitle: null,
        sponsorPosition: null,
        sponsorCategory: null,
        targetUrl: "https://cursor.com",
        createdAt: new Date("2026-06-27T10:00:00.000Z"),
      },
      {
        id: "2",
        targetType: "TOOL",
        linkType: "AFFILIATE",
        toolSlug: "cursor",
        toolName: "Cursor",
        categorySlug: "coding",
        sponsorId: null,
        sponsorTitle: null,
        sponsorPosition: null,
        sponsorCategory: null,
        targetUrl: "https://cursor.com",
        createdAt: new Date("2026-06-27T11:00:00.000Z"),
      },
      {
        id: "3",
        targetType: "SPONSOR",
        linkType: "DIRECT",
        toolSlug: null,
        toolName: null,
        categorySlug: null,
        sponsorId: "sidebar-advertise-001",
        sponsorTitle: "Advertise on AI Navigation",
        sponsorPosition: "sidebar",
        sponsorCategory: "all",
        targetUrl: "/advertise",
        createdAt: new Date("2026-06-27T12:00:00.000Z"),
      },
    ];

    const summary = summarizeClickEvents(events);

    expect(summary.totalClicks).toBe(3);
    expect(summary.toolClicks).toBe(2);
    expect(summary.sponsorClicks).toBe(1);
    expect(summary.topTools[0]).toMatchObject({
      slug: "cursor",
      name: "Cursor",
      clicks: 2,
    });
    expect(summary.topSponsors[0]).toMatchObject({
      id: "sidebar-advertise-001",
      title: "Advertise on AI Navigation",
      clicks: 1,
    });
  });
});
