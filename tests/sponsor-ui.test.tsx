import type { Advertisement } from "@prisma/client";
import { AdPlacement } from "@prisma/client";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import AdsGuidePage from "@/app/admin/ads-guide/page";
import AdvertisePage from "@/app/(public)/advertise/page";
import { AdSlot } from "@/components/public/ad-slot";
import { SponsorAd } from "@/components/ads/sponsor-ad";

const directSponsor = {
  id: "homepage-banner-001",
  title: "Promote Your AI Product",
  description: "Reach users who are actively searching for AI tools.",
  image: "/ads/homepage-banner.svg",
  link: "/advertise",
  position: "homeBanner" as const,
  category: "all",
  label: "Sponsored",
  type: "direct" as const,
  isActive: true,
};

const affiliateSponsor = {
  id: "coding-banner-affiliate-001",
  title: "Featured AI Coding Tool",
  description: "Build, debug and ship projects faster with AI coding assistance.",
  image: "/ads/coding-ai-tool.svg",
  link: "https://www.cursor.com/",
  position: "categoryBanner" as const,
  category: "coding",
  label: "Sponsored",
  type: "affiliate" as const,
  isActive: true,
};

afterEach(() => {
  cleanup();
});

describe("sponsor ads", () => {
  test("uses configured copy and internal links without sponsored rel", () => {
    render(<SponsorAd sponsor={directSponsor} />);

    expect(screen.getByText("Sponsored")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Promote Your AI Product" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Reach users who are actively searching for AI tools."),
    ).toBeInTheDocument();
    expect(screen.getByText("Learn More")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Promote Your AI Product" })).toHaveAttribute(
      "href",
      "/advertise",
    );
    expect(screen.getByRole("img", { name: "Promote Your AI Product" })).toHaveAttribute(
      "src",
      "/ads/homepage-banner.svg",
    );
    expect(screen.getByRole("link", { name: "Promote Your AI Product" })).not.toHaveAttribute(
      "target",
    );
  });

  test("uses sponsored rel for external affiliate links", () => {
    render(<SponsorAd sponsor={affiliateSponsor} />);

    expect(screen.getByRole("link", { name: "Featured AI Coding Tool" })).toHaveAttribute(
      "href",
      "https://www.cursor.com/",
    );
    expect(screen.getByRole("link", { name: "Featured AI Coding Tool" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "Featured AI Coding Tool" })).toHaveAttribute(
      "rel",
      "nofollow sponsored noopener noreferrer",
    );
  });

  test("homepage banner ad reads homeBanner sponsor data", () => {
    render(<AdSlot kind="banner" position="homeBanner" ads={[]} />);

    expect(screen.getByText("Promote Your AI Product")).toBeInTheDocument();
    expect(
      screen.getByText("Reach users who are actively searching for AI tools."),
    ).toBeInTheDocument();
  });

  test("category banner ad reads category-specific affiliate sponsor data", () => {
    render(<AdSlot kind="banner" position="categoryBanner" category="coding" ads={[]} />);

    expect(screen.getByText("Featured AI Coding Tool")).toBeInTheDocument();
    expect(
      screen.getByText("Build, debug and ship projects faster with AI coding assistance."),
    ).toBeInTheDocument();
  });

  test("sidebar ads fall back to category all when there is no category-specific sponsor", () => {
    render(<AdSlot kind="sidebar" position="sidebar" category="video" ads={[]} />);

    expect(screen.getByText("Ad")).toBeInTheDocument();
    expect(screen.getByText("Advertise on AI Navigation")).toBeInTheDocument();
    expect(
      screen.getByText("Promote your AI tool to creators, developers and business users."),
    ).toBeInTheDocument();
  });

  test("manual sponsor data is used before database ad fallbacks", () => {
    const databaseAd: Advertisement = {
      id: 99,
      title: "Database Banner",
      imageUrl: "/ads/advertise-sidebar.svg",
      targetUrl: "/advertise",
      placement: AdPlacement.HOME_BANNER,
      sortOrder: 1,
      isActive: true,
      startsAt: null,
      endsAt: null,
      createdAt: new Date("2026-06-26T00:00:00.000Z"),
      updatedAt: new Date("2026-06-26T00:00:00.000Z"),
    };

    render(<AdSlot kind="banner" position="homeBanner" ads={[databaseAd]} />);

    expect(screen.getByText("Promote Your AI Product")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Database Banner" })).not.toBeInTheDocument();
  });

  test("database ads still render when no manual sponsor position is provided", () => {
    const databaseAd: Advertisement = {
      id: 100,
      title: "Database Sidebar",
      imageUrl: "/ads/advertise-sidebar.svg",
      targetUrl: "/advertise",
      placement: AdPlacement.HOME_SIDEBAR,
      sortOrder: 1,
      isActive: true,
      startsAt: null,
      endsAt: null,
      createdAt: new Date("2026-06-26T00:00:00.000Z"),
      updatedAt: new Date("2026-06-26T00:00:00.000Z"),
    };

    render(<AdSlot kind="sidebar" ads={[databaseAd]} />);

    expect(screen.getByRole("img", { name: "Database Sidebar" })).toBeInTheDocument();
  });
});

describe("advertise page", () => {
  test("shows the expanded ad sales content", async () => {
    render(await AdvertisePage());

    expect(screen.getByRole("heading", { name: "Advertise on AI Navigation" })).toBeInTheDocument();
    expect(
      screen.getByText(/ai tools, saas, developer tools, and productivity software/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Homepage Banner")).toBeInTheDocument();
    expect(screen.getByText("Category Banner")).toBeInTheDocument();
    expect(screen.getByText("Sidebar Sponsor")).toBeInTheDocument();
    expect(screen.getByText("Tool List Sponsored Card")).toBeInTheDocument();
    expect(screen.getByText("Tool Detail Promotion")).toBeInTheDocument();
    expect(screen.getByText("Image Ads")).toBeInTheDocument();
    expect(screen.getByText("Affiliate Recommendations")).toBeInTheDocument();
    expect(screen.getByText("Homepage Banner: Contact for pricing")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
      "href",
      "mailto:huke5019@gmail.com",
    );
  });
});

describe("ads guide page", () => {
  test("explains how to manage sponsors from the data file", async () => {
    render(await AdsGuidePage());

    expect(screen.getByRole("heading", { name: "Ads Configuration Guide" })).toBeInTheDocument();
    expect(screen.getByText("data/sponsors.ts")).toBeInTheDocument();
    expect(screen.getAllByText("public/ads/").length).toBeGreaterThan(0);
    expect(screen.getByText("homeBanner")).toBeInTheDocument();
    expect(screen.getByText("categoryBanner")).toBeInTheDocument();
    expect(screen.getByText('type: "affiliate"')).toBeInTheDocument();
    expect(screen.getByText("isActive")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Advertise Page" })).toHaveAttribute(
      "href",
      "/advertise",
    );
  });
});
