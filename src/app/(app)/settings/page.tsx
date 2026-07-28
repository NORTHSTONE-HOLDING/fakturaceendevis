import { Building2, CreditCard, Bot, Mail, Image as ImageIcon, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { LogoUpload } from "./logo-upload";
import { ExchangeRates } from "./exchange-rates";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Nastavení" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: company } = await supabase
    .from("company_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  const integrations = [
    { name: "OpenAI", icon: Bot, on: !!process.env.OPENAI_API_KEY },
    { name: "Resend (email)", icon: Mail, on: !!process.env.RESEND_API_KEY },
    {
      name: "WhatsApp Business",
      icon: Mail,
      on: !!process.env.WHATSAPP_ACCESS_TOKEN,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nastavení"
        description="Profil firmy, platební údaje, číslování dokladů a integrace."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-primary" /> Logo firmy
          </CardTitle>
          <CardDescription>
            Nahrané logo se automaticky propíše do hlavičky všech dokladů (PDF).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogoUpload logoUrl={company?.logo_url ?? null} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Firma
            </CardTitle>
            <CardDescription>Používá se na všech dokladech</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field label="Název" value={company?.name} />
            <Field label="IČO" value={company?.ico} />
            <Field label="DIČ" value={company?.dic} />
            <Field label="Adresa" value={company?.address} />
            <Field label="E-mail" value={company?.email} />
            <Field label="Telefon" value={company?.phone} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Platba a číslování
            </CardTitle>
            <CardDescription>
              Bankovní údaje a číselné řady dokladů
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field label="IBAN" value={company?.iban} />
            <Field label="SWIFT" value={company?.swift} />
            <Field
              label="Výchozí DPH"
              value={company ? `${Number(company.default_vat_rate)}%` : undefined}
            />
            <Field label="Měna" value={company?.currency} />
            <div className="pt-2">
              <p className="mb-1 text-xs text-muted-foreground">
                Formáty číslování dokladů
              </p>
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                <Badge variant="outline">INV-YYYY-000001</Badge>
                <Badge variant="outline">QTN-YYYY-000001</Badge>
                <Badge variant="outline">ORD-YYYY-000001</Badge>
                <Badge variant="outline">DLV-YYYY-000001</Badge>
                <Badge variant="outline">ADV-YYYY-000001</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Kurzy ČNB
            </CardTitle>
            <CardDescription>
              Denní kurzovní lístek České národní banky (multi-měnové doklady)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ExchangeRates />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Integrace</CardTitle>
            <CardDescription>
              Nastavte API klíče pomocí proměnných prostředí
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {integrations.map((i) => (
              <div
                key={i.name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <i.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{i.name}</span>
                </div>
                <Badge variant={i.on ? "success" : "outline"}>
                  {i.on ? "Připojeno" : "Nenastaveno"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between border-b py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? "—"}</span>
    </div>
  );
}
