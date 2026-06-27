import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import "../admin.css";

const navigation = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/ads", label: "Ads" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/ads-guide", label: "Ads Guide" },
];

export default async function Layout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="admin-shell">
      <aside>
        <h2>AI Navigation</h2>
        {navigation.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
        <form action={logoutAction}>
          <button>Sign out</button>
        </form>
      </aside>
      <main>{children}</main>
    </div>
  );
}
