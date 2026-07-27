import { Archive } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Archiv" };

export default function ArchivePage() {
  return (
    <ComingSoon
      title="Archiv"
      description="Smazané dokumenty s verzováním a možností obnovení."
      icon={Archive}
      features={["Měkké mazání", "Verzování", "Obnovení", "Export"]}
    />
  );
}
