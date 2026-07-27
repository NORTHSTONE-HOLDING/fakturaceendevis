import { createClient } from "@/lib/supabase/server";
import type {
  CompanySettings,
  Customer,
  Invoice,
  InvoiceItem,
} from "@/types/database";

export interface InvoiceDetail {
  invoice: Invoice;
  customer: Customer | null;
  items: InvoiceItem[];
  company: CompanySettings | null;
}

export async function getInvoiceById(
  id: string,
): Promise<InvoiceDetail | null> {
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!invoice) return null;

  const [{ data: items }, { data: company }, customer] = await Promise.all([
    supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("position"),
    supabase.from("company_settings").select("*").limit(1).maybeSingle(),
    invoice.customer_id
      ? supabase
          .from("customers")
          .select("*")
          .eq("id", invoice.customer_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    invoice,
    customer: (customer.data as Customer | null) ?? null,
    items: items ?? [],
    company: company ?? null,
  };
}
