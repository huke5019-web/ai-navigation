import { getClickCounts, getRecentClickEvents, summarizeClickEvents } from "@/lib/clicks";
import {
  getStoredAnalyticsEvents,
  hasPersistentAnalyticsStore,
  summarizeStoredAnalyticsEvents,
} from "@/lib/internal-analytics";
import { hasDatabaseUrl } from "@/lib/prisma";

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(typeof value === "string" ? new Date(value) : value);
}

function withinDays(dateValue: string, days: number) {
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  return new Date(dateValue).getTime() >= since;
}

export default async function AnalyticsPage() {
  const [storedEvents, recentClicks, last7Days, last30Days] = await Promise.all([
    getStoredAnalyticsEvents(1000),
    getRecentClickEvents(100),
    getClickCounts(7),
    getClickCounts(30),
  ]);

  const hasStore = hasPersistentAnalyticsStore();
  const storedSummary = summarizeStoredAnalyticsEvents(storedEvents);
  const clickSummary = summarizeClickEvents(recentClicks);
  const last7Stored = storedEvents.filter((event) => withinDays(event.createdAt, 7));
  const last30Stored = storedEvents.filter((event) => withinDays(event.createdAt, 30));

  return (
    <>
      <h1>Analytics</h1>
      <p className="admin-note">
        This dashboard records page views, searches, category clicks, detail clicks, and outbound
        tool or sponsor clicks. Any action made while you are logged into the admin area is skipped
        automatically, so your own testing does not inflate the numbers.
      </p>

      {!hasStore ? (
        <div className="admin-card">
          <strong>Connect Vercel KV or Upstash Redis for persistent site analytics.</strong>
          <p>
            The detailed event stream is enabled when <code>KV_REST_API_URL</code> and
            <code> KV_REST_API_TOKEN </code>
            are present. Until then, this page falls back to outbound click data only.
          </p>
        </div>
      ) : null}

      <div className="admin-grid">
        <div className="stat">
          <span>Last 7 days</span>
          <strong>{hasStore ? last7Stored.length : last7Days.total}</strong>
          <small>
            {hasStore
              ? "All tracked site events"
              : `${last7Days.tools} tool clicks / ${last7Days.sponsors} sponsor clicks`}
          </small>
        </div>
        <div className="stat">
          <span>Last 30 days</span>
          <strong>{hasStore ? last30Stored.length : last30Days.total}</strong>
          <small>
            {hasStore
              ? "All tracked site events"
              : `${last30Days.tools} tool clicks / ${last30Days.sponsors} sponsor clicks`}
          </small>
        </div>
        <div className="stat">
          <span>Tracked items</span>
          <strong>
            {hasStore
              ? storedSummary.topTools.length + storedSummary.topSponsors.length
              : clickSummary.topTools.length + clickSummary.topSponsors.length}
          </strong>
          <small>Unique tools and sponsors in the recent event sample</small>
        </div>
        <div className="stat">
          <span>Storage status</span>
          <strong>{hasStore ? "Redis" : hasDatabaseUrl() ? "DB fallback" : "Fallback only"}</strong>
          <small>
            {hasStore
              ? "Persistent internal analytics is active"
              : "Detailed analytics will persist after storage is connected"}
          </small>
        </div>
      </div>

      {hasStore ? (
        <>
          <section className="admin-section">
            <h2>Event types</h2>
            <div className="admin-list">
              {storedSummary.eventCounts.map((item) => (
                <div className="admin-row" key={item.key}>
                  <div>
                    <strong>{item.label}</strong>
                    <p>Latest event at {formatDate(item.latestAt)}</p>
                  </div>
                  <div className="admin-row-meta">
                    <span>{item.count} events</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-section">
            <h2>Top pages</h2>
            <div className="admin-list">
              {storedSummary.topPages.length ? (
                storedSummary.topPages.slice(0, 10).map((item) => (
                  <div className="admin-row" key={item.key}>
                    <div>
                      <strong>{item.label}</strong>
                      <p>Latest view at {formatDate(item.latestAt)}</p>
                    </div>
                    <div className="admin-row-meta">
                      <span>{item.count} views</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-card">No page views recorded yet.</div>
              )}
            </div>
          </section>

          <section className="admin-section">
            <h2>Top searches</h2>
            <div className="admin-list">
              {storedSummary.topSearches.length ? (
                storedSummary.topSearches.slice(0, 10).map((item) => (
                  <div className="admin-row" key={item.key}>
                    <div>
                      <strong>{item.label}</strong>
                      <p>Latest search at {formatDate(item.latestAt)}</p>
                    </div>
                    <div className="admin-row-meta">
                      <span>{item.count} searches</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="admin-card">No searches recorded yet.</div>
              )}
            </div>
          </section>
        </>
      ) : null}

      <section className="admin-section">
        <h2>Top tools</h2>
        <div className="admin-list">
          {hasStore ? (
            storedSummary.topTools.length ? (
              storedSummary.topTools.slice(0, 10).map((item) => (
                <div className="admin-row" key={item.key}>
                  <div>
                    <strong>{item.label}</strong>
                    <p>Latest click at {formatDate(item.latestAt)}</p>
                  </div>
                  <div className="admin-row-meta">
                    <span>{item.count} clicks</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-card">No tool clicks yet.</div>
            )
          ) : (
            clickSummary.topTools.length ? (
              clickSummary.topTools.slice(0, 10).map((item) => (
                <div className="admin-row" key={item.slug}>
                  <div>
                    <strong>{item.name}</strong>
                    <p>Latest click at {formatDate(item.latestAt)}</p>
                  </div>
                  <div className="admin-row-meta">
                    <span>{item.clicks} clicks</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-card">No tool clicks yet.</div>
            )
          )}
        </div>
      </section>

      <section className="admin-section">
        <h2>Top sponsors</h2>
        <div className="admin-list">
          {hasStore ? (
            storedSummary.topSponsors.length ? (
              storedSummary.topSponsors.slice(0, 10).map((item) => (
                <div className="admin-row" key={item.key}>
                  <div>
                    <strong>{item.label}</strong>
                    <p>Latest click at {formatDate(item.latestAt)}</p>
                  </div>
                  <div className="admin-row-meta">
                    <span>{item.count} clicks</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-card">No sponsor clicks yet.</div>
            )
          ) : (
            clickSummary.topSponsors.length ? (
              clickSummary.topSponsors.slice(0, 10).map((item) => (
                <div className="admin-row" key={item.id}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>Latest click at {formatDate(item.latestAt)}</p>
                  </div>
                  <div className="admin-row-meta">
                    <span>{item.clicks} clicks</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-card">No sponsor clicks yet.</div>
            )
          )}
        </div>
      </section>

      <section className="admin-section">
        <h2>Recent events</h2>
        <div className="admin-list">
          {hasStore ? (
            storedSummary.recentEvents.length ? (
              storedSummary.recentEvents.slice(0, 25).map((event) => (
                <div className="admin-row" key={event.id}>
                  <div>
                    <strong>{event.eventName}</strong>
                    <p>{JSON.stringify(event.params)}</p>
                  </div>
                  <div className="admin-row-meta">
                    <span>{formatDate(event.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-card">No tracked events yet.</div>
            )
          ) : (
            clickSummary.recentEvents.length ? (
              clickSummary.recentEvents.slice(0, 25).map((event) => (
                <div className="admin-row" key={event.id}>
                  <div>
                    <strong>{event.targetType === "TOOL" ? event.toolName : event.sponsorTitle}</strong>
                    <p>{`${event.targetType} / ${event.linkType} / ${event.targetUrl}`}</p>
                  </div>
                  <div className="admin-row-meta">
                    <span>{formatDate(event.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-card">No tracked events yet.</div>
            )
          )}
        </div>
      </section>
    </>
  );
}
