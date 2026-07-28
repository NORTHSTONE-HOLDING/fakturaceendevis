import { ShoppingCart } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Objednávky" };

export default function OrdersPage() {
  return (
    <ComingSoon
      title="Objednávky"
      description="Objednávky s číslováním ORD-RRRR, převoditelné na faktury."
      icon={ShoppingCart}
      features={["Vyřízení objednávek", "Převod na fakturu", "Rezervace skladu"]}
    />
  );
}
