import { Badge } from "@/components/ui/badge";
import type { InvoiceStatus, QuotationStatus } from "@/types/database";

type Status = InvoiceStatus | QuotationStatus;

const MAP: Record<
  Status,
  { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }
> = {
  draft: { label: "Koncept", variant: "secondary" },
  sent: { label: "Odesláno", variant: "default" },
  paid: { label: "Zaplaceno", variant: "success" },
  overdue: { label: "Po splatnosti", variant: "destructive" },
  cancelled: { label: "Stornováno", variant: "outline" },
  accepted: { label: "Přijato", variant: "success" },
  rejected: { label: "Odmítnuto", variant: "destructive" },
  expired: { label: "Vypršelo", variant: "warning" },
  converted: { label: "Převedeno", variant: "default" },
};

export function StatusBadge({ status }: { status: Status }) {
  const cfg = MAP[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
