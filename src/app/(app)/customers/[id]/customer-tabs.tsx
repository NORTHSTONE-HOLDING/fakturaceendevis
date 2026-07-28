"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  TrendingDown,
  AlertTriangle,
  Receipt,
  HardHat,
  Users,
  Plus,
  Loader2,
  Trash2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import {
  addContactAction,
  deleteContactAction,
  saveCustomerNotesAction,
} from "./actions";
import type { CustomerProfile } from "@/services/customers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_VARIANT,
} from "@/lib/projects";
import { formatCurrency, formatDate } from "@/lib/utils";

export function CustomerTabs({ profile }: { profile: CustomerProfile }) {
  const { customer, contacts, invoices, projects, payments } = profile;

  return (
    <Tabs defaultValue="overview">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">Přehled</TabsTrigger>
        <TabsTrigger value="contacts">Kontakty ({contacts.length})</TabsTrigger>
        <TabsTrigger value="documents">Faktury ({invoices.length})</TabsTrigger>
        <TabsTrigger value="projects">Projekty ({projects.length})</TabsTrigger>
        <TabsTrigger value="payments">Platební morálka</TabsTrigger>
        <TabsTrigger value="notes">Poznámky</TabsTrigger>
      </TabsList>

      {/* Overview */}
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Kontaktní údaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row icon={MapPin} value={address(customer)} />
              <Row icon={Mail} value={customer.email} />
              <Row icon={Phone} value={customer.phone} />
              <Row icon={Globe} value={customer.website} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Fakturační metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <Field label="IČO" value={customer.ico} />
              <Field label="DIČ" value={customer.dic} />
              <Field label="IBAN" value={customer.iban} />
              <Field label="SWIFT" value={customer.swift} />
              <Field label="Splatnost" value={`${customer.payment_terms_days} dní`} />
              <Field label="Zákazníkem od" value={formatDate(customer.created_at)} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Contacts */}
      <TabsContent value="contacts" className="space-y-4">
        <ContactForm customerId={customer.id} />
        {contacts.length === 0 ? (
          <Empty icon={Users} text="Zatím žádné kontaktní osoby." />
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <ContactRow key={c.id} contact={c} customerId={customer.id} />
            ))}
          </div>
        )}
      </TabsContent>

      {/* Documents / invoices */}
      <TabsContent value="documents" className="space-y-4">
        {invoices.length === 0 ? (
          <Empty icon={Receipt} text="Žádné doklady pro tohoto zákazníka." />
        ) : (
          <Card>
            <CardContent className="divide-y p-0">
              {invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{inv.number}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(inv.issue_date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums">{formatCurrency(Number(inv.total))}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Projects */}
      <TabsContent value="projects" className="space-y-4">
        {projects.length === 0 ? (
          <Empty icon={HardHat} text="Žádné projekty pro tohoto zákazníka." />
        ) : (
          <Card>
            <CardContent className="divide-y p-0">
              {projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/40"
                >
                  <div className="flex items-center gap-2">
                    <HardHat className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{p.number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums">{formatCurrency(Number(p.budget_amount))}</span>
                    <Badge variant={PROJECT_STATUS_VARIANT[p.status]}>
                      {PROJECT_STATUS_LABELS[p.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Payments */}
      <TabsContent value="payments" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Wallet} tone="success" label="Zaplaceno" value={formatCurrency(payments.paidTotal)} />
          <Metric icon={TrendingDown} tone="warning" label="Neuhrazeno" value={formatCurrency(payments.outstanding)} />
          <Metric icon={AlertTriangle} tone="destructive" label="Po splatnosti" value={formatCurrency(payments.overdue)} />
          <Metric icon={Receipt} tone="gold" label="Obrat celkem" value={formatCurrency(payments.lifetimeRevenue)} />
        </div>
        <Card>
          <CardContent className="grid gap-4 pt-6 sm:grid-cols-3 text-sm">
            <Field label="Počet faktur" value={String(payments.invoiceCount)} />
            <Field label="Největší faktura" value={formatCurrency(payments.largestInvoice)} />
            <Field label="Poslední platba" value={payments.lastPaymentDate ? formatDate(payments.lastPaymentDate) : "—"} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notes */}
      <TabsContent value="notes" className="space-y-4">
        <NotesEditor customerId={customer.id} initial={customer.notes ?? ""} />
      </TabsContent>
    </Tabs>
  );
}

function address(c: CustomerProfile["customer"]): string | null {
  const a = [c.address, [c.zip, c.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return a || null;
}

function Row({ icon: Icon, value }: { icon: typeof Mail; value?: string | null }) {
  if (!value) return null;
  return (
    <p className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" /> {value}
    </p>
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

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  tone: "gold" | "success" | "warning" | "destructive";
}) {
  const tones: Record<string, string> = {
    gold: "bg-primary/12 text-primary",
    success: "bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]",
    warning: "bg-[hsl(var(--warning)/0.15)] text-[hsl(38,80%,38%)]",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function Empty({ icon: Icon, text }: { icon: typeof Users; text: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <Icon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}

function ContactForm({ customerId }: { customerId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState({ last_name: "", first_name: "", position: "", phone: "", email: "", is_primary: false });

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit() {
    startTransition(async () => {
      const r = await addContactAction(customerId, {
        last_name: form.last_name,
        first_name: form.first_name || null,
        position: form.position || null,
        phone: form.phone || null,
        email: form.email || null,
        is_primary: form.is_primary,
      });
      if (r.error) {
        toast.error(r.error);
        return;
      }
      toast.success("Kontakt přidán");
      setForm({ last_name: "", first_name: "", position: "", phone: "", email: "", is_primary: false });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="grid gap-3 pt-6 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Jméno</Label>
          <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Příjmení *</Label>
          <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Pozice</Label>
          <Input value={form.position} onChange={(e) => set("position", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Telefon</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">E-mail</Label>
          <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_primary}
            onChange={(e) => set("is_primary", e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
          Primární kontakt
        </label>
        <div className="sm:col-span-3">
          <Button onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Přidat kontakt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ContactRow({
  contact,
  customerId,
}: {
  contact: CustomerProfile["contacts"][number];
  customerId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium">
            {[contact.first_name, contact.last_name].filter(Boolean).join(" ")}
            {contact.is_primary && (
              <span className="inline-flex items-center gap-1 text-xs text-primary">
                <Star className="h-3.5 w-3.5" /> Primární
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {[contact.position, contact.email, contact.phone].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await deleteContactAction(contact.id, customerId);
              router.refresh();
            })
          }
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function NotesEditor({ customerId, initial }: { customerId: string; initial: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initial);
  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <Textarea rows={8} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Interní poznámky k zákazníkovi…" />
        <Button
          onClick={() =>
            startTransition(async () => {
              const r = await saveCustomerNotesAction(customerId, notes);
              if (r.error) {
                toast.error(r.error);
                return;
              }
              toast.success("Poznámky uloženy");
              router.refresh();
            })
          }
          disabled={pending}
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Uložit poznámky
        </Button>
      </CardContent>
    </Card>
  );
}
