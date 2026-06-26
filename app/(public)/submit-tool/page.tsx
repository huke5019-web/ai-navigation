import { ContentPage } from "@/components/public/content-page";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return buildMetadata({
    title: "Submit an AI Tool",
    description: "Submit an AI product for editorial review and possible inclusion in the directory.",
    path: "/submit-tool",
  });
}

export default function SubmitToolPage() {
  return (
    <ContentPage
      title="Submit a Tool"
      intro="You can add new tools through the admin panel today, and this page is ready to become a public submission form later."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Submit Tool" }]}
    >
      <p>
        For now, the fastest workflow is to add a new tool in the admin dashboard and include its
        official URL, optional affiliate URL, pricing, tags, and sponsorship status.
      </p>
      <p>
        If you want a public submission form later, this route is a clean place to connect it
        without changing your core site structure.
      </p>
    </ContentPage>
  );
}
