import { Warehouse, AlertTriangle, Upload } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
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

export const metadata = { title: "Warehouse" };

export default async function WarehousePage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_warehouse_item", true)
    .is("deleted_at", null)
    .order("name");

  const list = products ?? [];
  const low = list.filter((p) => Number(p.stock) <= Number(p.min_stock));
  const totalValue = list.reduce(
    (s, p) => s + Number(p.stock) * Number(p.purchase_price),
    0,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Warehouse"
        description="Stock levels, minimums and inventory value."
      >
        <Button variant="outline" disabled>
          <Upload className="h-4 w-4" /> Import (Excel / OCR)
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tracked items" value={String(list.length)} icon={Warehouse} />
        <StatCard
          label="Low stock"
          value={String(low.length)}
          icon={AlertTriangle}
          tone={low.length > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Inventory value"
          value={new Intl.NumberFormat("cs-CZ", {
            style: "currency",
            currency: "CZK",
            maximumFractionDigits: 0,
          }).format(totalValue)}
          icon={Warehouse}
          tone="gold"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU / EAN</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Min</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((p) => {
                const isLow = Number(p.stock) <= Number(p.min_stock);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">
                      {p.sku ?? "—"}
                      {p.ean ? <div className="text-muted-foreground">{p.ean}</div> : null}
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">
                      {Number(p.stock)} {p.unit}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {Number(p.min_stock)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isLow ? "destructive" : "success"}>
                        {isLow ? "Reorder" : "OK"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
