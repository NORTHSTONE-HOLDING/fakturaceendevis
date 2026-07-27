import Link from "next/link";
import {
  Wallet,
  TrendingDown,
  Receipt,
  AlertTriangle,
  FileText,
  Users,
  Percent,
  Warehouse,
  ArrowRight,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardMetrics } from "@/services/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const m = await getDashboardMetrics();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of your business performance."
      >
        <Button asChild>
          <Link href="/invoices/new">
            <Receipt className="h-4 w-4" /> New invoice
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue (paid)"
          value={formatCurrency(m.revenue)}
          icon={Wallet}
          tone="gold"
          hint="All paid invoices"
        />
        <StatCard
          label="Outstanding"
          value={formatCurrency(m.outstanding)}
          icon={TrendingDown}
          tone="warning"
          hint="Awaiting payment"
        />
        <StatCard
          label="Overdue"
          value={formatCurrency(m.overdueTotal)}
          icon={AlertTriangle}
          tone="destructive"
          hint={`${m.overdueCount} invoice(s)`}
        />
        <StatCard
          label="VAT collected"
          value={formatCurrency(m.vatCollected)}
          icon={Percent}
          tone="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue vs. expenses</CardTitle>
            <CardDescription>Monthly breakdown for this year</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart data={m.monthlyRevenue} />
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <StatCard label="Invoices" value={String(m.invoiceCount)} icon={Receipt} />
          <StatCard
            label="Open quotations"
            value={String(m.openQuotations)}
            icon={FileText}
          />
          <StatCard
            label="Customers"
            value={String(m.customerCount)}
            icon={Users}
          />
          <StatCard
            label="Warehouse alerts"
            value={String(m.lowStockCount)}
            icon={Warehouse}
            tone={m.lowStockCount > 0 ? "warning" : "default"}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Recent documents</CardTitle>
            <CardDescription>Latest invoices created</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/invoices">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {m.recentInvoices.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No invoices yet. Create your first one to get started.
            </p>
          ) : (
            <div className="divide-y">
              {m.recentInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{inv.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(inv.issue_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {formatCurrency(Number(inv.total))}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
