import { Truck } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Dodací listy" };

export default function DeliveryNotesPage() {
  return (
    <ComingSoon
      title="Dodací listy"
      description="Dodací a expediční doklady s číslováním DLV-RRRR."
      icon={Truck}
      features={["Dodací listy", "Skladové pohyby", "Podpisy"]}
    />
  );
}
