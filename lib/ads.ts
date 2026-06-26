import type { AdPlacement, Advertisement, Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

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
  return prisma.advertisement.findMany({
    where: visibleAdWhere(now, placement),
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}
