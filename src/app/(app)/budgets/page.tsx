import { Wallet } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Rozpočty" };

export default function BudgetsPage() {
  return (
    <ComingSoon
      title="Rozpočty"
      description="Plánování a sledování projektových a oddělených rozpočtů."
      icon={Wallet}
      features={["Rozpočet vs. skutečnost", "Predikce", "Schvalování"]}
    />
  );
}
