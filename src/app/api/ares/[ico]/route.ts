import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ARES_URL =
  "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty";

interface AresSidlo {
  nazevObce?: string;
  nazevUlice?: string;
  cisloDomovni?: number;
  cisloOrientacni?: number;
  psc?: number;
  textovaAdresa?: string;
}
interface AresResponse {
  ico?: string;
  obchodniJmeno?: string;
  dic?: string;
  sidlo?: AresSidlo;
}

/**
 * Fetches a Czech company from the public ARES registry by IČO and returns it
 * normalized for the customer form (name, address, city, zip, DIČ).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ico: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ico } = await params;
  const clean = ico.replace(/\D/g, "");
  if (clean.length !== 8) {
    return NextResponse.json({ error: "IČO musí mít 8 číslic." }, { status: 400 });
  }

  try {
    const res = await fetch(`${ARES_URL}/${clean}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (res.status === 404) {
      return NextResponse.json(
        { error: "Subjekt s tímto IČO nebyl v ARES nalezen." },
        { status: 404 },
      );
    }
    if (!res.ok) throw new Error(`ARES ${res.status}`);
    const data = (await res.json()) as AresResponse;

    const sidlo = data.sidlo ?? {};
    const street =
      sidlo.nazevUlice && sidlo.cisloDomovni
        ? `${sidlo.nazevUlice} ${sidlo.cisloDomovni}${
            sidlo.cisloOrientacni ? `/${sidlo.cisloOrientacni}` : ""
          }`
        : (sidlo.textovaAdresa ?? "");
    const zip = sidlo.psc
      ? String(sidlo.psc).replace(/(\d{3})(\d{2})/, "$1 $2")
      : "";

    return NextResponse.json({
      ico: data.ico ?? clean,
      company: data.obchodniJmeno ?? "",
      dic: data.dic ?? "",
      address: street,
      city: sidlo.nazevObce ?? "",
      zip,
    });
  } catch {
    return NextResponse.json(
      { error: "ARES je momentálně nedostupný. Zkuste to prosím později." },
      { status: 502 },
    );
  }
}
