import { ShoppingCart } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Orders" };

export default function OrdersPage() {
  return (
    <ComingSoon
      title="Orders"
      description="Sales orders with ORD-YYYY numbering, convertible to invoices."
      icon={ShoppingCart}
      features={["Order fulfilment", "Convert to invoice", "Stock reservation"]}
    />
  );
}
