import Link from "next/link";

import { getDashboardStats } from "@/lib/queries";

export default async function AdminOverviewPage() {
  const stats = await getDashboardStats();

  return (
    <>
      <h1>Overview</h1>
      <p className="admin-note">
        Quick snapshot of the directory plus shortcuts to ads and analytics.
      </p>
      <div className="admin-grid">
        {[
          ["Total tools", stats.totalTools],
          ["Active categories", stats.activeCategories],
          ["Visible ads", stats.visibleAds],
          ["Featured tools", stats.featuredTools],
        ].map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <section className="admin-section">
        <div className="admin-grid admin-grid-three">
          <div className="admin-card">
            <h2>Direct sponsor ads</h2>
            <p>Manage your own招商 placements and file-based sponsor cards.</p>
            <Link className="admin-link-button" href="/admin/ads">
              Open ads
            </Link>
          </div>
          <div className="admin-card">
            <h2>Click analytics</h2>
            <p>Review outbound tool clicks and sponsor clicks without counting your own admin use.</p>
            <Link className="admin-link-button" href="/admin/analytics">
              View analytics
            </Link>
          </div>
          <div className="admin-card">
            <h2>Sponsor guide</h2>
            <p>See which position key maps to each ad slot before editing data/sponsors.ts.</p>
            <Link className="admin-link-button" href="/admin/ads-guide">
              Open guide
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
