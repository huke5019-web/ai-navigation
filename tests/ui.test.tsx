import { readFileSync } from "node:fs";
import path from "node:path";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getActiveCategories: vi.fn(),
  getFeaturedTools: vi.fn(),
  getRelatedTools: vi.fn(),
  getSiteSetting: vi.fn(),
  getToolBySlug: vi.fn(),
  getTools: vi.fn(),
  getVisibleAds: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/queries", () => ({
  getActiveCategories: mocks.getActiveCategories,
  getFeaturedTools: mocks.getFeaturedTools,
  getRelatedTools: mocks.getRelatedTools,
  getSiteSetting: mocks.getSiteSetting,
  getToolBySlug: mocks.getToolBySlug,
  getTools: mocks.getTools,
}));
vi.mock("@/lib/ads", () => ({ getVisibleAds: mocks.getVisibleAds }));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));

import HomePage from "@/app/(public)/page";
import ToolDetailPage from "@/app/(public)/tools/[slug]/page";
import { AdSlot } from "@/components/public/ad-slot";
import { Sidebar } from "@/components/public/sidebar";
import { ToolCard } from "@/components/public/tool-card";

const category = {
  id: 1,
  name: "AI 写作",
  slug: "writing",
  icon: "PenLine",
  sortOrder: 10,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const tool = {
  id: 1,
  categoryId: 1,
  name: "灵感写手",
  slug: "idea-writer",
  logoUrl: null,
  summary: "快速生成清晰自然的中文内容。",
  description: "适合文章、社交媒体和营销文案的 AI 写作工具。",
  websiteUrl: "https://example.com/tool",
  officialUrl: "https://example.com/tool",
  affiliateUrl: null,
  isSponsored: false,
  sponsorLabel: null,
  couponCode: null,
  pricing: null,
  sortOrder: 10,
  isActive: true,
  isFeatured: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  category,
  tags: [{ toolId: 1, tagId: 1, tag: { id: 1, name: "中文", slug: "chinese" } }],
};

const ad = {
  id: 1,
  title: "效率工具推广",
  imageUrl: "https://example.com/ad.png",
  targetUrl: "https://example.com/ad",
  placement: "HOME_SIDEBAR" as const,
  startsAt: null,
  endsAt: null,
  isActive: true,
  sortOrder: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("public components", () => {
  test("sidebar brand keeps title and subtitle in dedicated wrappers", () => {
    render(
      <Sidebar
        setting={{
          id: 1,
          siteName: "AI 导航",
          siteDescription: "发现值得使用的 AI 工具",
          logoUrl: null,
          footerText: "AI 导航",
          updatedAt: new Date(),
        }}
        categories={[]}
      />,
    );

    expect(screen.getByText("AI 导航")).toHaveClass("brand-title");
    expect(screen.getByText("Curated tools for work and creativity")).toHaveClass(
      "brand-subtitle",
    );
  });

  test("tool card exposes detail and external links", () => {
    render(<ToolCard tool={tool} />);
    expect(screen.getByText("灵感写手")).toBeInTheDocument();
    expect(screen.getByText("快速生成清晰自然的中文内容。")).toBeInTheDocument();
    expect(screen.getByText("AI 写作")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "View 灵感写手 details" })[0]).toHaveAttribute(
      "href",
      "/tools/idea-writer",
    );
    expect(screen.getByRole("link", { name: "Visit 灵感写手" })).toHaveAttribute(
      "href",
      "https://example.com/tool",
    );
  });

  test("tool card renders its configured icon", () => {
    render(<ToolCard tool={{ ...tool, logoUrl: "https://example.com/logo.svg" }} />);
    expect(screen.getByRole("img", { name: "灵感写手图标" })).toHaveAttribute(
      "src",
      "https://example.com/logo.svg",
    );
  });

  test("tool icon falls back to the initial after an image error", () => {
    render(<ToolCard tool={{ ...tool, logoUrl: "https://example.com/broken.svg" }} />);
    fireEvent.error(screen.getByRole("img", { name: "灵感写手图标" }));
    expect(screen.queryByRole("img", { name: "灵感写手图标" })).not.toBeInTheDocument();
    expect(screen.getByText("灵")).toBeInTheDocument();
  });

  test("ad slot shows placeholder and labelled ads", () => {
    const { rerender } = render(<AdSlot kind="sidebar" ads={[]} />);
    expect(screen.getByText("Advertising")).toBeInTheDocument();
    rerender(<AdSlot kind="sidebar" ads={[ad]} />);
    expect(screen.getByText("Ad")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "效率工具推广" })).toBeInTheDocument();
  });
});

describe("public pages", () => {
  test("home reads filters and renders updated sections", async () => {
    mocks.getSiteSetting.mockResolvedValue({
      id: 1,
      siteName: "AI 导航",
      siteDescription: "发现实用 AI 工具",
      logoUrl: null,
      footerText: "AI 导航",
      updatedAt: new Date(),
    });
    mocks.getActiveCategories.mockResolvedValue([category]);
    mocks.getFeaturedTools.mockResolvedValue([tool]);
    mocks.getTools.mockResolvedValue([tool]);
    mocks.getVisibleAds
      .mockResolvedValueOnce([{ ...ad, placement: "HOME_BANNER" }])
      .mockResolvedValueOnce([ad]);

    render(await HomePage({ searchParams: Promise.resolve({ q: "写作" }) }));

    expect(mocks.getTools).toHaveBeenCalledWith({ query: "写作" });
    expect(screen.getByRole("searchbox", { name: "Search AI tools" })).toHaveValue("写作");
    expect(screen.getByRole("heading", { name: "Featured Tools" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tool Directory" })).toBeInTheDocument();
  });

  test("home shows an accessible empty state", async () => {
    mocks.getSiteSetting.mockResolvedValue(null);
    mocks.getActiveCategories.mockResolvedValue([]);
    mocks.getFeaturedTools.mockResolvedValue([]);
    mocks.getTools.mockResolvedValue([]);
    mocks.getVisibleAds.mockResolvedValue([]);

    render(await HomePage({ searchParams: Promise.resolve({ q: "不存在" }) }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "No matching tools yet. Try a different keyword or category.",
    );
  });

  test("detail renders content, ad, and related tools", async () => {
    mocks.getToolBySlug.mockResolvedValue(tool);
    mocks.getRelatedTools.mockResolvedValue([{ ...tool, id: 2, slug: "related" }]);
    mocks.getVisibleAds.mockResolvedValue([{ ...ad, placement: "TOOL_DETAIL" }]);

    render(await ToolDetailPage({ params: Promise.resolve({ slug: "idea-writer" }) }));

    expect(screen.getByText(tool.description)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Visit 灵感写手" })[0]).toHaveAttribute(
      "rel",
      expect.stringContaining("noreferrer"),
    );
    expect(screen.getByRole("heading", { name: "Related Tools" })).toBeInTheDocument();
  });
});

test("approved B layout keeps responsive sidebar and ad rail", () => {
  const css = readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf8");
  expect(css).toContain("#090d12");
  expect(css).toMatch(/grid-template-columns:\s*240px\s+minmax\(0,\s*1fr\)\s+280px/);
  expect(css).toMatch(/@media\s*\(max-width:\s*1100px\)/);
  expect(css).toMatch(/@media\s*\(max-width:\s*760px\)/);
  expect(css).toMatch(/\.mobile-category-nav[\s\S]*overflow-x:\s*auto/);
});
