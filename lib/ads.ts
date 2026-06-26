import type { AdPlacement, Advertisement, Prisma } from "@prisma/client";

import { defaultAdvertisements } from "@/prisma/catalog";
import { prisma } from "@/lib/prisma";
import { hasDatabaseUrl } from "@/lib/prisma";

const fallbackTimestamp = new Date("2026-06-15T00:00:00.000Z");

const fallbackAdvertisements: Advertisement[] = defaultAdvertisements.map(
  (advertisement) => ({
    ...advertisement,
    startsAt: null,
    endsAt: null,
    isActive: true,
    createdAt: fallbackTimestamp,
    updatedAt: fallbackTimestamp,
  }),
);

export function isAdVisible(ad: Advertisement, now = new Date()) {
  return (
    ad.isActive &&
    (!ad.startsAt || ad.startsAt <= now) &&
    (!ad.endsAt || ad.endsAt >= now)
  );
}

export function visibleAdWhere(
  now = new Date(),
  placement?: AdPlacement,
): Prisma.AdvertisementWhereInput {
  return {
    ...(placement ? { placement } : {}),
    isActive: true,
    AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
    ],
  };
}

export async function getVisibleAds(
  placement: AdPlacement,
  now = new Date(),
) {
  if (!hasDatabaseUrl()) {
    return fallbackAdvertisements
      .filter(
        (advertisement) =>
          advertisement.placement === placement && isAdVisible(advertisement, now),
      )
      .sort((left, right) => left.sortOrder - right.sortOrder || left.id - right.id);
  }

  return prisma.advertisement.findMany({
    where: visibleAdWhere(now, placement),
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}
