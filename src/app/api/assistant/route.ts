import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * AI Assistant endpoint.
 *
 * The assistant is grounded in live ERP data. When an OPENAI_API_KEY is
 * configured, the collected context is passed to the OpenAI Responses API;
 * otherwise a deterministic, data-aware fallback answers common intents so the
 * feature remains fully functional in local development.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let message = "";
  try {
    const body = (await request.json()) as { message?: string };
    message = (body.message ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Empty message" }, { status: 400 });
  }

  const context = await gatherContext(supabase);

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const reply = await askOpenAI(apiKey, message, context);
      return NextResponse.json({ reply });
    } catch {
      // fall through to deterministic answer
    }
  }

  return NextResponse.json({ reply: deterministicReply(message, context) });
}

interface AssistantContext {
  overdueCount: number;
  overdueTotal: number;
  unpaidCount: number;
  lowStock: { name: string; stock: number; min_stock: number }[];
  revenue: number;
  customerCount: number;
  productCount: number;
}

async function gatherContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<AssistantContext> {
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: invoices }, { data: products }, customers] = await Promise.all([
    supabase
      .from("invoices")
      .select("status, total, due_date")
      .is("deleted_at", null),
    supabase
      .from("products")
      .select("name, stock, min_stock, is_warehouse_item")
      .is("deleted_at", null),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
  ]);

  const inv = invoices ?? [];
  const overdue = inv.filter(
    (i) => i.status !== "paid" && i.due_date < today && i.status !== "cancelled",
  );
  const unpaid = inv.filter((i) => i.status === "sent" || i.status === "overdue");
  const lowStock = (products ?? []).filter(
    (p) => p.is_warehouse_item && p.stock <= p.min_stock,
  );
  const revenue = inv
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + Number(i.total), 0);

  return {
    overdueCount: overdue.length,
    overdueTotal: overdue.reduce((s, i) => s + Number(i.total), 0),
    unpaidCount: unpaid.length,
    lowStock: lowStock.map((p) => ({
      name: p.name,
      stock: Number(p.stock),
      min_stock: Number(p.min_stock),
    })),
    revenue,
    customerCount: customers.count ?? 0,
    productCount: (products ?? []).length,
  };
}

function deterministicReply(message: string, ctx: AssistantContext): string {
  const q = message.toLowerCase();

  if (q.includes("splat") || q.includes("overdue")) {
    return ctx.overdueCount === 0
      ? "Nemáte žádné faktury po splatnosti."
      : `Máte ${ctx.overdueCount} faktur po splatnosti v celkové výši ${formatCurrency(ctx.overdueTotal)}. Mohu připravit upomínky (3/7/14/30 dní) e-mailem nebo přes WhatsApp.`;
  }
  if (q.includes("neuhraz") || q.includes("unpaid")) {
    return `Aktuálně je ${ctx.unpaidCount} neuhrazených faktur čekajících na platbu.`;
  }
  if (q.includes("sklad") || q.includes("warehouse") || q.includes("stock") || q.includes("zásob")) {
    if (ctx.lowStock.length === 0)
      return "Všechny skladové položky jsou nad minimální hladinou zásob.";
    const lines = ctx.lowStock
      .map((p) => `• ${p.name}: ${p.stock} (min ${p.min_stock})`)
      .join("\n");
    return `${ctx.lowStock.length} položek je na nebo pod minimální zásobou:\n${lines}`;
  }
  if (q.includes("prodej") || q.includes("tržb") || q.includes("sales") || q.includes("analyz")) {
    return `Zaplacené tržby zatím činí ${formatCurrency(ctx.revenue)} napříč fakturami. Spravujete ${ctx.customerCount} zákazníků a ${ctx.productCount} produktů.`;
  }
  if (q.includes("zákazn") || q.includes("customer")) {
    return `Aktuálně máte ${ctx.customerCount} aktivních zákazníků. Otevřete modul Zákazníci pro vyhledání nebo přidání nového.`;
  }
  if (q.includes("faktur") || q.includes("invoice")) {
    return "Rád pomohu s vytvořením faktury s automatickým číslováním (INV-RRRR-000001). Přejděte na Faktury → Nová, nebo mi sdělte zákazníka a položky.";
  }

  return `Rychlý přehled: ${ctx.customerCount} zákazníků, ${ctx.productCount} produktů, ${ctx.unpaidCount} neuhrazených faktur, ${ctx.overdueCount} po splatnosti a ${ctx.lowStock.length} položek s nízkou zásobou. Zeptejte se mě na faktury po splatnosti, stav skladu nebo prodeje.`;
}

async function askOpenAI(
  apiKey: string,
  message: string,
  ctx: AssistantContext,
): Promise<string> {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content:
            "Jsi AI asistent ERP systému ENDEVIS InvoiceFlow. Odpovídej stručně a profesionálně v češtině. K odpovědím využívej poskytnutá živá data.",
        },
        {
          role: "user",
          content: `Kontext živých dat: ${JSON.stringify(ctx)}\n\nDotaz: ${message}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}`);
  const data = (await res.json()) as {
    output_text?: string;
    output?: { content?: { text?: string }[] }[];
  };
  return (
    data.output_text ??
    data.output?.[0]?.content?.[0]?.text ??
    "Nepodařilo se vygenerovat odpověď."
  );
}
