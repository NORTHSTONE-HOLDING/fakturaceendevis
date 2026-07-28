import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Product autocomplete used by document line items.
 * Typing a name or code searches the price list live.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  let query = supabase
    .from("products")
    .select(
      "id, code, name, description, unit, sale_price, vat_rate, price_with_vat",
    )
    .is("deleted_at", null)
    .eq("status", "active")
    .order("name")
    .limit(8);

  if (q) {
    query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ products: data ?? [] });
}
