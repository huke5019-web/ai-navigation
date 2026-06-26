import Script from "next/script";

import { siteConfig } from "@/lib/site-config";

export function AdSenseScript() {
  if (!siteConfig.adsenseClient) {
    return null;
  }

  return (
    <>
      <Script
        async
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.adsenseClient}`}
        strategy="afterInteractive"
      />
      {siteConfig.adsenseAutoAds ? (
        <Script id="adsense-auto-ads" strategy="afterInteractive">
          {`
            (window.adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: '${siteConfig.adsenseClient}',
              enable_page_level_ads: true
            });
          `}
        </Script>
      ) : null}
    </>
  );
}
