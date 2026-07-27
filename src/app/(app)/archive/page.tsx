import { Archive } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Archive" };

export default function ArchivePage() {
  return (
    <ComingSoon
      title="Archive"
      description="Soft-deleted documents with versioning and restore."
      icon={Archive}
      features={["Soft delete", "Versioning", "Restore", "Export"]}
    />
  );
}
