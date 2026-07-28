import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 3600;

const CNB_URL =
  "https://www.cnb.cz/en/financial-markets/foreign-exchange-market/central-bank-exchange-rate-fixing/central-bank-exchange-rate-fixing/daily.txt";

const WANTED = ["EUR", "USD", "GBP", "PLN"];

/**
 * Live foreign-exchange rates against CZK from the Czech National Bank (ČNB).
 * Used for multi-currency conversion across the accounting engine.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const res = await fetch(CNB_URL, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`CNB ${res.status}`);
    const text = await res.text();
    const lines = text.trim().split("\n");
    const date = lines[0]?.split(" #")[0] ?? "";

    const rates = lines
      .slice(2)
      .map((line) => {
        const [country, currency, amount, code, rate] = line.split("|");
        return {
          country,
          currency,
          amount: Number(amount),
          code,
          rate: Number(rate?.replace(",", ".")),
        };
      })
      .filter((r) => WANTED.includes(r.code));

    return NextResponse.json({ date, base: "CZK", rates });
  } catch {
    return NextResponse.json(
      { error: "Kurzovní lístek ČNB je momentálně nedostupný." },
      { status: 502 },
    );
  }
}
