/* eslint-disable @next/next/no-img-element */
import type { Advertisement } from "@prisma/client";

import { siteConfig } from "@/lib/site-config";
import { getSponsor, type SponsorPosition } from "@/lib/sponsors";
import { AdSenseSlot } from "@/components/ads/adsense-slot";
import { SponsorAd } from "@/components/ads/sponsor-ad";

type AdSlotKind = "banner" | "sidebar" | "inFeed" | "footer" | "article";

const placeholderCopy: Record<AdSlotKind, { title: string; body: string }> = {
  banner: {
    title: "Advertise with AI Navigation",
    body: "This banner slot is reserved for AdSense or sponsorship campaigns.",
  },
  sidebar: {
    title: "Sponsored placement available",
    body: "A clean sidebar unit for partner promotions, SaaS offers, and marketplace deals.",
  },
  inFeed: {
    title: "Sponsored recommendation",
    body: "This in-feed slot is ready for AdSense or a native sponsored recommendation.",
  },
  footer: {
    title: "Footer banner available",
    body: "Use this slot for evergreen sponsorships without interrupting the browsing flow.",
  },
  article: {
    title: "Content sponsorship",
    body: "A lightweight article placement for relevant tools, services, or affiliate promotions.",
  },
};

function DbAdvertisementCard({ ad }: { ad: Advertisement }) {
  return (
    <article className="ad-card">
      <span className="ad-disclosure">Ad</span>
      <a
        href={ad.targetUrl}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        aria-label={ad.title}
      >
        <img src={ad.imageUrl} alt={ad.title} />
      </a>
    </article>
  );
}

function PlaceholderAd({ kind }: { kind: AdSlotKind }) {
  const copy = placeholderCopy[kind];
  return (
    <article className="ad-placeholder-card">
      <span className="ad-disclosure">Advertising</span>
      <div>
        <h3>{copy.title}</h3>
        <p>{copy.body}</p>
      </div>
    </article>
  );
}

export function AdSlot({
  kind,
  position,
  ads = [],
  className = "",
}: {
  kind: AdSlotKind;
  position?: SponsorPosition;
  ads?: Advertisement[];
  className?: string;
}) {
  const sponsor = position ? getSponsor(position) : null;

  return (
    <div className={`ad-slot ad-slot-${kind} ${className}`.trim()}>
      {ads.length
        ? ads.map((ad) => <DbAdvertisementCard ad={ad} key={ad.id} />)
        : sponsor
          ? <SponsorAd sponsor={sponsor} />
          : siteConfig.adsenseClient
            ? (
              <div className="adsense-card">
                <span className="ad-disclosure">Ad</span>
                <AdSenseSlot variant={kind} />
              </div>
            )
            : <PlaceholderAd kind={kind} />}
    </div>
  );
}
