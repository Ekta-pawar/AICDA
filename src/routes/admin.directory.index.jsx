import { createFileRoute } from "@tanstack/react-router";
import { DirectoryManagement } from "@/components/admin/DirectoryManagement";

export const Route = createFileRoute("/admin/directory/")({ component: DirectoryManagement });
