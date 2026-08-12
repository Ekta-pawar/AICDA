import { createFileRoute } from "@tanstack/react-router";
import { PartnerDirectory } from "@/components/admin/PartnerDirectory";

export const Route = createFileRoute("/admin/directory/partener")({ component: PartnerDirectory });
