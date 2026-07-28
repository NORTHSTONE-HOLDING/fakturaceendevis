"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isZeroRated, statutoryVatNote } from "@/lib/vat";
import type { InvoiceStatus, VatMode } from "@/types/database";

export interface InvoiceItemInput {
  product_id: string | null;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
}

export interface CreateInvoiceInput {
  customer_id: string | null;
  issue_date: string;
  due_date: string;
  tax_date: string;
  notes: string | null;
  vat_mode: VatMode;
  items: InvoiceItemInput[];
}

export interface CreateInvoiceResult {
  error?: string;
  id?: string;
  number?: string;
}

export async function createInvoiceAction(
  input: CreateInvoiceInput,
): Promise<CreateInvoiceResult> {
  const items = input.items.filter(
    (i) => i.description.trim() && i.quantity > 0,
  );
  if (items.length === 0) {
    return { error: "Přidejte alespoň jednu položku." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Database-controlled numbering — never duplicates, resets per year.
  const { data: number, error: numErr } = await supabase.rpc(
    "next_document_number",
    { p_doc_type: "INV" },
  );
  if (numErr || !number) {
    return { error: numErr?.message ?? "Nepodařilo se vygenerovat číslo faktury." };
  }

  // Company defaults for payment details
  const { data: company } = await supabase
    .from("company_settings")
    .select("iban, swift")
    .limit(1)
    .maybeSingle();

  // Special VAT modes (reverse charge / OSS / EU / export) force 0% VAT.
  const zeroRated = isZeroRated(input.vat_mode);
  const computed = items.map((i, idx) => {
    const line = round2(i.quantity * i.unit_price);
    return {
      ...i,
      vat_rate: zeroRated ? 0 : i.vat_rate,
      line_total: line,
      position: idx,
    };
  });
  const subtotal = round2(computed.reduce((s, i) => s + i.line_total, 0));
  const vatTotal = zeroRated
    ? 0
    : round2(computed.reduce((s, i) => s + i.line_total * (i.vat_rate / 100), 0));
  const total = round2(subtotal + vatTotal);
  const vatNote = statutoryVatNote(input.vat_mode);

  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .insert({
      number,
      customer_id: input.customer_id,
      status: "draft",
      issue_date: input.issue_date,
      due_date: input.due_date,
      tax_date: input.tax_date,
      subtotal,
      vat_total: vatTotal,
      total,
      notes: input.notes,
      vat_mode: input.vat_mode,
      vat_note: vatNote,
      iban: company?.iban ?? null,
      swift: company?.swift ?? null,
      variable_symbol: number.replace(/\D/g, "").slice(-10),
      created_by: user?.id ?? null,
    })
    .select("id, number")
    .single();

  if (invErr || !invoice) {
    return { error: invErr?.message ?? "Nepodařilo se vytvořit fakturu." };
  }

  const { error: itemsErr } = await supabase.from("invoice_items").insert(
    computed.map((i) => ({
      invoice_id: invoice.id,
      product_id: i.product_id,
      description: i.description,
      quantity: i.quantity,
      unit: i.unit,
      unit_price: i.unit_price,
      vat_rate: i.vat_rate,
      line_total: i.line_total,
      position: i.position,
    })),
  );

  if (itemsErr) {
    return { error: itemsErr.message };
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { id: invoice.id, number: invoice.number };
}

export async function updateInvoiceStatusAction(
  id: string,
  status: InvoiceStatus,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("invoices").update({ status }).eq("id", id);
  revalidatePath(`/invoices/${id}`);
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
