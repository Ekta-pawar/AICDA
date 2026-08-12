import { createFileRoute } from "@tanstack/react-router";
import { BannerManagement } from "@/components/admin/BannerManagement";

export const Route = createFileRoute("/admin/banners")({ component: BannerManagement });
