import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { AdSenseScript } from "@/components/analytics/adsense-script";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { JsonLd } from "@/components/seo/json-ld";
import { getSiteSetting } from "@/lib/queries";
import { siteConfig } from "@/lib/site-config";
import { absoluteUrl } from "@/lib/site-config";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await getSiteSetting();
  const title = setting?.siteName ?? siteConfig.name;
  const description = setting?.siteDescription ?? siteConfig.description;

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    verification: siteConfig.googleSiteVerification
      ? { google: siteConfig.googleSiteVerification }
      : undefined,
    alternates: {
      canonical: absoluteUrl("/"),
    },
    openGraph: {
      type: "website",
      siteName: title,
      title,
      description,
      url: absoluteUrl("/"),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.siteUrl,
            description: siteConfig.description,
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteConfig.siteUrl}/?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteConfig.name,
            url: siteConfig.siteUrl,
          }}
        />
        {children}
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <AdSenseScript />
      </body>
    </html>
  );
}
