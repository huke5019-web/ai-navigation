import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export function ContentPage({
  title,
  intro,
  breadcrumbs,
  children,
}: {
  title: string;
  intro: string;
  breadcrumbs: { label: string; href?: string }[];
  children: ReactNode;
}) {
  return (
    <main className="content-page">
      <Breadcrumbs items={breadcrumbs} />
      <header className="content-page-header">
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      <div className="content-page-body">{children}</div>
    </main>
  );
}
