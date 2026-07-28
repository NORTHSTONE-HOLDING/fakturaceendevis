import { buildSpdString, qrDataUri } from "@/lib/payment";
import { HANDOVER_TITLES } from "@/lib/projects";
import type { DocumentData } from "@/lib/documents";
import type { InvoiceDetail } from "@/services/invoices";
import type { HandoverDetail } from "@/services/handover";

const PAYMENT_METHOD = "Bankovní převod";

/**
 * Maps a persisted invoice (+ relations) into the unified DocumentData shape
 * consumed by the DocumentPdf engine. Generates the QR platba code server-side.
 */
export async function invoiceToDocument(
  detail: InvoiceDetail,
): Promise<DocumentData> {
  const { invoice, customer, items, company } = detail;

  const spd = buildSpdString({
    iban: invoice.iban,
    amount: Number(invoice.total),
    currency: invoice.currency,
    variableSymbol: invoice.variable_symbol,
    message: invoice.number,
  });
  const qr = spd ? await qrDataUri(spd) : null;

  return {
    type: "invoice",
    logoUrl: company?.logo_url ?? null,
    number: invoice.number,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    taxDate: invoice.tax_date,
    currency: invoice.currency,
    supplier: {
      name: company?.name ?? "ENDEVIS s.r.o.",
      address: company?.address ?? null,
      ico: company?.ico ?? null,
      dic: company?.dic ?? null,
      email: company?.email ?? null,
      phone: company?.phone ?? null,
      website: null,
    },
    customer: customer
      ? {
          name: customer.company,
          address: customer.address,
          city: customer.city,
          zip: customer.zip,
          ico: customer.ico,
          dic: customer.dic,
          email: customer.email,
          phone: customer.phone,
          website: customer.website,
        }
      : null,
    items: items.map((it) => ({
      description: it.description,
      quantity: Number(it.quantity),
      unit: it.unit,
      unitPrice: Number(it.unit_price),
      vatRate: Number(it.vat_rate),
      total: Number(it.line_total),
    })),
    subtotal: Number(invoice.subtotal),
    vatTotal: Number(invoice.vat_total),
    total: Number(invoice.total),
    payment: {
      iban: invoice.iban,
      swift: invoice.swift,
      variableSymbol: invoice.variable_symbol,
      method: PAYMENT_METHOD,
      dueDate: invoice.due_date,
      qr,
    },
    statutoryNote: invoice.vat_note,
    notes: invoice.notes,
  };
}

/** Maps a handover protocol (+ relations) into the unified DocumentData shape. */
export function handoverToDocument(detail: HandoverDetail): DocumentData {
  const { handover, customer, company } = detail;
  const summary = Array.isArray(handover.summary)
    ? (handover.summary as { label: string; value: string }[])
    : [];

  return {
    type: "acceptance_protocol",
    titleOverride: HANDOVER_TITLES[handover.protocol_type],
    logoUrl: company?.logo_url ?? null,
    number: handover.number,
    issueDate: handover.protocol_date,
    currency: "CZK",
    supplier: {
      name: company?.name ?? "ENDEVIS s.r.o.",
      address: company?.address ?? null,
      ico: company?.ico ?? null,
      dic: company?.dic ?? null,
      email: company?.email ?? null,
      phone: company?.phone ?? null,
    },
    customer: customer
      ? {
          name: customer.company,
          address: handover.address ?? customer.address,
          city: customer.city,
          zip: customer.zip,
          ico: customer.ico,
          dic: customer.dic,
          email: customer.email,
          phone: customer.phone,
        }
      : null,
    items: [],
    subtotal: 0,
    vatTotal: 0,
    total: 0,
    protocol: {
      responsiblePerson: handover.responsible_person,
      completedWork: handover.completed_work,
      equipmentDelivered: handover.equipment_delivered,
      keysHanded: handover.keys_handed,
      meters: handover.meters,
      summary,
      customerName: handover.customer_signature,
      contractorName: handover.contractor_signature,
      signedCustomerAt: handover.customer_signed_at,
      signedContractorAt: handover.contractor_signed_at,
    },
    notes: handover.notes,
  };
}
