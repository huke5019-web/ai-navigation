export const siteConfig = {
  name: "AI Navigation",
  shortName: "AI Navigation",
  description:
    "Discover the best AI tools for work, creativity, and growth with curated reviews, categories, and practical buying guides.",
  defaultLocale: "en-US",
  creator: "AI Navigation",
  themeColor: "#090d12",
  xHandle: "@ainavigationhq",
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "https://ai-navigation-ifw5.vercel.app",
  googleSiteVerification:
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined,
  gaId: process.env.NEXT_PUBLIC_GA_ID?.trim() || undefined,
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || undefined,
  adsenseAutoAds:
    (process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS?.trim() || "false") === "true",
  adsenseSlots: {
    banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER?.trim() || undefined,
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR?.trim() || undefined,
    inFeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED?.trim() || undefined,
    footer: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER?.trim() || undefined,
    article: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE?.trim() || undefined,
  },
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.siteUrl).toString();
}

export function hasAdSenseClient() {
  return Boolean(siteConfig.adsenseClient);
}

export function hasGaId() {
  return Boolean(siteConfig.gaId);
}
