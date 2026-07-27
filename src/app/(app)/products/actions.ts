"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface ProductFormState {
  error?: string;
  success?: boolean;
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const code = String(formData.get("code") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!code || !name) return { error: "Code and name are required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("products").insert({
    code,
    name,
    description: strOrNull(formData.get("description")),
    unit: String(formData.get("unit") ?? "ks").trim() || "ks",
    purchase_price: num(formData.get("purchase_price")),
    sale_price: num(formData.get("sale_price")),
    vat_rate: num(formData.get("vat_rate"), 21),
    is_warehouse_item: formData.get("is_warehouse_item") === "on",
    sku: strOrNull(formData.get("sku")),
    ean: strOrNull(formData.get("ean")),
    stock: num(formData.get("stock")),
    min_stock: num(formData.get("min_stock")),
    created_by: user?.id ?? null,
  });

  if (error) {
    if (error.code === "23505") return { error: "Product code already exists." };
    return { error: error.message };
  }

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: true };
}

function num(v: FormDataEntryValue | null, fallback = 0): number {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function strOrNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length > 0 ? s : null;
}
