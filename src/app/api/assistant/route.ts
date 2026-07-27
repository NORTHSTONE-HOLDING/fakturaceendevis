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

  if (q.includes("overdue") || q.includes("po splat")) {
    return ctx.overdueCount === 0
      ? "You have no overdue invoices. "
      : `You have ${ctx.overdueCount} overdue invoice(s) totalling ${formatCurrency(ctx.overdueTotal)}. I can draft reminders (3/7/14/30 days) via email or WhatsApp.`;
  }
  if (q.includes("unpaid") || q.includes("neuhraz")) {
    return `There are ${ctx.unpaidCount} unpaid invoice(s) currently awaiting payment.`;
  }
  if (q.includes("warehouse") || q.includes("stock") || q.includes("sklad")) {
    if (ctx.lowStock.length === 0)
      return "All warehouse items are above their minimum stock levels.";
    const lines = ctx.lowStock
      .map((p) => `• ${p.name}: ${p.stock} (min ${p.min_stock})`)
      .join("\n");
    return `${ctx.lowStock.length} item(s) are at or below minimum stock:\n${lines}`;
  }
  if (q.includes("sales") || q.includes("revenue") || q.includes("analyze")) {
    return `Paid revenue so far is ${formatCurrency(ctx.revenue)} across your invoices. You manage ${ctx.customerCount} customers and ${ctx.productCount} products.`;
  }
  if (q.includes("customer") || q.includes("zákazn")) {
    return `You currently have ${ctx.customerCount} active customers. Open the Customers module to search or add a new one.`;
  }
  if (q.includes("invoice") || q.includes("faktur")) {
    return "I can help create invoices with automatic numbering (INV-YYYY-000001). Head to Invoices → New, or tell me the customer and items.";
  }

  return `Here is a quick overview: ${ctx.customerCount} customers, ${ctx.productCount} products, ${ctx.unpaidCount} unpaid invoice(s), ${ctx.overdueCount} overdue, and ${ctx.lowStock.length} low-stock item(s). Ask me about overdue invoices, warehouse status or sales.`;
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
            "You are the ENDEVIS InvoiceFlow AI assistant for an ERP system. Be concise and professional. Use the provided live data context to answer.",
        },
        {
          role: "user",
          content: `Live data context: ${JSON.stringify(ctx)}\n\nQuestion: ${message}`,
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
    "I couldn't generate a response."
  );
}
