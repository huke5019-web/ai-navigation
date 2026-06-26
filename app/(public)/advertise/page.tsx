import { ContentPage } from "@/components/public/content-page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({
    title: "Advertise on AI Navigation",
    description: "See available ad placements, sponsorship options, and partnership guidelines for AI Navigation.",
    path: "/advertise",
  });
}

export default function AdvertisePage() {
  return (
    <ContentPage
      title="Advertise"
      intro="AI Navigation supports banner placements, sidebar sponsorships, in-feed recommendations, and affiliate partnerships."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Advertise" }]}
    >
      <ul>
        <li>Top banner placement for broad awareness</li>
        <li>Sidebar sponsorship for evergreen visibility</li>
        <li>In-feed sponsored recommendations inside tool lists</li>
        <li>Article placements for relevant buying guides</li>
      </ul>
      <p>
        All paid placements are labeled as Sponsored or Partner Recommendation. No forced clicks,
        deceptive placements, or invalid traffic tactics are supported.
      </p>
    </ContentPage>
  );
}
