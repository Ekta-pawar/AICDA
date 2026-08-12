import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/admin/SectionPlaceholder";

export const Route = createFileRoute("/admin/our-staff")({
  component: () => <SectionPlaceholder section="Our Staff" />,
});
