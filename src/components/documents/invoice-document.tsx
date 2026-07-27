import { Logo } from "@/components/brand/logo";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  CompanySettings,
  Customer,
  Invoice,
  InvoiceItem,
} from "@/types/database";

interface InvoiceDocumentProps {
  invoice: Invoice;
  customer: Customer | null;
  items: InvoiceItem[];
  company: CompanySettings | null;
  qr?: string | null;
}

/**
 * Unified A4 invoice template — shared branding used across all documents.
 */
export function InvoiceDocument({
  invoice,
  customer,
  items,
  company,
  qr,
}: InvoiceDocumentProps) {
  return (
    <div className="mx-auto w-full max-w-[794px] bg-white p-10 text-[13px] text-graphite">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Logo size={44} />
          <div className="mt-4 space-y-0.5 text-xs text-muted-foreground">
            <p className="font-medium text-graphite">
              {company?.name ?? "ENDEVIS s.r.o."}
            </p>
            {company?.address && <p>{company.address}</p>}
            {company?.ico && <p>IČO: {company.ico}</p>}
            {company?.dic && <p>DIČ: {company.dic}</p>}
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-semibold tracking-tight">Faktura</h1>
          <p className="mt-1 font-mono text-sm text-primary">
            {invoice.number}
          </p>
        </div>
      </div>

      <div className="my-8 h-px bg-border" />

      {/* Parties + dates */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Odběratel
          </p>
          <p className="text-base font-semibold">
            {customer?.company ?? "—"}
          </p>
          {customer?.contact_person && <p>{customer.contact_person}</p>}
          {customer?.address && <p>{customer.address}</p>}
          {(customer?.zip || customer?.city) && (
            <p>
              {customer?.zip} {customer?.city}
            </p>
          )}
          {customer?.ico && <p>IČO: {customer.ico}</p>}
          {customer?.dic && <p>DIČ: {customer.dic}</p>}
        </div>
        <div className="space-y-1 text-right">
          <Row label="Datum vystavení" value={formatDate(invoice.issue_date)} />
          <Row label="Datum zdaň. plnění" value={formatDate(invoice.tax_date)} />
          <Row label="Datum splatnosti" value={formatDate(invoice.due_date)} />
          {invoice.variable_symbol && (
            <Row label="Variabilní symbol" value={invoice.variable_symbol} />
          )}
        </div>
      </div>

      {/* Items */}
      <table className="mt-8 w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-graphite/20 text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="py-2 text-left">Popis</th>
            <th className="py-2 text-right">Množství</th>
            <th className="py-2 text-right">Cena/j.</th>
            <th className="py-2 text-right">DPH</th>
            <th className="py-2 text-right">Celkem</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b border-border">
              <td className="py-2.5">{it.description}</td>
              <td className="py-2.5 text-right">
                {Number(it.quantity)} {it.unit}
              </td>
              <td className="py-2.5 text-right">
                {formatCurrency(Number(it.unit_price))}
              </td>
              <td className="py-2.5 text-right text-muted-foreground">
                {Number(it.vat_rate)}%
              </td>
              <td className="py-2.5 text-right font-medium">
                {formatCurrency(Number(it.line_total))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals + QR */}
      <div className="mt-8 flex items-start justify-between gap-8">
        <div className="space-y-3">
          {(invoice.iban || invoice.swift) && (
            <div className="text-xs">
              <p className="mb-1 font-semibold uppercase tracking-wider text-muted-foreground">
                Platební údaje
              </p>
              {invoice.iban && <p>IBAN: {invoice.iban}</p>}
              {invoice.swift && <p>SWIFT: {invoice.swift}</p>}
            </div>
          )}
          {qr && (
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qr} alt="QR Platba" width={120} height={120} />
              <p className="mt-1 text-[11px] text-muted-foreground">QR Platba</p>
            </div>
          )}
        </div>

        <div className="w-64 space-y-1.5">
          <Row label="Základ" value={formatCurrency(Number(invoice.subtotal))} />
          <Row label="DPH" value={formatCurrency(Number(invoice.vat_total))} />
          <div className="flex items-center justify-between rounded-lg bg-accent px-3 py-2 text-base font-semibold text-accent-foreground">
            <span>Celkem k úhradě</span>
            <span>{formatCurrency(Number(invoice.total))}</span>
          </div>
        </div>
      </div>

      {invoice.notes && (
        <div className="mt-10 border-t pt-4 text-xs text-muted-foreground">
          {invoice.notes}
        </div>
      )}

      <p className="mt-12 text-center text-[10px] text-muted-foreground">
        Vytvořeno v ENDEVIS InvoiceFlow
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
