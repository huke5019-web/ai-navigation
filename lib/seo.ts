import type { Metadata } from "next";

import { absoluteUrl, siteConfig } from "@/lib/site-config";

type MetadataInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
};

export function buildMetadata({
  title,
  description,
  path = "/",
  image = "https://placehold.co/1200x630/090d12/f4f7fb?text=AI+Navigation",
  keywords = [],
}: MetadataInput): Metadata {
  const canonical = absoluteUrl(path);

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: siteConfig.xHandle,
      images: [image],
    },
  };
}

export function categorySeo(slug?: string) {
  if (!slug) {
    return {
      title: "AI Navigation - Best AI Tools Directory for Work and Creativity",
      description:
        "Browse top AI tools for writing, coding, image generation, productivity, and everyday work.",
    };
  }

  const labels: Record<string, string> = {
    chat: "Best AI Chat Tools",
    writing: "Best AI Writing Tools",
    image: "Best AI Image Generators",
    coding: "Best AI Coding Tools",
  };

  const label = labels[slug] ?? "Best AI Tools";

  return {
    title: `${label} | AI Navigation`,
    description: `Compare ${label.toLowerCase()} with practical use cases, pricing notes, and direct links.`,
  };
}
