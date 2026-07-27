import { FolderArchive } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Dokumenty" };

export default function DocumentsPage() {
  return (
    <ComingSoon
      title="Dokumenty"
      description="Centrální úložiště dokumentů postavené na Supabase Storage."
      icon={FolderArchive}
      features={["Nahrávání s OCR", "Štítky", "Fulltextové vyhledávání"]}
    />
  );
}
