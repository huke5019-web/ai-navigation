/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { buildSponsorOutboundHref } from "@/lib/click-paths";
import type { Sponsor } from "@/lib/sponsors";

function isExternalLink(href: string) {
  return /^https?:\/\//i.test(href);
}

export function SponsorAd({
  sponsor,
  className = "",
}: {
  sponsor: Sponsor;
  className?: string;
}) {
  const image = sponsor.image?.trim();
  const buttonLabel =
    sponsor.buttonLabel?.trim() ||
    (sponsor.type === "affiliate" ? "Try Now" : "Learn More");
  const trackedHref = buildSponsorOutboundHref(sponsor.id);
  const body = (
    <>
      {image ? <img src={image} alt={sponsor.title} /> : null}
      <div className="sponsor-copy">
        <h3>{sponsor.title}</h3>
        <p>{sponsor.description}</p>
        <span className="sponsor-cta">{buttonLabel}</span>
      </div>
    </>
  );

  return (
    <article className={`sponsor-card ${className}`}>
      <span className="ad-disclosure">{sponsor.label?.trim() || "Sponsored"}</span>
      {isExternalLink(sponsor.link) ? (
        <a
          href={trackedHref}
          target="_blank"
          rel="nofollow sponsored noopener noreferrer"
          aria-label={sponsor.title}
        >
          {body}
        </a>
      ) : (
        <Link href={trackedHref} aria-label={sponsor.title}>
          {body}
        </Link>
      )}
    </article>
  );
}
