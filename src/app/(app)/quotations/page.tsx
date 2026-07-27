import { FileText } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Quotations" };

export default async function QuotationsPage() {
  const supabase = await createClient();
  const { data: quotations } = await supabase
    .from("quotations")
    .select("*, customers(company)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const list = (quotations ?? []) as (NonNullable<typeof quotations>[number] & {
    customers: { company: string } | null;
  })[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        description="Professional quotes — convert to orders or invoices in one click."
      />
      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No quotations yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Valid until</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-xs font-medium">
                      {q.number}
                    </TableCell>
                    <TableCell>{q.customers?.company ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(q.valid_until)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(q.total))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={q.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
