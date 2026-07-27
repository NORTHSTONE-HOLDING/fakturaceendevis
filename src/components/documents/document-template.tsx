import {
  Hash,
  Coins,
  FileDigit,
  CreditCard,
  CalendarClock,
  CalendarDays,
  Landmark,
  QrCode,
  Mail,
  Globe,
  Phone,
  MapPin,
  type LucideIcon,
} from "lucide-react";

import { DOCUMENT_DEFS, type DocumentData, type DocumentParty } from "@/lib/documents";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

const COMPANY_SLOGAN = "Premium fakturační a ERP systém";

interface InfoItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

/**
 * The single, unified ENDEVIS document template. Every document type renders
 * through this component to guarantee an identical visual identity.
 * A4 print grid (20mm margins); responsive on screen. Colors: gold / graphite /
 * light gray / white only.
 */
export function DocumentTemplate({ data }: { data: DocumentData }) {
  const def = DOCUMENT_DEFS[data.type];

  const info: InfoItem[] = [
    { icon: Hash, label: "Číslo dokladu", value: data.number },
    { icon: Coins, label: "Měna", value: data.currency },
  ];
  if (data.payment?.variableSymbol) {
    info.push({ icon: FileDigit, label: "Variabilní symbol", value: data.payment.variableSymbol });
  }
  if (def.showPayment && data.payment?.method) {
    info.push({ icon: CreditCard, label: "Způsob platby", value: data.payment.method });
  }
  if (def.showDue && data.dueDate) {
    info.push({ icon: CalendarClock, label: "Splatnost", value: formatDate(data.dueDate) });
  }

  return (
    <div className="document-sheet mx-auto flex min-h-[297mm] w-full max-w-[210mm] flex-col bg-background text-foreground">
      <div className="flex flex-1 flex-col p-8 sm:p-[18mm]">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <BrandLockup />
          <div className="text-left sm:text-right">
            <h1 className="text-3xl font-bold uppercase leading-none tracking-tight sm:text-4xl">
              {def.title}
            </h1>
            <p className="mt-2 font-mono text-base font-semibold text-primary">
              {data.number}
            </p>
            <dl className="mt-4 space-y-1 text-xs">
              <MetaRow label="Datum vystavení" value={formatDate(data.issueDate)} />
              {data.taxDate && (
                <MetaRow label="Datum zdaň. plnění" value={formatDate(data.taxDate)} />
              )}
              {def.showDue && data.dueDate && (
                <MetaRow label="Datum splatnosti" value={formatDate(data.dueDate)} />
              )}
            </dl>
          </div>
        </header>

        <div className="my-8 h-px w-full bg-border" />

        {/* ── Parties ────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <PartyBlock title="Dodavatel" party={data.supplier} />
          <PartyBlock title="Odběratel" party={data.customer ?? { name: "—" }} />
        </section>

        {/* ── Information bar ────────────────────────────────────── */}
        <section className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border sm:grid-cols-4">
          {info.map((item, i) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-3 bg-muted px-4 py-3.5",
                i % 4 !== 3 && "sm:border-r",
                i < info.length - (info.length % 4 || 4) && "border-b sm:border-b-0",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="truncate text-xs font-semibold">{item.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Items table ────────────────────────────────────────── */}
        <section className="mt-6 overflow-hidden rounded-2xl border">
          <table className="w-full border-collapse text-xs sm:text-[13px]">
            <thead>
              <tr className="bg-secondary text-secondary-foreground">
                <th className="px-4 py-3 text-left font-semibold">Popis</th>
                <th className="px-4 py-3 text-right font-semibold">Množství</th>
                <th className="px-4 py-3 text-left font-semibold">MJ</th>
                <th className="px-4 py-3 text-right font-semibold">Cena/j.</th>
                <th className="px-4 py-3 text-right font-semibold">DPH</th>
                <th className="px-4 py-3 text-right font-semibold">Sleva</th>
                <th className="px-4 py-3 text-right font-semibold">Celkem</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it, idx) => (
                <tr key={idx} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{it.description}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{it.quantity}</td>
                  <td className="px-4 py-3 text-muted-foreground">{it.unit}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {formatCurrency(it.unitPrice, data.currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                    {it.vatRate}%
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                    {it.discount ? `${it.discount}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatCurrency(it.total, data.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Payment + totals ───────────────────────────────────── */}
        <section className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            {def.showPayment && data.payment && (
              <PaymentCard payment={data.payment} total={data.total} currency={data.currency} />
            )}
          </div>

          <div className="rounded-2xl border p-4">
            <TotalRow label="Mezisoučet" value={formatCurrency(data.subtotal, data.currency)} />
            <TotalRow label="DPH" value={formatCurrency(data.vatTotal, data.currency)} />
            {!!data.discountTotal && (
              <TotalRow label="Sleva" value={`− ${formatCurrency(data.discountTotal, data.currency)}`} />
            )}
            {!!data.shipping && (
              <TotalRow label="Doprava" value={formatCurrency(data.shipping, data.currency)} />
            )}
            <div className="mt-3 flex items-center justify-between rounded-xl bg-primary px-4 py-3.5 text-primary-foreground">
              <span className="text-sm font-semibold uppercase tracking-wide">
                Celkem k úhradě
              </span>
              <span className="text-xl font-bold tabular-nums">
                {formatCurrency(data.total, data.currency)}
              </span>
            </div>
          </div>
        </section>

        {data.notes && (
          <p className="mt-6 rounded-2xl bg-muted p-4 text-xs text-muted-foreground">
            {data.notes}
          </p>
        )}

        {/* ── Footer (three equal columns, pinned to bottom) ─────── */}
        <footer className="mt-auto border-t pt-5 sm:pt-6">
          <div className="grid grid-cols-1 gap-4 text-[11px] leading-relaxed text-muted-foreground sm:grid-cols-3">
            <div>
              <p className="mb-1 font-semibold uppercase tracking-wide text-foreground">
                {data.supplier.name}
              </p>
              <p className="flex items-start gap-1.5">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0" strokeWidth={1.75} />
                {formatAddress(data.supplier) || "—"}
              </p>
            </div>
            <div className="space-y-1">
              {data.supplier.email && (
                <p className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0" strokeWidth={1.75} /> {data.supplier.email}
                </p>
              )}
              {data.supplier.website && (
                <p className="flex items-center gap-1.5">
                  <Globe className="h-3 w-3 shrink-0" strokeWidth={1.75} /> {data.supplier.website}
                </p>
              )}
              {data.supplier.phone && (
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 shrink-0" strokeWidth={1.75} /> {data.supplier.phone}
                </p>
              )}
            </div>
            <div className="space-y-1 sm:text-right">
              {data.supplier.ico && <p>IČO: {data.supplier.ico}</p>}
              {data.supplier.dic && <p>DIČ: {data.supplier.dic}</p>}
              <p>Zapsáno v obchodním rejstříku.</p>
            </div>
          </div>
          <p className="mt-4 text-center text-[10px] text-muted-foreground">
            Vytvořeno v ENDEVIS InvoiceFlow
          </p>
        </footer>
      </div>
    </div>
  );
}

/** Dominant brand lockup — large gold icon on the left, name on the right. */
function BrandLockup() {
  return (
    <div className="flex items-center gap-4">
      <svg width={60} height={60} viewBox="0 0 48 48" fill="none" aria-hidden>
        <rect width="48" height="48" rx="14" fill="url(#doc-gold)" />
        <path d="M15 14h18v5H21v3.5h10v4.8H21V31h12v5H15V14z" fill="#181818" />
        <defs>
          <linearGradient id="doc-gold" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E4C374" />
            <stop offset="1" stopColor="#B8873B" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <p className="text-2xl font-bold leading-none tracking-tight">ENDEVIS</p>
        <p className="text-sm font-semibold leading-tight text-primary">InvoiceFlow</p>
        <p className="mt-1 text-[11px] font-medium text-muted-foreground">{COMPANY_SLOGAN}</p>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-8 sm:justify-end">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-[84px] font-semibold sm:text-right">{value}</dd>
    </div>
  );
}

function PartyBlock({ title, party }: { title: string; party: DocumentParty }) {
  return (
    <div className="rounded-2xl border bg-muted/40 p-5">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
        {title}
      </p>
      <p className="text-base font-bold">{party.name}</p>
      <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
        {party.address && <p>{party.address}</p>}
        {(party.zip || party.city) && (
          <p>
            {party.zip} {party.city}
          </p>
        )}
        {party.ico && <p>IČO: {party.ico}</p>}
        {party.dic && <p>DIČ: {party.dic}</p>}
        {party.email && <p>{party.email}</p>}
        {party.phone && <p>{party.phone}</p>}
        {party.website && <p>{party.website}</p>}
      </div>
    </div>
  );
}

function PaymentCard({
  payment,
  total,
  currency,
}: {
  payment: import("@/lib/documents").DocumentPayment;
  total: number;
  currency: string;
}) {
  return (
    <div className="h-full rounded-2xl border border-primary/30 bg-accent/40 p-5">
      <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
        <Landmark className="h-3.5 w-3.5" strokeWidth={1.75} /> Platební údaje
      </p>
      <div className="flex items-start justify-between gap-4">
        <dl className="space-y-1.5 text-xs">
          <PayRow icon={Landmark} label="IBAN" value={payment.iban} />
          <PayRow icon={Landmark} label="SWIFT" value={payment.swift} />
          {payment.bank && <PayRow icon={Landmark} label="Banka" value={payment.bank} />}
          <PayRow icon={FileDigit} label="VS" value={payment.variableSymbol} />
          <PayRow
            icon={CalendarDays}
            label="Splatnost"
            value={payment.dueDate ? formatDate(payment.dueDate) : null}
          />
          <PayRow icon={Coins} label="Částka" value={formatCurrency(total, currency)} />
        </dl>
        {payment.qr && (
          <div className="shrink-0 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={payment.qr}
              alt="QR platba"
              width={112}
              height={112}
              className="rounded-lg border bg-white p-1"
            />
            <p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
              <QrCode className="h-3 w-3" strokeWidth={1.75} /> QR platba
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PayRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      <span className="w-16 text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function formatAddress(p: DocumentParty): string {
  return [p.address, [p.zip, p.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}
