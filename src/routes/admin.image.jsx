import { createFileRoute } from "@tanstack/react-router";
import { GalleryManagement } from "@/components/admin/GalleryManagement";

export const Route = createFileRoute("/admin/image")({ component: GalleryManagement });
