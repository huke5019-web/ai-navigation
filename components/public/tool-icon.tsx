"use client";

import { useState } from "react";

export function ToolIcon({
  logoUrl,
  name,
}: {
  logoUrl: string | null;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().slice(0, 1).toUpperCase();

  if (!logoUrl || failed) {
    return <span aria-hidden="true">{initial}</span>;
  }

  return (
    <img
      src={logoUrl}
      alt={`${name}图标`}
      onError={() => setFailed(true)}
    />
  );
}
