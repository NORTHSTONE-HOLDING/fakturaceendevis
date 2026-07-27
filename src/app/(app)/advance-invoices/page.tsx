import { FileStack } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Advance Invoices" };

export default function AdvanceInvoicesPage() {
  return (
    <ComingSoon
      title="Advance Invoices"
      description="Proforma and advance invoices with ADV-YYYY numbering."
      icon={FileStack}
      features={["Proforma", "Deposit tracking", "Auto settlement"]}
    />
  );
}
