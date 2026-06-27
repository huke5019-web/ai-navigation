import { getClickCounts, getRecentClickEvents, summarizeClickEvents } from "@/lib/clicks";
import { hasDatabaseUrl } from "@/lib/prisma";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AnalyticsPage() {
  const [recentEvents, last7Days, last30Days] = await Promise.all([
    getRecentClickEvents(100),
    getClickCounts(7),
    getClickCounts(30),
  ]);
  const summary = summarizeClickEvents(recentEvents);

  return (
    <>
      <h1>Analytics</h1>
      <p className="admin-note">
        This dashboard records outbound tool and sponsor clicks. Any click made while you are
        logged into the admin area is skipped automatically, so your own testing does not pollute
        the numbers.
      </p>
      {!hasDatabaseUrl() ? (
        <div className="admin-card">
          <strong>Database required for persistent analytics.</strong>
          <p>
            Local fallback content still works, but click history only persists when
            <code> DATABASE_URL </code>
            points to a real database in Vercel.
          </p>
        </div>
      ) : null}

      <div className="admin-grid">
        <div className="stat">
          <span>Last 7 days</span>
          <strong>{last7Days.total}</strong>
          <small>
            {last7Days.tools} tool clicks / {last7Days.sponsors} sponsor clicks
          </small>
        </div>
        <div className="stat">
          <span>Last 30 days</span>
          <strong>{last30Days.total}</strong>
          <small>
            {last30Days.tools} tool clicks / {last30Days.sponsors} sponsor clicks
          </small>
        </div>
        <div className="stat">
          <span>Recent sample</span>
          <strong>{summary.totalClicks}</strong>
          <small>
            {summary.toolClicks} tool clicks / {summary.sponsorClicks} sponsor clicks
          </small>
        </div>
        <div className="stat">
          <span>Tracked items</span>
          <strong>{summary.topTools.length + summary.topSponsors.length}</strong>
          <small>Unique tools and sponsors in the recent event list</small>
        </div>
      </div>

      <section className="admin-section">
        <h2>Top tools</h2>
        <div className="admin-list">
          {summary.topTools.length ? (
            summary.topTools.slice(0, 10).map((tool) => (
              <div className="admin-row" key={tool.slug}>
                <div>
                  <strong>{tool.name}</strong>
                  <p>
                    {tool.category} / {tool.linkType}
                  </p>
                </div>
                <div className="admin-row-meta">
                  <span>{tool.clicks} clicks</span>
                  <span>{formatDate(tool.latestAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-card">No tool clicks yet.</div>
          )}
        </div>
      </section>

      <section className="admin-section">
        <h2>Top sponsors</h2>
        <div className="admin-list">
          {summary.topSponsors.length ? (
            summary.topSponsors.slice(0, 10).map((sponsor) => (
              <div className="admin-row" key={sponsor.id}>
                <div>
                  <strong>{sponsor.title}</strong>
                  <p>
                    {sponsor.position} / {sponsor.category} / {sponsor.linkType}
                  </p>
                </div>
                <div className="admin-row-meta">
                  <span>{sponsor.clicks} clicks</span>
                  <span>{formatDate(sponsor.latestAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-card">No sponsor clicks yet.</div>
          )}
        </div>
      </section>

      <section className="admin-section">
        <h2>Recent click log</h2>
        <div className="admin-list">
          {summary.recentEvents.length ? (
            summary.recentEvents.slice(0, 25).map((event) => (
              <div className="admin-row" key={event.id}>
                <div>
                  <strong>
                    {event.targetType === "TOOL" ? event.toolName : event.sponsorTitle}
                  </strong>
                  <p>
                    {event.targetType} / {event.linkType} / {event.targetUrl}
                  </p>
                </div>
                <div className="admin-row-meta">
                  <span>{event.categorySlug ?? event.sponsorCategory ?? "all"}</span>
                  <span>{formatDate(event.createdAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-card">No tracked clicks yet.</div>
          )}
        </div>
      </section>
    </>
  );
}
