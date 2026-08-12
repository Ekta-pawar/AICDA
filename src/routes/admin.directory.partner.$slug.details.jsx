import { createFileRoute } from "@tanstack/react-router";
import { PartnerDetails } from "@/components/admin/PartnerDetails";

export const Route = createFileRoute("/admin/directory/partner/$slug/details")({
  component: PartnerDetailsRoute,
});

function PartnerDetailsRoute() {
  const { slug } = Route.useParams();
  return <PartnerDetails slug={slug} />;
}
