"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { trackEvent } from "@/lib/analytics";

type TrackedLinkProps = {
  href: string;
  eventName: string;
  eventParams?: Record<string, string | number | boolean | undefined>;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
};

export function TrackedLink({
  href,
  eventName,
  eventParams,
  className,
  children,
  ariaLabel,
}: TrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={() => trackEvent(eventName, eventParams)}
    >
      {children}
    </Link>
  );
}
