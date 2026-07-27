import { FolderArchive } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Documents" };

export default function DocumentsPage() {
  return (
    <ComingSoon
      title="Documents"
      description="Central document store backed by Supabase Storage."
      icon={FolderArchive}
      features={["OCR upload", "Tagging", "Full-text search"]}
    />
  );
}
