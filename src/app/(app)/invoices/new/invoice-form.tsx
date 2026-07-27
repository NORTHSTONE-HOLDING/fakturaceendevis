"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import {
  createInvoiceAction,
  type InvoiceItemInput,
} from "../actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { VAT_RATES } from "@/lib/constants";

interface Customer {
  id: string;
  company: string;
}

interface ProductResult {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  sale_price: number;
  vat_rate: number;
}

interface LineItem extends InvoiceItemInput {
  key: string;
  search: string;
  results: ProductResult[];
  showResults: boolean;
}

function newLine(): LineItem {
  return {
    key: crypto.randomUUID(),
    product_id: null,
    description: "",
    quantity: 1,
    unit: "ks",
    unit_price: 0,
    vat_rate: 21,
    search: "",
    results: [],
    showResults: false,
  };
}

function today(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function InvoiceForm({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [customerId, setCustomerId] = useState<string>("");
  const [issueDate, setIssueDate] = useState(today());
  const [taxDate, setTaxDate] = useState(today());
  const [dueDate, setDueDate] = useState(today(14));
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([newLine()]);

  function updateItem(key: string, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((it) => (it.key === key ? { ...it, ...patch } : it)),
    );
  }

  async function searchProducts(key: string, q: string) {
    updateItem(key, { search: q, description: q, showResults: true });
    try {
      const res = await fetch(
        `/api/products/search?q=${encodeURIComponent(q)}`,
      );
      const data = (await res.json()) as { products: ProductResult[] };
      updateItem(key, { results: data.products ?? [] });
    } catch {
      updateItem(key, { results: [] });
    }
  }

  function selectProduct(key: string, p: ProductResult) {
    updateItem(key, {
      product_id: p.id,
      description: p.name,
      search: p.name,
      unit: p.unit,
      unit_price: Number(p.sale_price),
      vat_rate: Number(p.vat_rate),
      results: [],
      showResults: false,
    });
  }

  const subtotal = items.reduce(
    (s, i) => s + i.quantity * i.unit_price,
    0,
  );
  const vatTotal = items.reduce(
    (s, i) => s + i.quantity * i.unit_price * (i.vat_rate / 100),
    0,
  );
  const total = subtotal + vatTotal;

  function submit() {
    startTransition(async () => {
      const result = await createInvoiceAction({
        customer_id: customerId || null,
        issue_date: issueDate,
        due_date: dueDate,
        tax_date: taxDate,
        notes: notes.trim() || null,
        items: items.map((i) => ({
          product_id: i.product_id,
          description: i.description,
          quantity: i.quantity,
          unit: i.unit,
          unit_price: i.unit_price,
          vat_rate: i.vat_rate,
        })),
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Faktura ${result.number} vytvořena`);
      router.push(`/invoices/${result.id}`);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Údaje</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Zákazník</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Vyberte zákazníka…" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="issue">Datum vystavení</Label>
            <Input
              id="issue"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax">Datum zdaň. plnění</Label>
            <Input
              id="tax"
              type="date"
              value={taxDate}
              onChange={(e) => setTaxDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due">Datum splatnosti</Label>
            <Input
              id="due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Položky</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setItems((p) => [...p, newLine()])}
          >
            <Plus className="h-4 w-4" /> Přidat položku
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div
              key={item.key}
              className="grid grid-cols-12 gap-2 rounded-lg border p-3"
            >
              <div className="relative col-span-12 md:col-span-5">
                <Label className="mb-1 block text-xs text-muted-foreground">
                  Produkt / popis
                </Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={item.search}
                    placeholder="Začněte psát pro vyhledání produktu…"
                    className="pl-8"
                    onChange={(e) => searchProducts(item.key, e.target.value)}
                    onFocus={() =>
                      updateItem(item.key, { showResults: true })
                    }
                    onBlur={() =>
                      setTimeout(
                        () => updateItem(item.key, { showResults: false }),
                        150,
                      )
                    }
                  />
                </div>
                {item.showResults && item.results.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-lg">
                    {item.results.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectProduct(item.key, p)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        <span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {p.code}
                          </span>{" "}
                          {p.name}
                        </span>
                        <span className="text-muted-foreground">
                          {formatCurrency(Number(p.sale_price))}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-span-4 md:col-span-2">
                <Label className="mb-1 block text-xs text-muted-foreground">
                  Množství
                </Label>
                <Input
                  type="number"
                  step="0.001"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.key, {
                      quantity: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <Label className="mb-1 block text-xs text-muted-foreground">
                  Cena/j.
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) =>
                    updateItem(item.key, {
                      unit_price: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="col-span-3 md:col-span-2">
                <Label className="mb-1 block text-xs text-muted-foreground">
                  VAT %
                </Label>
                <Select
                  value={String(item.vat_rate)}
                  onValueChange={(v) =>
                    updateItem(item.key, { vat_rate: Number(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VAT_RATES.map((r) => (
                      <SelectItem key={r} value={String(r)}>
                        {r}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1 flex items-end justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    setItems((p) =>
                      p.length > 1
                        ? p.filter((x) => x.key !== item.key)
                        : p,
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="col-span-12 text-right text-sm text-muted-foreground">
                Celkem za položku:{" "}
                <span className="font-medium text-foreground">
                  {formatCurrency(item.quantity * item.unit_price)}
                </span>
              </div>
            </div>
          ))}

          <div className="flex flex-col items-end gap-1 pt-2 text-sm">
            <div className="flex w-64 justify-between">
              <span className="text-muted-foreground">Mezisoučet</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex w-64 justify-between">
              <span className="text-muted-foreground">DPH</span>
              <span>{formatCurrency(vatTotal)}</span>
            </div>
            <div className="flex w-64 justify-between border-t pt-1 text-base font-semibold">
              <span>Celkem</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 pt-6">
          <Label htmlFor="notes">Poznámky</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Platební podmínky, poděkování…"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/invoices")}>
          Zrušit
        </Button>
        <Button onClick={submit} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Vytvořit fakturu
        </Button>
      </div>
    </div>
  );
}
