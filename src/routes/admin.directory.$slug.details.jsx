import { createFileRoute } from "@tanstack/react-router";
import { MemberDetails } from "@/components/admin/MemberDetails";

export const Route = createFileRoute("/admin/directory/$slug/details")({
  component: MemberDetailsRoute,
});

function MemberDetailsRoute() {
  const { slug } = Route.useParams();
  return <MemberDetails slug={slug} />;
}
