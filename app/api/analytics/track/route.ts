import { NextResponse } from "next/server";
import { z } from "zod";

import { recordStoredAnalyticsEvent } from "@/lib/internal-analytics";

const analyticsSchema = z.object({
  eventName: z.string().trim().min(1).max(80),
  params: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = analyticsSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await recordStoredAnalyticsEvent(result.data);
  return new NextResponse(null, { status: 204 });
}
