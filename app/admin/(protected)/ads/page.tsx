import type { Advertisement } from "@prisma/client";
import Link from "next/link";

import {
  createAdvertisementForm,
  deleteAdvertisementForm,
  updateAdvertisementForm,
} from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";
import { getAllSponsors } from "@/lib/sponsors";

function Fields({ ad }: { ad?: Advertisement }) {
  return (
    <>
      <label>
        Title
        <input name="title" defaultValue={ad?.title} required />
      </label>
      <label>
        Placement
        <select name="placement" defaultValue={ad?.placement}>
          <option>HOME_BANNER</option>
          <option>HOME_SIDEBAR</option>
          <option>TOOL_DETAIL</option>
        </select>
      </label>
      <label>
        Image URL
        <input name="imageUrl" type="url" defaultValue={ad?.imageUrl} required />
      </label>
      <label>
        Target URL
        <input name="targetUrl" type="url" defaultValue={ad?.targetUrl} required />
      </label>
      <label>
        Starts At
        <input
          name="startsAt"
          type="datetime-local"
          defaultValue={ad?.startsAt?.toISOString().slice(0, 16)}
        />
      </label>
      <label>
        Ends At
        <input
          name="endsAt"
          type="datetime-local"
          defaultValue={ad?.endsAt?.toISOString().slice(0, 16)}
        />
      </label>
      <label>
        Sort Order
        <input name="sortOrder" type="number" defaultValue={ad?.sortOrder ?? 0} />
      </label>
      <label>
        <input name="isActive" type="checkbox" defaultChecked={ad?.isActive ?? true} /> Enabled
      </label>
    </>
  );
}

export default async function AdsPage() {
  const [databaseAds, sponsors] = await Promise.all([
    prisma.advertisement.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    Promise.resolve(getAllSponsors({ includeInactive: true })),
  ]);

  const directSponsors = sponsors.filter((sponsor) => sponsor.type === "direct");
  const affiliateSponsors = sponsors.filter((sponsor) => sponsor.type === "affiliate");
  const adsenseSponsors = sponsors.filter((sponsor) => sponsor.type === "adsense");

  return (
    <>
      <h1>Ads</h1>
      <p className="admin-note">
        This page has two layers: database image ads below, and file-based sponsor slots that you
        can swap by editing <code>data/sponsors.ts</code>.
      </p>

      <section className="admin-section">
        <div className="admin-section-head">
          <div>
            <h2>Self-managed sponsor slots</h2>
            <p>
              Your own招商广告 lives in the <code>direct</code> sponsor entries. These power the
              homepage banner, category banners, sidebar cards, and detail page promotions.
            </p>
          </div>
          <Link className="admin-link-button" href="/admin/ads-guide">
            Open guide
          </Link>
        </div>

        <div className="admin-grid admin-grid-three">
          <article className="admin-card">
            <h3>Direct sponsor ads</h3>
            <p>Use these for your own ad sales and internal advertise CTA placements.</p>
            <ul className="admin-inline-list">
              {directSponsors.map((sponsor) => (
                <li key={sponsor.id}>
                  <strong>{sponsor.title}</strong>
                  <span>{sponsor.position}</span>
                  <span>{sponsor.category ?? "all"}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="admin-card">
            <h3>Affiliate ads</h3>
            <p>Use these for AI tool alliance links and partner referrals.</p>
            <ul className="admin-inline-list">
              {affiliateSponsors.map((sponsor) => (
                <li key={sponsor.id}>
                  <strong>{sponsor.title}</strong>
                  <span>{sponsor.position}</span>
                  <span>{sponsor.category ?? "all"}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="admin-card">
            <h3>AdSense slots</h3>
            <p>Use these when a position should render Google AdSense instead of manual copy.</p>
            <ul className="admin-inline-list">
              {adsenseSponsors.length ? (
                adsenseSponsors.map((sponsor) => (
                  <li key={sponsor.id}>
                    <strong>{sponsor.title}</strong>
                    <span>{sponsor.position}</span>
                    <span>{sponsor.category ?? "all"}</span>
                  </li>
                ))
              ) : (
                <li>
                  <strong>No manual AdSense entries yet.</strong>
                  <span>Add one in data/sponsors.ts with type: "adsense".</span>
                </li>
              )}
            </ul>
          </article>
        </div>
      </section>

      <section className="admin-section">
        <h2>Database banner inventory</h2>
        <form className="admin-form" action={createAdvertisementForm}>
          <Fields />
          <button>Add database ad</button>
        </form>

        <div className="admin-list">
          {databaseAds.map((ad) => (
            <div className="admin-card" key={ad.id}>
              <b>{ad.title}</b> <span>{ad.placement}</span>
              <details>
                <summary>Edit</summary>
                <form className="admin-form" action={updateAdvertisementForm.bind(null, ad.id)}>
                  <Fields ad={ad} />
                  <button>Save</button>
                </form>
              </details>
              <form action={deleteAdvertisementForm.bind(null, ad.id)}>
                <button className="danger">Delete</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
