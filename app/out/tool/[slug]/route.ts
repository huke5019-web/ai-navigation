import { NextResponse } from "next/server";

import { recordToolClick } from "@/lib/clicks";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const targetUrl = await recordToolClick(slug);

  return NextResponse.redirect(new URL(targetUrl ?? "/", request.url));
}
