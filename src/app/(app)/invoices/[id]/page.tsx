import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { InvoiceActions } from "./invoice-actions";
import { InvoiceDocument } from "@/components/documents/invoice-document";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getInvoiceById } from "@/services/invoices";
import { buildSpdString, qrDataUri } from "@/lib/payment";

export default async function InvoiceDetailPage({
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-xl font-semibold">
                {invoice.number}
              </h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {customer?.company ?? "No customer"}
            </p>
          </div>
        </div>
        <InvoiceActions id={invoice.id} status={invoice.status} />
      </div>

      <Card>
        <CardContent className="p-0">
          <InvoiceDocument
            invoice={invoice}
            customer={customer}
            items={items}
            company={company}
            qr={qr}
          />
        </CardContent>
      </Card>
    </div>
  );
}
