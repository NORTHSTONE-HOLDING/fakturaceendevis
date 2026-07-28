import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { InvoiceActions } from "./invoice-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getInvoiceById } from "@/services/invoices";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getInvoiceById(id);
  if (!detail) notFound();

  const { invoice, customer } = detail;

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
              {customer?.company ?? "Bez zákazníka"}
            </p>
          </div>
        </div>
        <InvoiceActions id={invoice.id} status={invoice.status} />
      </div>

      {/* Preview = Print: the preview IS the generated PDF, so the on-screen
          document is byte-for-byte identical to the exported/printed file. */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="mx-auto aspect-[210/297] w-full max-w-[820px] bg-muted">
            <iframe
              title={`Náhled ${invoice.number}`}
              src={`/invoices/${invoice.id}/pdf#toolbar=0&navpanes=0&view=FitH`}
              className="h-full w-full"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
