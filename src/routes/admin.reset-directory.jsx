import { createFileRoute } from "@tanstack/react-router";
import { ResetDirectory } from "@/components/admin/ResetDirectory";

export const Route = createFileRoute("/admin/reset-directory")({
  component: ResetDirectory,
});
