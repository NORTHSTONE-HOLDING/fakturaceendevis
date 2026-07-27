import {
  Hash,
  Coins,
  FileDigit,
  CreditCard,
  CalendarClock,
  CalendarDays,
  Landmark,
  QrCode,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { DOCUMENT_DEFS, type DocumentData } from "@/lib/documents";
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
 * Responsive on screen; fixed A4 for print/PDF.
 */
export function DocumentTemplate({ data }: { data: DocumentData }) {
  const def = DOCUMENT_DEFS[data.type];

  const info: InfoItem[] = [
    { icon: Hash, label: "Číslo dokladu", value: data.number },
    { icon: Coins, label: "Měna", value: data.currency },
  ];
  if (data.payment?.variableSymbol) {
    info.push({
      icon: FileDigit,
      label: "Variabilní symbol",
      value: data.payment.variableSymbol,
    });
  }
  if (def.showPayment && data.payment?.method) {
    info.push({ icon: CreditCard, label: "Způsob platby", value: data.payment.method });
  }
  if (def.showDue && data.dueDate) {
    info.push({
      icon: CalendarClock,
      label: "Splatnost",
      value: formatDate(data.dueDate),
    });
  }

  return (
    <div className="document-sheet mx-auto w-full max-w-[210mm] bg-background text-foreground">
      <div className="p-6 sm:p-10">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Logo size={46} />
            <p className="mt-3 text-xs font-medium text-muted-foreground">
              {COMPANY_SLOGAN}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <h1 className="text-2xl font-bold uppercase tracking-tight sm:text-3xl">
              {def.title}
            </h1>
            <p className="mt-1 font-mono text-sm font-semibold text-primary">
              {data.number}
            </p>
            <dl className="mt-3 space-y-0.5 text-xs">
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

        <div className="my-6 h-px w-full bg-border sm:my-8" />

        {/* ── Parties ────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          <PartyBlock title="Dodavatel" party={data.supplier} />
          <PartyBlock
            title="Odběratel"
            party={
              data.customer ?? {
                name: "—",
              }
            }
          />
        </section>

        {/* ── Information bar ────────────────────────────────────── */}
        <section className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:mt-8 sm:grid-cols-4">
          {info.map((item) => (
            <div key={item.label} className="flex items-center gap-3 bg-muted px-4 py-3">
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
        <section className="mt-6 overflow-hidden rounded-lg border sm:mt-8">
          <table className="w-full border-collapse text-xs sm:text-[13px]">
            <thead>
              <tr className="bg-secondary text-secondary-foreground">
                <th className="px-3 py-2.5 text-left font-semibold">Popis</th>
                <th className="px-3 py-2.5 text-right font-semibold">Množství</th>
                <th className="px-3 py-2.5 text-left font-semibold">MJ</th>
                <th className="px-3 py-2.5 text-right font-semibold">Cena/j.</th>
                <th className="px-3 py-2.5 text-right font-semibold">DPH</th>
                <th className="px-3 py-2.5 text-right font-semibold">Sleva</th>
                <th className="px-3 py-2.5 text-right font-semibold">Celkem</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((it, idx) => (
                <tr key={idx} className="border-t border-border">
                  <td className="px-3 py-2.5">{it.description}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {it.quantity}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{it.unit}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatCurrency(it.unitPrice, data.currency)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground tabular-nums">
                    {it.vatRate}%
                  </td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground tabular-nums">
                    {it.discount ? `${it.discount}%` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                    {formatCurrency(it.total, data.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Payment + totals ───────────────────────────────────── */}
        <section className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 sm:grid-cols-2">
          <div>
            {def.showPayment && data.payment && (
              <PaymentCard payment={data.payment} total={data.total} currency={data.currency} />
            )}
          </div>

          <div className="space-y-1.5">
            <TotalRow label="Mezisoučet" value={formatCurrency(data.subtotal, data.currency)} />
            <TotalRow label="DPH" value={formatCurrency(data.vatTotal, data.currency)} />
            {!!data.discountTotal && (
              <TotalRow
                label="Sleva"
                value={`− ${formatCurrency(data.discountTotal, data.currency)}`}
              />
            )}
            {!!data.shipping && (
              <TotalRow label="Doprava" value={formatCurrency(data.shipping, data.currency)} />
            )}
            <div className="mt-1 flex items-center justify-between rounded-lg bg-primary px-4 py-3 text-primary-foreground">
              <span className="text-sm font-semibold uppercase tracking-wide">
                Celkem k úhradě
              </span>
              <span className="text-lg font-bold tabular-nums">
                {formatCurrency(data.total, data.currency)}
              </span>
            </div>
          </div>
        </section>

        {data.notes && (
          <p className="mt-8 rounded-lg bg-muted p-4 text-xs text-muted-foreground">
            {data.notes}
          </p>
        )}

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="mt-10 border-t pt-4">
          <div className="flex flex-col gap-2 text-[11px] text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <span>{formatAddress(data.supplier)}</span>
            <span>{data.supplier.email}</span>
            <span>{data.supplier.website}</span>
            <span>{data.supplier.phone}</span>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            {[
              data.supplier.ico ? `IČO: ${data.supplier.ico}` : null,
              data.supplier.dic ? `DIČ: ${data.supplier.dic}` : null,
              "Zapsáno v obchodním rejstříku.",
            ]
              .filter(Boolean)
              .join("  ·  ")}
          </p>
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            Vytvořeno v ENDEVIS InvoiceFlow
          </p>
        </footer>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6 sm:justify-end">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

function PartyBlock({
  title,
  party,
}: {
  title: string;
  party: import("@/lib/documents").DocumentParty;
}) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
        {title}
      </p>
      <p className="text-base font-semibold">{party.name}</p>
      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
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
    <div className="rounded-lg border border-primary/30 bg-accent/50 p-4">
      <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
        <CreditCard className="h-3.5 w-3.5" strokeWidth={1.75} /> Platební údaje
      </p>
      <div className="flex items-start justify-between gap-4">
        <dl className="space-y-1 text-xs">
          <PayRow icon={Landmark} label="IBAN" value={payment.iban} />
          <PayRow icon={Landmark} label="SWIFT" value={payment.swift} />
          {payment.bank && <PayRow icon={Landmark} label="Banka" value={payment.bank} />}
          <PayRow icon={FileDigit} label="VS" value={payment.variableSymbol} />
          <PayRow
            icon={CalendarDays}
            label="Splatnost"
            value={payment.dueDate ? formatDate(payment.dueDate) : null}
          />
          <PayRow
            icon={Coins}
            label="Částka"
            value={formatCurrency(total, currency)}
          />
        </dl>
        {payment.qr && (
          <div className="shrink-0 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={payment.qr} alt="QR platba" width={104} height={104} />
            <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
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
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("flex items-center justify-between px-4 text-sm")}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

function formatAddress(p: import("@/lib/documents").DocumentParty): string {
  return [p.address, [p.zip, p.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}
