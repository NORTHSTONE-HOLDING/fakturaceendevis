import { Tags } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Ceník" };

export default function PriceListsPage() {
  return (
    <ComingSoon
      title="Ceník"
      description="Cenové hladiny a ceny specifické pro zákazníky nad katalogem produktů."
      icon={Tags}
      features={["Cenové hladiny", "Ceníky pro zákazníky", "Množstevní slevy"]}
    />
  );
}
