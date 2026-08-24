import { createFileRoute } from "@tanstack/react-router";
import { ImportantDatesManagement } from "@/components/admin/ImportantDatesManagement";

export const Route = createFileRoute("/admin/important-dates")({
  component: ImportantDatesManagement,
});
