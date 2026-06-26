import { sponsors } from "@/data/sponsors";

export type SponsorPosition =
  | "home-banner"
  | "categoryBanner"
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
  category?: string;
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

export function getSponsors(
  position: SponsorPosition,
  options: { category?: string; now?: Date } = {},
) {
  const { category, now = new Date() } = options;
  const activeSponsors = sponsorsData.filter(
    (sponsor) => sponsor.position === position && isSponsorActive(sponsor, now),
  );

  if (!category) {
    return activeSponsors.filter((sponsor) => !sponsor.category);
  }

  const matchingCategory = activeSponsors.filter((sponsor) => sponsor.category === category);
  if (matchingCategory.length) {
    return matchingCategory;
  }

  return activeSponsors.filter((sponsor) => !sponsor.category);
}

export function getSponsor(
  position: SponsorPosition,
  options: { category?: string; now?: Date } = {},
) {
  return getSponsors(position, options)[0] ?? null;
}
