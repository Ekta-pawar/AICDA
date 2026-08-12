import { createFileRoute } from "@tanstack/react-router";
import { EnquiryManagement } from "@/components/admin/EnquiryManagement";

export const Route = createFileRoute("/admin/enquiries")({ component: EnquiryManagement });
