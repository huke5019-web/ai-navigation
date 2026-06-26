import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import AdvertisePage from "@/app/(public)/advertise/page";
import { SponsorAd } from "@/components/ads/sponsor-ad";

const sponsor = {
  id: "ad-001",
  title: "Advertise Your AI Tool",
  description: "Promote your AI product to users looking for the best AI tools.",
  image: "/ads/ai-tool-ad.svg",
  link: "/advertise",
  position: "in-feed" as const,
  label: "Sponsored",
  isActive: true,
};

describe("sponsor ads", () => {
  test("uses configured copy and internal links without sponsored rel", () => {
    render(<SponsorAd sponsor={sponsor} />);

    expect(screen.getByText("Sponsored")).toBeInTheDocument();
    expect(screen.getByText("Advertise Your AI Tool")).toBeInTheDocument();
    expect(
      screen.getByText("Promote your AI product to users looking for the best AI tools."),
    ).toBeInTheDocument();
    expect(screen.getByText("Learn More")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Advertise Your AI Tool" })).toHaveAttribute(
      "href",
      "/advertise",
    );
    expect(screen.getByRole("img", { name: "Advertise Your AI Tool" })).toHaveAttribute(
      "src",
      "/ads/ai-tool-ad.svg",
    );
    expect(screen.getByRole("link", { name: "Advertise Your AI Tool" })).not.toHaveAttribute(
      "target",
    );
  });
});

describe("advertise page", () => {
  test("shows the updated ad sales content", async () => {
    render(await AdvertisePage());

    expect(screen.getByRole("heading", { name: "Advertise on AI Navigation" })).toBeInTheDocument();
    expect(
      screen.getByText(/homepage advertising, tool list sponsored recommendations/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact Us" })).toHaveAttribute(
      "href",
      "mailto:ads@example.com",
    );
  });
});
