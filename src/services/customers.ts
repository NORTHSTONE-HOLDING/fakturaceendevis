import { createClient } from "@/lib/supabase/server";
import type {
  Customer,
  CustomerContact,
  Invoice,
  Project,
} from "@/types/database";

export interface CustomerPaymentStats {
  invoiceCount: number;
  paidTotal: number;
  outstanding: number;
  overdue: number;
  lifetimeRevenue: number;
  largestInvoice: number;
  lastPaymentDate: string | null;
}

export interface CustomerProfile {
  customer: Customer;
  contacts: CustomerContact[];
  invoices: Pick<
    Invoice,
    "id" | "number" | "total" | "status" | "issue_date" | "due_date"
  >[];
  projects: Pick<
    Project,
    "id" | "number" | "name" | "status" | "budget_amount" | "start_date"
  >[];
  payments: CustomerPaymentStats;
}

export async function getCustomerProfile(
  id: string,
): Promise<CustomerProfile | null> {
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!customer) return null;

  const today = new Date().toISOString().slice(0, 10);

  const [{ data: contacts }, { data: invoices }, { data: projects }] =
    await Promise.all([
      supabase
        .from("customer_contacts")
        .select("*")
        .eq("customer_id", id)
        .is("deleted_at", null)
        .order("is_primary", { ascending: false }),
      supabase
        .from("invoices")
        .select("id, number, total, status, issue_date, due_date")
        .eq("customer_id", id)
        .is("deleted_at", null)
        .order("issue_date", { ascending: false }),
      supabase
        .from("projects")
        .select("id, number, name, status, budget_amount, start_date")
        .eq("customer_id", id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
    ]);

  const inv = invoices ?? [];
  const paid = inv.filter((i) => i.status === "paid");
  const outstandingInv = inv.filter(
    (i) => i.status === "sent" || i.status === "overdue",
  );
  const overdueInv = inv.filter(
    (i) => i.status !== "paid" && i.status !== "cancelled" && i.due_date < today,
  );

  return {
    customer,
    contacts: contacts ?? [],
    invoices: inv,
    projects: projects ?? [],
    payments: {
      invoiceCount: inv.length,
      paidTotal: paid.reduce((s, i) => s + Number(i.total), 0),
      outstanding: outstandingInv.reduce((s, i) => s + Number(i.total), 0),
      overdue: overdueInv.reduce((s, i) => s + Number(i.total), 0),
      lifetimeRevenue: inv
        .filter((i) => i.status !== "cancelled")
        .reduce((s, i) => s + Number(i.total), 0),
      largestInvoice: inv.reduce((m, i) => Math.max(m, Number(i.total)), 0),
      lastPaymentDate: paid[0]?.issue_date ?? null,
    },
  };
}
