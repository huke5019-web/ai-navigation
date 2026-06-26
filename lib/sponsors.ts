import { sponsors } from "@/data/sponsors";

export type SponsorPosition =
  | "home-banner"
  | "sidebar"
  | "in-feed"
  | "tool-detail"
  | "article-inline"
  | "footer";

export type Sponsor = {
  id: string;
  title: string;
  description: string;
  image?: string;
  link: string;
  position: SponsorPosition;
  label?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
};

const sponsorsData = sponsors as readonly Sponsor[];

function isSponsorActive(sponsor: Sponsor, now = new Date()) {
  if (!sponsor.isActive) {
    return false;
  }

  const startsAt = sponsor.startDate ? new Date(sponsor.startDate) : null;
  const endsAt = sponsor.endDate ? new Date(sponsor.endDate) : null;

  return (
    (!startsAt || startsAt <= now) &&
    (!endsAt || endsAt >= now)
  );
}

export function getSponsors(position: SponsorPosition, now = new Date()) {
  return sponsorsData.filter(
    (sponsor) => sponsor.position === position && isSponsorActive(sponsor, now),
  );
}

export function getSponsor(position: SponsorPosition, now = new Date()) {
  return getSponsors(position, now)[0] ?? null;
}
