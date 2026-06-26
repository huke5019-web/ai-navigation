import { ContentPage } from "@/components/public/content-page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({
    title: "Ads Configuration Guide",
    description: "Learn how to update ad copy, images, links, and sponsor types in AI Navigation.",
    path: "/admin/ads-guide",
  });
}

export default function AdsGuidePage() {
  return (
    <ContentPage
      title="Ads Configuration Guide"
      intro="This page explains how to manage manual ad placements without building a separate admin backend."
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Admin", href: "/admin" },
        { label: "Ads Guide" },
      ]}
    >
      <p>
        Edit <code>data/sponsors.ts</code> to add, replace, or disable the manual ads shown across
        the site.
      </p>
      <ul>
        <li>Add a new object to create a new ad.</li>
        <li>Change <code>title</code> to update the ad headline.</li>
        <li>Change <code>description</code> to update supporting text.</li>
        <li>Change <code>image</code> to point at a file inside <code>public/ads/</code>.</li>
        <li>Change <code>link</code> to update the destination URL.</li>
        <li>Set <code>isActive</code> to <code>false</code> to turn an ad off.</li>
      </ul>
      <p>
        Position values map to placements like <code>homeBanner</code>, <code>categoryBanner</code>,
        <code>sidebar</code>, <code>inFeed</code>, and <code>toolDetail</code>.
      </p>
      <p>
        Use <code>type: "direct"</code> for your own sales placements,{" "}
        <code>type: "affiliate"</code> for partner or alliance links, and{" "}
        <code>type: "adsense"</code> when that slot should render Google AdSense instead of a
        manual promotion.
      </p>
      <p>
        Affiliate links go in the same <code>link</code> field. If the link starts with{" "}
        <code>https://</code>, the ad opens in a new tab with sponsored link attributes.
      </p>
      <p>
        Upload ad art to <code>public/ads/</code> and reference it in data as a web path like{" "}
        <code>/ads/homepage-banner.svg</code>.
      </p>
      <p>
        <a className="primary-button inline-button" href="/advertise">
          Open Advertise Page
        </a>
      </p>
    </ContentPage>
  );
}
