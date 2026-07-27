import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface DiaryInput {
  weather?: string;
  temperature?: number | null;
  workers_count?: number;
  activities?: string;
  materials_used?: string;
  problems?: string;
  imageUrls?: string[];
}

/**
 * Generates a professional Czech construction-diary entry.
 * With an OPENAI_API_KEY the uploaded photos are analysed via OpenAI Vision
 * (gpt-4o); otherwise a deterministic Czech summary is composed from the
 * structured fields so the feature stays usable in local development.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let input: DiaryInput = {};
  try {
    input = (await request.json()) as DiaryInput;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && input.imageUrls && input.imageUrls.length > 0) {
    try {
      const summary = await analyseWithVision(apiKey, input);
      return NextResponse.json({ summary });
    } catch {
      // fall through
    }
  }

  return NextResponse.json({ summary: deterministicSummary(input) });
}

function deterministicSummary(input: DiaryInput): string {
  const parts: string[] = [];
  const w = input.weather?.trim();
  if (w || input.temperature != null) {
    parts.push(
      `Počasí: ${w ?? "neuvedeno"}${
        input.temperature != null ? `, ${input.temperature} °C` : ""
      }.`,
    );
  }
  if (input.workers_count) parts.push(`Na stavbě pracovalo ${input.workers_count} pracovníků.`);
  if (input.activities?.trim()) parts.push(`Provedené práce: ${input.activities.trim()}.`);
  if (input.materials_used?.trim()) parts.push(`Použitý materiál: ${input.materials_used.trim()}.`);
  if (input.problems?.trim()) parts.push(`Problémy: ${input.problems.trim()}.`);
  if (parts.length === 0)
    return "Denní záznam stavebního deníku. Doplňte prosím provedené práce, materiál a počasí.";
  return parts.join(" ");
}

async function analyseWithVision(apiKey: string, input: DiaryInput): Promise<string> {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o";
  const content: unknown[] = [
    {
      type: "text",
      text:
        "Jsi stavbyvedoucí. Na základě fotografií a údajů vytvoř profesionální český zápis do stavebního deníku (3–5 vět): popiš viditelné provedené práce, počasí a počet pracovníků. Kontext: " +
        JSON.stringify({
          weather: input.weather,
          temperature: input.temperature,
          workers_count: input.workers_count,
          activities: input.activities,
        }),
    },
    ...(input.imageUrls ?? []).slice(0, 4).map((url) => ({
      type: "image_url",
      image_url: { url },
    })),
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content }],
      max_tokens: 400,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}`);
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? deterministicSummary(input);
}
