/**
 * Unified document model for ENDEVIS InvoiceFlow.
 *
 * Every document type (invoice, quotation, delivery note, …) is normalized into
 * `DocumentData` and rendered by the single shared `DocumentTemplate`, so they
 * all share an identical visual identity.
 */

export type DocumentDefType =
  | "invoice"
  | "advance_invoice"
  | "proforma_invoice"
  | "credit_note"
  | "quotation"
  | "budget"
  | "customer_order"
  | "supplier_order"
  | "delivery_note"
  | "acceptance_protocol"
  | "service_report";

export interface DocumentDef {
  /** Large Czech title shown in the header. */
  title: string;
  /** Numbering prefix (see next_document_number). */
  prefix: string;
  /** Whether the payment card is shown. */
  showPayment: boolean;
  /** Whether a due date is relevant. */
  showDue: boolean;
}

export const DOCUMENT_DEFS: Record<DocumentDefType, DocumentDef> = {
  invoice: { title: "FAKTURA", prefix: "INV", showPayment: true, showDue: true },
  advance_invoice: {
    title: "ZÁLOHOVÁ FAKTURA",
    prefix: "ADV",
    showPayment: true,
    showDue: true,
  },
  proforma_invoice: {
    title: "PROFORMA FAKTURA",
    prefix: "PRO",
    showPayment: true,
    showDue: true,
  },
  credit_note: {
    title: "DOBROPIS",
    prefix: "CRN",
    showPayment: true,
    showDue: false,
  },
  quotation: {
    title: "CENOVÁ NABÍDKA",
    prefix: "QTN",
    showPayment: false,
    showDue: false,
  },
  budget: { title: "ROZPOČET", prefix: "BUD", showPayment: false, showDue: false },
  customer_order: {
    title: "OBJEDNÁVKA",
    prefix: "ORD",
    showPayment: false,
    showDue: false,
  },
  supplier_order: {
    title: "OBJEDNÁVKA DODAVATELI",
    prefix: "SUP",
    showPayment: false,
    showDue: false,
  },
  delivery_note: {
    title: "DODACÍ LIST",
    prefix: "DLV",
    showPayment: false,
    showDue: false,
  },
  acceptance_protocol: {
    title: "PŘEDÁVACÍ PROTOKOL",
    prefix: "ACP",
    showPayment: false,
    showDue: false,
  },
  service_report: {
    title: "SERVISNÍ PROTOKOL",
    prefix: "SRV",
    showPayment: false,
    showDue: false,
  },
};

export interface DocumentParty {
  name: string;
  address?: string | null;
  city?: string | null;
  zip?: string | null;
  ico?: string | null;
  dic?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
}

export interface DocumentLineItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  discount?: number;
  total: number;
}

export interface DocumentPayment {
  iban?: string | null;
  swift?: string | null;
  bank?: string | null;
  variableSymbol?: string | null;
  method?: string | null;
  dueDate?: string | null;
  /** Data-URI QR code (Czech QR Platba). */
  qr?: string | null;
}

export interface DocumentData {
  type: DocumentDefType;
  number: string;
  issueDate: string;
  dueDate?: string | null;
  taxDate?: string | null;
  currency: string;
  supplier: DocumentParty;
  customer: DocumentParty | null;
  items: DocumentLineItem[];
  subtotal: number;
  vatTotal: number;
  discountTotal?: number;
  shipping?: number;
  total: number;
  payment?: DocumentPayment | null;
  notes?: string | null;
}
