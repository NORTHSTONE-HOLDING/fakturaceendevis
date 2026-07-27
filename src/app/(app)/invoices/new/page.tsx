import { PageHeader } from "@/components/layout/page-header";
import { InvoiceForm } from "./invoice-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Nová faktura" };

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, company")
    .is("deleted_at", null)
    .order("company");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Nová faktura"
        description="Číslo faktury generuje automaticky databáze."
      />
      <InvoiceForm customers={customers ?? []} />
    </div>
  );
}
