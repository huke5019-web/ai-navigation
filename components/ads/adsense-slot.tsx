"use client";

import { useEffect } from "react";

import { siteConfig } from "@/lib/site-config";

type Variant = "banner" | "sidebar" | "inFeed" | "footer" | "article";

const formatByVariant: Record<Variant, string> = {
  banner: "auto",
  sidebar: "rectangle",
  inFeed: "fluid",
  footer: "auto",
  article: "fluid",
};

const layoutByVariant: Partial<Record<Variant, string>> = {
  inFeed: "in-article",
  article: "in-article",
};

export function AdSenseSlot({ variant }: { variant: Variant }) {
  const slot =
    variant === "banner"
      ? siteConfig.adsenseSlots.banner
      : variant === "sidebar"
        ? siteConfig.adsenseSlots.sidebar
        : variant === "inFeed"
          ? siteConfig.adsenseSlots.inFeed
          : variant === "footer"
            ? siteConfig.adsenseSlots.footer
            : siteConfig.adsenseSlots.article;

  useEffect(() => {
    if (!slot || !siteConfig.adsenseClient || typeof window === "undefined") {
      return;
    }

    try {
      ((window as Window & { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle || []).push({});
    } catch {
      // Ignore duplicate render pushes from dev re-renders.
    }
  }, [slot]);

  if (!slot || !siteConfig.adsenseClient) {
    return null;
  }

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client={siteConfig.adsenseClient}
      data-ad-slot={slot}
      data-ad-format={formatByVariant[variant]}
      data-full-width-responsive="true"
      data-ad-layout={layoutByVariant[variant]}
    />
  );
}
