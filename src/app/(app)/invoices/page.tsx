import Link from "next/link";
import { Receipt, Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
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

export const metadata = { title: "Invoices" };

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, customers(company)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const list = (invoices ?? []) as (NonNullable<typeof invoices>[number] & {
    customers: { company: string } | null;
  })[];

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description={`${list.length} invoices`}>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="h-4 w-4" /> New invoice
          </Link>
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <Receipt className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No invoices yet. Create your first invoice.
              </p>
              <Button asChild size="sm">
                <Link href="/invoices/new">
                  <Plus className="h-4 w-4" /> New invoice
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((inv) => (
                  <TableRow key={inv.id} className="cursor-pointer">
                    <TableCell className="font-mono text-xs font-medium">
                      <Link href={`/invoices/${inv.id}`}>{inv.number}</Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/invoices/${inv.id}`}>
                        {inv.customers?.company ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(inv.issue_date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(inv.due_date)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(inv.total))}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
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
