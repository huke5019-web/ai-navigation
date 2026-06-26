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
      title="Advertise on AI Navigation"
      intro="Buy homepage advertising, tool list sponsored recommendations, and AI tool spotlight placements for a relevant audience actively comparing products."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Advertise" }]}
    >
      <ul>
        <li>Homepage banner advertising for broad awareness</li>
        <li>Tool list recommendation slots placed inside category and search results</li>
        <li>AI tool spotlight placements for partner products and launches</li>
      </ul>
      <p>
        Every paid placement is clearly labeled as Sponsored. We keep the browsing experience
        clean and do not support deceptive layouts, forced clicks, or invalid traffic tactics.
      </p>
      <p>
        Want pricing, placement details, or a custom package? We can share options for homepage
        exposure, in-feed placement, and long-term directory visibility.
      </p>
      <p>
        <a className="primary-button inline-button" href="mailto:ads@example.com">
          Contact Us
        </a>
      </p>
    </ContentPage>
  );
}
