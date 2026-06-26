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
      intro="AI Navigation is a clean, high-intent directory for AI tools, SaaS, developer tools, and productivity software. Brands can reach visitors who are already comparing products and looking for the next tool to try."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Advertise" }]}
    >
      <p>
        We offer placements for AI products, workflow software, coding tools, and utility apps
        that fit the audience of this directory. Every paid placement is clearly labeled as Ad or
        Sponsored and designed to stay useful without overwhelming the page.
      </p>
      <ul>
        <li>Homepage Banner</li>
        <li>Category Banner</li>
        <li>Sidebar Sponsor</li>
        <li>Tool List Sponsored Card</li>
        <li>Tool Detail Promotion</li>
      </ul>
      <ul>
        <li>Image Ads</li>
        <li>Text Recommendations</li>
        <li>Affiliate Recommendations</li>
        <li>Tool Pinning</li>
      </ul>
      <ul>
        <li>Homepage Banner: Contact for pricing</li>
        <li>Category Banner: Contact for pricing</li>
        <li>Sidebar Sponsor: Contact for pricing</li>
      </ul>
      <p>
        Want pricing, traffic fit, or a custom package? Contact us for homepage exposure,
        category sponsorships, in-feed recommendations, and long-term directory visibility.
      </p>
      <p>
        <a className="primary-button inline-button" href="mailto:ads@ai-navigation.local">
          Contact Us
        </a>
      </p>
    </ContentPage>
  );
}
