import type { Advertisement } from "@prisma/client";

export function AdSlot({ ads, className = "" }: { ads: Advertisement[]; className?: string }) {
  if (!ads.length) return null;
  return <div className={`ad-slot ${className}`}>
    {ads.map((ad) => <article className="ad-card" key={ad.id}>
      <span>广告</span>
      <a href={ad.targetUrl} target="_blank" rel="noreferrer" aria-label={ad.title}>
        <img src={ad.imageUrl} alt={ad.title} />
      </a>
    </article>)}
  </div>;
}
