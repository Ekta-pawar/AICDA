import { createFileRoute } from "@tanstack/react-router";
import { SectionPlaceholder } from "@/components/admin/SectionPlaceholder";

export const Route = createFileRoute("/admin/reset-directory")({
  component: () => <SectionPlaceholder section="Reset Directory" />,
});
