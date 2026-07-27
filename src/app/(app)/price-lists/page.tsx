import { Tags } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Price Lists" };

export default function PriceListsPage() {
  return (
    <ComingSoon
      title="Price Lists"
      description="Customer-specific and tiered pricing on top of the product catalog."
      icon={Tags}
      features={["Tiered pricing", "Per-customer lists", "Bulk discounts"]}
    />
  );
}
