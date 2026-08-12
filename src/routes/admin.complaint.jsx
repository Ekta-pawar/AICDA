import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/admin/SectionPlaceholder";

export const Route = createFileRoute("/admin/complaint")({
  component: () => <SectionPlaceholder section="Complaint" />,
});
