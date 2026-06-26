"use client";

import { siteConfig } from "@/lib/site-config";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

export function pageView(url: string) {
  if (!siteConfig.gaId || typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("config", siteConfig.gaId, {
    page_location: url,
    page_path: new URL(url).pathname,
  });
}

export function trackEvent(name: string, params: EventParams = {}) {
  if (!siteConfig.gaId || typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", name, params);
}
