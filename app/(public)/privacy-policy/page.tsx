import { ContentPage } from "@/components/public/content-page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({
    title: "Privacy Policy",
    description: "Privacy policy for AI Navigation, including analytics, cookies, and outbound links.",
    path: "/privacy-policy",
  });
}

export default function PrivacyPolicyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      intro="This site uses lightweight analytics and ad integrations without collecting unnecessary personal information."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]}
    >
      <p>
        We use privacy-conscious event tracking for page views, search activity, category clicks,
        and affiliate link clicks. We do not intentionally collect sensitive personal data.
      </p>
      <p>
        Third-party services such as Google Analytics and Google AdSense may set cookies according
        to their own policies once enabled by configuration.
      </p>
    </ContentPage>
  );
}
