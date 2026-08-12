import { createFileRoute } from "@tanstack/react-router";
import { ExpiredMembersManagement } from "@/components/admin/ExpiredMembersManagement";

export const Route = createFileRoute("/admin/expired-members")({
  component: ExpiredMembersManagement,
});
