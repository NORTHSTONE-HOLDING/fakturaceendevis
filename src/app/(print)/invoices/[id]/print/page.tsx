import { notFound } from "next/navigation";

import { InvoiceDocument } from "@/components/documents/invoice-document";
import { PrintTrigger } from "@/components/documents/print-trigger";
import { getInvoiceById } from "@/services/invoices";
import { buildSpdString, qrDataUri } from "@/lib/payment";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getInvoiceById(id);
  if (!detail) notFound();

  const { invoice, customer, items, company } = detail;
  const spd = buildSpdString({
    iban: invoice.iban,
    amount: Number(invoice.total),
    currency: invoice.currency,
    variableSymbol: invoice.variable_symbol,
    message: invoice.number,
  });
  const qr = spd ? await qrDataUri(spd) : null;

  return (
    <>
      <PrintTrigger />
      <InvoiceDocument
        invoice={invoice}
        customer={customer}
        items={items}
        company={company}
        qr={qr}
      />
    </>
  );
}
