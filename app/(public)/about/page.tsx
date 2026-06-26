import { ContentPage } from "@/components/public/content-page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({
    title: "About AI Navigation",
    description: "Learn what AI Navigation is, how we curate tools, and how the site makes money responsibly.",
    path: "/about",
  });
}

export default function AboutPage() {
  return (
    <ContentPage
      title="About AI Navigation"
      intro="AI Navigation helps people discover useful AI products faster without turning the site into a cluttered marketplace."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
    >
      <p>
        We focus on practical directories, category pages, and buying guides for chat tools,
        writing assistants, image generators, and AI developer products.
      </p>
      <p>
        Listings may include official links, affiliate links, or sponsored placements. Sponsored
        units are clearly labeled so the browsing experience stays trustworthy and clean.
      </p>
    </ContentPage>
  );
}
