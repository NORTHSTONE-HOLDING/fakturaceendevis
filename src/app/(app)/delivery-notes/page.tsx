import { Truck } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Delivery Notes" };

export default function DeliveryNotesPage() {
  return (
    <ComingSoon
      title="Delivery Notes"
      description="Dispatch documents with DLV-YYYY numbering."
      icon={Truck}
      features={["Packing slips", "Stock movements", "Signatures"]}
    />
  );
}
