import { Wallet } from "lucide-react";

import { ComingSoon } from "@/components/shared/coming-soon";

export const metadata = { title: "Budgets" };

export default function BudgetsPage() {
  return (
    <ComingSoon
      title="Budgets"
      description="Plan and track project and departmental budgets."
      icon={Wallet}
      features={["Budget vs. actual", "Forecasting", "Approvals"]}
    />
  );
}
