import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminsManagement } from "@/components/admin/SuperAdminsManagement";

export const Route = createFileRoute("/admin/super-admins")({ component: SuperAdminsManagement });
