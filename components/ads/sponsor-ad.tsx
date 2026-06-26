/* eslint-disable @next/next/no-img-element */
import type { Sponsor } from "@/lib/sponsors";

export function SponsorAd({
  sponsor,
  className = "",
}: {
  sponsor: Sponsor;
  className?: string;
}) {
  return (
    <article className={`sponsor-card ${className}`}>
      <span className="ad-disclosure">Sponsored</span>
      <a
        href={sponsor.link}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        aria-label={sponsor.title}
      >
        <img src={sponsor.image} alt={sponsor.title} />
        <div className="sponsor-copy">
          <h3>{sponsor.title}</h3>
          <p>{sponsor.description}</p>
          <span className="sponsor-cta">Learn More</span>
        </div>
      </a>
    </article>
  );
}
