import { Bot, Sparkles, Zap } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "AI Asistent" };

const COMMANDS = [
  "Vytvořit fakturu",
  "Vytvořit cenovou nabídku",
  "Najít faktury po splatnosti",
  "Najít zákazníka",
  "Stav skladu",
  "Vypočítat DPH",
  "Najít neuhrazené faktury",
  "Vytvořit upomínku",
  "Analyzovat prodeje",
  "Předpovědět nedostatek zásob",
  "Vygenerovat přehledy",
];

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Asistent"
        description="Váš ERP kopilot — pracuje s živými firemními daty."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Na co se můžu zeptat?
            </CardTitle>
            <CardDescription>
              Plovoucí asistent je dostupný vpravo dole na každé stránce.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {COMMANDS.map((c) => (
                <span
                  key={c}
                  className="rounded-full border bg-background px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {c}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> Denní automatizace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Kontrola neuhrazených faktur a faktur po splatnosti</p>
            <p>• Upozornění na nedostatek skladových zásob</p>
            <p>• Blížící se konec platnosti nabídek</p>
            <p>• Chybějící údaje zákazníka / DPH</p>
            <p>• Detekce duplicitních produktů</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-center gap-3 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            Tip: asistent odpovídá z vašich živých dat i bez OpenAI klíče. Pro
            zapnutí OpenAI Responses API přidejte{" "}
            <code className="font-mono">OPENAI_API_KEY</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
