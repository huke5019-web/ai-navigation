"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

import { pageView } from "@/lib/analytics";
import { absoluteUrl, siteConfig } from "@/lib/site-config";

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname || !siteConfig.gaId) {
      return;
    }

    const query = searchParams?.toString();
    pageView(absoluteUrl(query ? `${pathname}?${query}` : pathname));
  }, [pathname, searchParams]);

  if (!siteConfig.gaId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${siteConfig.gaId}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
