import { NextResponse } from "next/server";

import { recordSponsorClick } from "@/lib/clicks";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const targetUrl = await recordSponsorClick(id);

  return NextResponse.redirect(new URL(targetUrl ?? "/advertise", request.url));
}
