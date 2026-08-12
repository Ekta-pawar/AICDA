import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/admin/SectionPlaceholder";

export const Route = createFileRoute("/admin/reset-management")({
  component: () => <SectionPlaceholder section="Reset Management" />,
});
