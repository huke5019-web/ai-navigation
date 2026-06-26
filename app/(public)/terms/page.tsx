import { ContentPage } from "@/components/public/content-page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({
    title: "Terms of Use",
    description: "Terms governing the use of AI Navigation and its content.",
    path: "/terms",
  });
}

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of Use"
      intro="By using AI Navigation, you agree to use the directory and its content lawfully and at your own discretion."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms" }]}
    >
      <p>
        Tool information may change over time. Pricing, features, and availability should always
        be verified on the vendor website before making a purchase decision.
      </p>
      <p>
        We may update listings, remove tools, or adjust monetization methods as the site grows.
      </p>
    </ContentPage>
  );
}
