import { ContentPage } from "@/components/public/content-page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({
    title: "Contact AI Navigation",
    description: "Contact AI Navigation for partnerships, corrections, and product feedback.",
    path: "/contact",
  });
}

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact"
      intro="Use this page for sponsorship inquiries, content corrections, and product feedback."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
    >
      <p>Email: huke5019@gmail.com</p>
      <p>
        You can use this address for partnership inquiries, tool corrections, and business
        communication.
      </p>
    </ContentPage>
  );
}
