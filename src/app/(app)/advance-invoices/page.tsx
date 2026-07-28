import { FileStack } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Zálohové faktury" };

export default function AdvanceInvoicesPage() {
  return (
    <ComingSoon
      title="Zálohové faktury"
      description="Proforma a zálohové faktury s číslováním ADV-RRRR."
      icon={FileStack}
      features={["Proforma", "Sledování záloh", "Automatické zúčtování"]}
    />
  );
}
