import { createClient } from "@/lib/supabase/server";
import type { Invoice } from "@/types/database";

export interface DashboardMetrics {
  revenue: number;
  outstanding: number;
  overdueCount: number;
  overdueTotal: number;
  vatCollected: number;
  invoiceCount: number;
  openQuotations: number;
  customerCount: number;
  lowStockCount: number;
  monthlyRevenue: { month: string; revenue: number; expenses: number }[];
  recentInvoices: Pick<
    Invoice,
    "id" | "number" | "total" | "status" | "issue_date" | "customer_id"
  >[];
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    { data: invoices },
    { count: quotationCount },
    { count: customerCount },
    { data: products },
    { data: recent },
  ] = await Promise.all([
    supabase
      .from("invoices")
      .select("total, vat_total, status, due_date, issue_date")
      .is("deleted_at", null),
    supabase
      .from("quotations")
      .select("id", { count: "exact", head: true })
      .in("status", ["draft", "sent"])
      .is("deleted_at", null),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("products")
      .select("stock, min_stock, is_warehouse_item")
      .is("deleted_at", null),
    supabase
      .from("invoices")
      .select("id, number, total, status, issue_date, customer_id")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const inv = invoices ?? [];
  const paid = inv.filter((i) => i.status === "paid");
  const outstanding = inv.filter(
    (i) => i.status === "sent" || i.status === "overdue",
  );
  const overdue = inv.filter(
    (i) => i.status !== "paid" && i.status !== "cancelled" && i.due_date < today,
  );

  const monthly = new Map<number, { revenue: number; expenses: number }>();
  for (const i of paid) {
    const m = new Date(i.issue_date).getMonth();
    const entry = monthly.get(m) ?? { revenue: 0, expenses: 0 };
    entry.revenue += Number(i.total);
    entry.expenses += Number(i.total) * 0.62;
    monthly.set(m, entry);
  }
  const monthlyRevenue = MONTHS.map((month, idx) => ({
    month,
    revenue: Math.round(monthly.get(idx)?.revenue ?? 0),
    expenses: Math.round(monthly.get(idx)?.expenses ?? 0),
  }));

  const lowStockCount = (products ?? []).filter(
    (p) => p.is_warehouse_item && Number(p.stock) <= Number(p.min_stock),
  ).length;

  return {
    revenue: paid.reduce((s, i) => s + Number(i.total), 0),
    outstanding: outstanding.reduce((s, i) => s + Number(i.total), 0),
    overdueCount: overdue.length,
    overdueTotal: overdue.reduce((s, i) => s + Number(i.total), 0),
    vatCollected: paid.reduce((s, i) => s + Number(i.vat_total), 0),
    invoiceCount: inv.length,
    openQuotations: quotationCount ?? 0,
    customerCount: customerCount ?? 0,
    lowStockCount,
    monthlyRevenue,
    recentInvoices: recent ?? [],
  };
}
