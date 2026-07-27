"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { createProductAction, type ProductFormState } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Save product
    </Button>
  );
}

export function ProductFormDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState<ProductFormState, FormData>(
    createProductAction,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Product created");
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New product</DialogTitle>
          <DialogDescription>
            Add an item to your price list. Prices with VAT and margin are
            computed automatically.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input id="code" name="code" required placeholder="PRD-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" defaultValue="ks" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat_rate">VAT rate (%)</Label>
              <Input
                id="vat_rate"
                name="vat_rate"
                type="number"
                step="0.01"
                defaultValue="21"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase price</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                step="0.01"
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale price</Label>
              <Input
                id="sale_price"
                name="sale_price"
                type="number"
                step="0.01"
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" name="sku" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ean">EAN / Barcode</Label>
              <Input id="ean" name="ean" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" name="stock" type="number" step="0.001" defaultValue="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_stock">Minimum stock</Label>
              <Input
                id="min_stock"
                name="min_stock"
                type="number"
                step="0.001"
                defaultValue="0"
              />
            </div>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                name="is_warehouse_item"
                className="h-4 w-4 rounded border-input accent-[hsl(var(--primary))]"
              />
              <span className="text-sm">Track as warehouse item</span>
            </label>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
