import { Package, AlertTriangle } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { ProductFormDialog } from "./product-form-dialog";
import { Badge } from "@/components/ui/badge";
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
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Products" };

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .is("deleted_at", null)
    .order("code", { ascending: true });

  const list = products ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Price List"
        description={`${list.length} products · prices with VAT and margin computed automatically`}
      >
        <ProductFormDialog />
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <Package className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No products yet. Add your first item.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Sale (excl.)</TableHead>
                  <TableHead className="text-right">VAT</TableHead>
                  <TableHead className="text-right">Price incl. VAT</TableHead>
                  <TableHead className="text-right">Margin</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((p) => {
                  const low = p.is_warehouse_item && Number(p.stock) <= Number(p.min_stock);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.code}</TableCell>
                      <TableCell>
                        <p className="font-medium">{p.name}</p>
                        {p.sku && (
                          <p className="text-xs text-muted-foreground">
                            SKU {p.sku}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(p.sale_price))}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {Number(p.vat_rate)}%
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(p.price_with_vat))}
                      </TableCell>
                      <TableCell className="text-right text-[hsl(var(--success))]">
                        {formatCurrency(Number(p.margin))}
                      </TableCell>
                      <TableCell className="text-right">
                        {p.is_warehouse_item ? (
                          <span className="inline-flex items-center gap-1">
                            {low && (
                              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                            )}
                            <Badge variant={low ? "destructive" : "outline"}>
                              {Number(p.stock)} {p.unit}
                            </Badge>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
