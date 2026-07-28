/* eslint-disable jsx-a11y/alt-text */
import path from "node:path";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
} from "@react-pdf/renderer";

import { DOCUMENT_DEFS, type DocumentData, type DocumentParty } from "@/lib/documents";

/* ────────────────────────────────────────────────────────────────────────
 * Fonts — bundled static Inter TTFs (public/fonts). Registered once.
 * ──────────────────────────────────────────────────────────────────────── */
const FONT_DIR = path.join(process.cwd(), "public", "fonts");
try {
  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(FONT_DIR, "Inter-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "Inter-Medium.ttf"), fontWeight: 500 },
      { src: path.join(FONT_DIR, "Inter-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(FONT_DIR, "Inter-Bold.ttf"), fontWeight: 700 },
    ],
  });
  // Wrap whole words to the next line instead of hyphenating them.
  Font.registerHyphenationCallback((word) => [word]);
} catch {
  // Falls back to Helvetica if the TTFs are unavailable.
}

/* Brand palette — gold / graphite / light gray / white only. */
const GOLD = "#C89B3C";
const GRAPHITE = "#181818";
const LIGHT = "#F7F7F7";
const BORDER = "#E4E4E4";
const MUTED = "#6B6B6B";
const WHITE = "#FFFFFF";

/* A4 geometry (pt). 1mm ≈ 2.83465pt. 12mm margins. */
const MM = 2.83465;
const MARGIN = 12 * MM;
const HEADER_H = 74;
const FOOTER_H = 58;

/* Fixed item-table column widths (content width = 595.28 − 2*margin ≈ 527pt). */
const COLS = {
  desc: 195,
  qty: 50,
  unit: 34,
  price: 76,
  vat: 40,
  discount: 40,
  total: 92,
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 9,
    color: GRAPHITE,
    paddingTop: MARGIN + HEADER_H,
    paddingBottom: MARGIN + FOOTER_H,
    paddingHorizontal: MARGIN,
    lineHeight: 1.35,
  },
  /* Header (fixed, repeats every page) */
  header: {
    position: "absolute",
    top: MARGIN,
    left: MARGIN,
    right: MARGIN,
    height: HEADER_H,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 8,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: { color: GRAPHITE, fontSize: 24, fontWeight: 700 },
  brandName: { fontSize: 15, fontWeight: 700, letterSpacing: 0.3 },
  brandSub: { fontSize: 9, fontWeight: 600, color: GOLD },
  brandSlogan: { fontSize: 7.5, color: MUTED, marginTop: 1 },
  docTitle: { fontSize: 20, fontWeight: 700, textTransform: "uppercase", textAlign: "right", lineHeight: 1 },
  docNumber: { fontSize: 10, fontWeight: 600, color: GOLD, textAlign: "right", marginTop: 5 },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 2 },
  metaLabel: { color: MUTED },
  metaValue: { fontWeight: 600, width: 62, textAlign: "right" },

  /* Footer (fixed, repeats every page) */
  footer: {
    position: "absolute",
    bottom: MARGIN,
    left: MARGIN,
    right: MARGIN,
    height: FOOTER_H,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerCol: { flexBasis: "32%", fontSize: 7.5, color: MUTED },
  footerColRight: { flexBasis: "32%", fontSize: 7.5, color: MUTED, textAlign: "right" },
  footerStrong: { color: GRAPHITE, fontWeight: 700, marginBottom: 2 },
  pageNo: {
    position: "absolute",
    bottom: MARGIN - 10,
    left: MARGIN,
    right: MARGIN,
    textAlign: "center",
    fontSize: 7,
    color: MUTED,
  },

  /* Parties — borderless, thin divider above, two 50% columns, generous space */
  parties: {
    flexDirection: "row",
    gap: 28,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingTop: 14,
    marginBottom: 18,
  },
  partyCol: { flexBasis: "50%", flexGrow: 1 },
  partyLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    color: GOLD,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  partyName: { fontSize: 12, fontWeight: 600, marginBottom: 4 },
  partyLine: { fontSize: 8.5, color: MUTED, marginBottom: 1.5 },

  /* Info bar (single fixed-height row) */
  infoBar: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    height: 40,
  },
  infoCell: {
    flex: 1,
    backgroundColor: LIGHT,
    paddingHorizontal: 8,
    justifyContent: "center",
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  infoLabel: { fontSize: 6.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4 },
  infoValue: { fontSize: 8.5, fontWeight: 600 },

  /* Table */
  table: { borderWidth: 1, borderColor: BORDER, borderRadius: 12, overflow: "hidden" },
  thead: { flexDirection: "row", backgroundColor: GRAPHITE },
  th: { color: WHITE, fontSize: 8, fontWeight: 700, paddingVertical: 6, paddingHorizontal: 6 },
  row: { flexDirection: "row", borderTopWidth: 1, borderTopColor: BORDER },
  rowAlt: { backgroundColor: "#FCFCFC" },
  td: { fontSize: 8.5, paddingVertical: 6, paddingHorizontal: 6 },
  tdMuted: { fontSize: 8.5, color: MUTED, paddingVertical: 6, paddingHorizontal: 6 },

  /* Summary + payment (kept together, below table) */
  summaryWrap: { flexDirection: "row", gap: 12, marginTop: 12 },
  payCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 12,
    backgroundColor: "#FBF6EC",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  payLabelHead: { fontSize: 7.5, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  payRow: { flexDirection: "row", marginBottom: 2 },
  payKey: { width: 46, color: MUTED, fontSize: 8 },
  payVal: { fontSize: 8, fontWeight: 600 },
  qr: { width: 92, height: 92 },
  qrCaption: { fontSize: 6.5, color: MUTED, textAlign: "center", marginTop: 2 },

  totalsCard: { flexBasis: 244, borderWidth: 1, borderColor: BORDER, borderRadius: 12, padding: 10 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  totalLabel: { color: MUTED, fontSize: 9 },
  grand: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: GOLD,
    color: WHITE,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  grandLabel: { color: WHITE, fontSize: 8, fontWeight: 700, textTransform: "uppercase", marginRight: 8 },
  grandValue: { color: WHITE, fontSize: 12, fontWeight: 700 },
  notes: { marginTop: 12, backgroundColor: LIGHT, borderRadius: 10, padding: 10, fontSize: 8, color: MUTED },
});

/* Czech currency/date formatting (self-contained for the PDF renderer). */
function czk(n: number, currency: string) {
  return (
    new Intl.NumberFormat("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      n,
    ) + ` ${currency}`
  );
}
function czDate(d?: string | null) {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return new Intl.DateTimeFormat("cs-CZ", { day: "2-digit", month: "2-digit", year: "numeric" }).format(dt);
}
function addr(p: DocumentParty) {
  return [p.address, [p.zip, p.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
}

/* ── Reusable components ─────────────────────────────────────────────── */

function Header({ data }: { data: DocumentData }) {
  const def = DOCUMENT_DEFS[data.type];
  return (
    <View style={s.header} fixed>
      <View style={s.brandRow}>
        <View style={s.logoBox}>
          <Text style={s.logoLetter}>E</Text>
        </View>
        <View>
          <Text style={s.brandName}>ENDEVIS</Text>
          <Text style={s.brandSub}>InvoiceFlow</Text>
          <Text style={s.brandSlogan}>Premium fakturační a ERP systém</Text>
        </View>
      </View>
      <View>
        <Text style={s.docTitle}>{def.title}</Text>
        <Text style={s.docNumber}>{data.number}</Text>
        <View style={s.metaRow}>
          <Text style={s.metaLabel}>Vystaveno</Text>
          <Text style={s.metaValue}>{czDate(data.issueDate)}</Text>
        </View>
        {def.showDue && data.dueDate ? (
          <View style={s.metaRow}>
            <Text style={s.metaLabel}>Splatnost</Text>
            <Text style={s.metaValue}>{czDate(data.dueDate)}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function PartyCard({ label, party }: { label: string; party: DocumentParty }) {
  return (
    <View style={s.partyCol}>
      <Text style={s.partyLabel}>{label}</Text>
      <Text style={s.partyName}>{party.name}</Text>
      {addr(party) ? <Text style={s.partyLine}>{addr(party)}</Text> : null}
      {party.ico ? <Text style={s.partyLine}>IČO: {party.ico}</Text> : null}
      {party.dic ? <Text style={s.partyLine}>DIČ: {party.dic}</Text> : null}
      {party.email ? <Text style={s.partyLine}>{party.email}</Text> : null}
      {party.phone ? <Text style={s.partyLine}>{party.phone}</Text> : null}
    </View>
  );
}

function InfoBar({ data }: { data: DocumentData }) {
  const def = DOCUMENT_DEFS[data.type];
  const cells: { label: string; value: string }[] = [
    { label: "Číslo dokladu", value: data.number },
    { label: "Měna", value: data.currency },
  ];
  if (data.payment?.variableSymbol)
    cells.push({ label: "Variabilní symbol", value: data.payment.variableSymbol });
  if (def.showPayment) cells.push({ label: "Způsob platby", value: data.payment?.method ?? "Převod" });
  if (def.showDue && data.dueDate) cells.push({ label: "Splatnost", value: czDate(data.dueDate) });

  return (
    <View style={s.infoBar}>
      {cells.map((c, i) => (
        <View key={i} style={[s.infoCell, i === cells.length - 1 ? { borderRightWidth: 0 } : {}]}>
          <Text style={s.infoLabel}>{c.label}</Text>
          <Text style={s.infoValue}>{c.value}</Text>
        </View>
      ))}
    </View>
  );
}

function ItemsTable({ data }: { data: DocumentData }) {
  return (
    <View style={s.table}>
      {/* Header row repeats on every page */}
      <View style={s.thead} fixed>
        <Text style={[s.th, { width: COLS.desc }]}>Popis</Text>
        <Text style={[s.th, { width: COLS.qty, textAlign: "right" }]}>Množství</Text>
        <Text style={[s.th, { width: COLS.unit }]}>MJ</Text>
        <Text style={[s.th, { width: COLS.price, textAlign: "right" }]}>Cena/j.</Text>
        <Text style={[s.th, { width: COLS.vat, textAlign: "right" }]}>DPH</Text>
        <Text style={[s.th, { width: COLS.discount, textAlign: "right" }]}>Sleva</Text>
        <Text style={[s.th, { width: COLS.total, textAlign: "right" }]}>Celkem</Text>
      </View>
      {data.items.map((it, i) => (
        <View key={i} style={[s.row, i % 2 === 1 ? s.rowAlt : {}]} wrap={false}>
          <Text style={[s.td, { width: COLS.desc, fontWeight: 500 }]}>{it.description}</Text>
          <Text style={[s.td, { width: COLS.qty, textAlign: "right" }]}>{it.quantity}</Text>
          <Text style={[s.tdMuted, { width: COLS.unit }]}>{it.unit}</Text>
          <Text style={[s.td, { width: COLS.price, textAlign: "right" }]}>
            {czk(it.unitPrice, data.currency)}
          </Text>
          <Text style={[s.tdMuted, { width: COLS.vat, textAlign: "right" }]}>{it.vatRate}%</Text>
          <Text style={[s.tdMuted, { width: COLS.discount, textAlign: "right" }]}>
            {it.discount ? `${it.discount}%` : "—"}
          </Text>
          <Text style={[s.td, { width: COLS.total, textAlign: "right", fontWeight: 600 }]}>
            {czk(it.total, data.currency)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function PaymentCard({ data }: { data: DocumentData }) {
  const p = data.payment;
  if (!p) return null;
  return (
    <View style={s.payCard}>
      <View>
        <Text style={s.payLabelHead}>Platební údaje</Text>
        {p.iban ? <PayRow k="IBAN" v={p.iban} /> : null}
        {p.swift ? <PayRow k="SWIFT" v={p.swift} /> : null}
        {p.bank ? <PayRow k="Banka" v={p.bank} /> : null}
        {p.variableSymbol ? <PayRow k="VS" v={p.variableSymbol} /> : null}
        {p.dueDate ? <PayRow k="Splatnost" v={czDate(p.dueDate)} /> : null}
        <PayRow k="Částka" v={czk(data.total, data.currency)} />
      </View>
      {p.qr ? (
        <View>
          <Image src={p.qr} style={s.qr} />
          <Text style={s.qrCaption}>QR platba</Text>
        </View>
      ) : null}
    </View>
  );
}

function PayRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={s.payRow}>
      <Text style={s.payKey}>{k}</Text>
      <Text style={s.payVal}>{v}</Text>
    </View>
  );
}

function TotalsCard({ data }: { data: DocumentData }) {
  return (
    <View style={s.totalsCard}>
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>Mezisoučet</Text>
        <Text>{czk(data.subtotal, data.currency)}</Text>
      </View>
      <View style={s.totalRow}>
        <Text style={s.totalLabel}>DPH</Text>
        <Text>{czk(data.vatTotal, data.currency)}</Text>
      </View>
      {data.discountTotal ? (
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Sleva</Text>
          <Text>− {czk(data.discountTotal, data.currency)}</Text>
        </View>
      ) : null}
      {data.shipping ? (
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Doprava</Text>
          <Text>{czk(data.shipping, data.currency)}</Text>
        </View>
      ) : null}
      <View style={s.grand}>
        <Text style={s.grandLabel}>Celkem k úhradě</Text>
        <Text style={s.grandValue}>{czk(data.total, data.currency)}</Text>
      </View>
    </View>
  );
}

function Footer({ data }: { data: DocumentData }) {
  const sup = data.supplier;
  return (
    <>
      <View style={s.footer} fixed>
        <View style={s.footerCol}>
          <Text style={s.footerStrong}>{sup.name}</Text>
          <Text>{addr(sup) || "—"}</Text>
        </View>
        <View style={s.footerCol}>
          {sup.email ? <Text>{sup.email}</Text> : null}
          {sup.website ? <Text>{sup.website}</Text> : null}
          {sup.phone ? <Text>{sup.phone}</Text> : null}
        </View>
        <View style={s.footerColRight}>
          {sup.ico ? <Text>IČO: {sup.ico}</Text> : null}
          {sup.dic ? <Text>DIČ: {sup.dic}</Text> : null}
          <Text>Zapsáno v obchodním rejstříku.</Text>
        </View>
      </View>
      <Text
        style={s.pageNo}
        fixed
        render={({ pageNumber, totalPages }) =>
          `ENDEVIS InvoiceFlow  ·  Strana ${pageNumber} / ${totalPages}`
        }
      />
    </>
  );
}

/* ── Document ────────────────────────────────────────────────────────── */

export function DocumentPdf({ data }: { data: DocumentData }) {
  const def = DOCUMENT_DEFS[data.type];
  return (
    <Document title={`${def.title} ${data.number}`} author="ENDEVIS InvoiceFlow">
      <Page size="A4" style={s.page}>
        <Header data={data} />
        <Footer data={data} />

        {/* First page only: parties + info bar */}
        <View style={s.parties}>
          <PartyCard label="Dodavatel" party={data.supplier} />
          <PartyCard label="Odběratel" party={data.customer ?? { name: "—" }} />
        </View>
        <InfoBar data={data} />

        {/* Flexible area: only the items table grows / paginates */}
        <ItemsTable data={data} />

        {/* Summary block: stays together, moves to next page if needed */}
        <View style={s.summaryWrap} wrap={false}>
          {def.showPayment ? <PaymentCard data={data} /> : <View style={{ flex: 1 }} />}
          <TotalsCard data={data} />
        </View>

        {data.notes ? (
          <View style={s.notes} wrap={false}>
            <Text>{data.notes}</Text>
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
