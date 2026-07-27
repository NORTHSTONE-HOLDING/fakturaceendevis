import { Building2, CreditCard, Bot, Mail } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Settings" };

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
        title="Settings"
        description="Company profile, payment details, document numbering and integrations."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Company
            </CardTitle>
            <CardDescription>Used across all documents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field label="Name" value={company?.name} />
            <Field label="IČO" value={company?.ico} />
            <Field label="DIČ" value={company?.dic} />
            <Field label="Address" value={company?.address} />
            <Field label="Email" value={company?.email} />
            <Field label="Phone" value={company?.phone} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Payment &amp; numbering
            </CardTitle>
            <CardDescription>
              Bank details and document sequences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field label="IBAN" value={company?.iban} />
            <Field label="SWIFT" value={company?.swift} />
            <Field
              label="Default VAT"
              value={company ? `${Number(company.default_vat_rate)}%` : undefined}
            />
            <Field label="Currency" value={company?.currency} />
            <div className="pt-2">
              <p className="mb-1 text-xs text-muted-foreground">
                Document numbering formats
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
            <CardTitle>Integrations</CardTitle>
            <CardDescription>
              Configure API keys via environment variables
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
                  {i.on ? "Connected" : "Not set"}
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
