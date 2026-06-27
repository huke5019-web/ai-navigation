"use client";

import { siteConfig } from "@/lib/site-config";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

function sendInternalAnalytics(name: string, params: EventParams = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = JSON.stringify({
    eventName: name,
    params,
  });

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/analytics/track", blob);
    return;
  }

  void fetch("/api/analytics/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
    keepalive: true,
  });
}

export function pageView(url: string) {
  const pagePath = new URL(url).pathname;

  sendInternalAnalytics("page_view", {
    page_location: url,
    page_path: pagePath,
  });

  if (siteConfig.gaId && typeof window !== "undefined" && window.gtag) {
    window.gtag("config", siteConfig.gaId, {
      page_location: url,
      page_path: pagePath,
    });
  }
}

export function trackEvent(name: string, params: EventParams = {}) {
  sendInternalAnalytics(name, params);

  if (siteConfig.gaId && typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
}
