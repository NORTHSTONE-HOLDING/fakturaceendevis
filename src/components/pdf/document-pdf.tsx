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

import {
  DOCUMENT_DEFS,
  type DocumentData,
  type DocumentParty,
  type DocumentProtocol,
} from "@/lib/documents";

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

/* ── Absolute print geometry — everything in millimetres ──────────────────
 * A4 = 210 × 297 mm. All widths/heights/margins/spacing are expressed in mm
 * (converted to PDF points). No percentages: print layout is fully absolute.
 * Only the items table may grow in height.
 */
const MM = 2.83465; // 1 mm in PDF points
const mm = (v: number) => v * MM;

const PAGE_W = 210;
const MARGIN_MM = 8; // 8 mm on every side
const MARGIN = mm(MARGIN_MM);
const HEADER_H = mm(24); // fixed header band
const FOOTER_H = mm(18); // fixed footer band
const CONTENT_MM = PAGE_W - MARGIN_MM * 2; // 194 mm printable width

/* Fixed item-table column widths (mm) — sum to the 194 mm content width. */
const COLS = {
  desc: mm(73),
  qty: mm(18),
  unit: mm(12),
  price: mm(29),
  vat: mm(14),
  discount: mm(14),
  total: mm(34),
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
  /* Header (fixed, repeats every page) — absolute mm band */
  header: {
    position: "absolute",
    top: MARGIN,
    left: MARGIN,
    width: mm(CONTENT_MM),
    height: HEADER_H,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    paddingBottom: mm(3),
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: mm(3.5) },
  logoBox: {
    width: mm(15),
    height: mm(15),
    borderRadius: mm(3.5),
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: { color: GRAPHITE, fontSize: 24, fontWeight: 700 },
  /* Uploaded logo — fixed max box, aspect ratio preserved (never stretched). */
  logoImg: { height: mm(15), maxWidth: mm(50), objectFit: "contain" },
  brandName: { fontSize: 15, fontWeight: 700, letterSpacing: 0.3 },
  brandSub: { fontSize: 9, fontWeight: 600, color: GOLD },
  brandSlogan: { fontSize: 7.5, color: MUTED, marginTop: mm(0.4) },
  docTitle: { fontSize: 20, fontWeight: 700, textTransform: "uppercase", textAlign: "right", lineHeight: 1 },
  docNumber: { fontSize: 10, fontWeight: 600, color: GOLD, textAlign: "right", marginTop: mm(1.8) },
  metaRow: { flexDirection: "row", justifyContent: "flex-end", gap: mm(3.5), marginTop: mm(0.8) },
  metaLabel: { color: MUTED },
  metaValue: { fontWeight: 600, width: mm(22), textAlign: "right" },

  /* Footer (fixed, repeats every page) — three fixed mm columns */
  footer: {
    position: "absolute",
    bottom: MARGIN,
    left: MARGIN,
    width: mm(CONTENT_MM),
    height: FOOTER_H,
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: mm(2),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerCol: { width: mm(62), fontSize: 7.5, color: MUTED },
  footerColRight: { width: mm(62), fontSize: 7.5, color: MUTED, textAlign: "right" },
  footerStrong: { color: GRAPHITE, fontWeight: 700, marginBottom: mm(0.7) },
  pageNo: {
    position: "absolute",
    bottom: MARGIN - mm(3.5),
    left: MARGIN,
    width: mm(CONTENT_MM),
    textAlign: "center",
    fontSize: 7,
    color: MUTED,
  },

  /* Parties — borderless, thin divider above, two fixed 88 mm columns */
  parties: {
    flexDirection: "row",
    gap: mm(10),
    borderTopWidth: 0.5,
    borderTopColor: BORDER,
    paddingTop: mm(5),
    marginBottom: mm(6),
  },
  partyCol: { width: mm(92) },
  partyLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    color: GOLD,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: mm(1.8),
  },
  partyName: { fontSize: 12, fontWeight: 600, marginBottom: mm(1.5) },
  partyLine: { fontSize: 8.5, color: MUTED, marginBottom: mm(0.6) },

  /* Info bar (single fixed-height row = 14 mm) */
  infoBar: {
    flexDirection: "row",
    borderWidth: 0.5,
    borderColor: BORDER,
    borderRadius: mm(3),
    overflow: "hidden",
    marginBottom: mm(6),
    height: mm(14),
  },
  infoCell: {
    flexGrow: 1,
    flexBasis: 0,
    backgroundColor: LIGHT,
    paddingHorizontal: mm(3),
    justifyContent: "center",
    borderRightWidth: 0.5,
    borderRightColor: BORDER,
  },
  infoLabel: { fontSize: 6.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4 },
  infoValue: { fontSize: 8.5, fontWeight: 600 },

  /* Items table — the only element with dynamic height */
  table: { width: mm(CONTENT_MM), borderWidth: 0.5, borderColor: BORDER, borderRadius: mm(3), overflow: "hidden" },
  thead: { flexDirection: "row", backgroundColor: GRAPHITE },
  th: { color: WHITE, fontSize: 8, fontWeight: 700, paddingVertical: mm(2), paddingHorizontal: mm(2) },
  row: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: BORDER },
  rowAlt: { backgroundColor: "#FCFCFC" },
  td: { fontSize: 8.5, paddingVertical: mm(2), paddingHorizontal: mm(2) },
  tdMuted: { fontSize: 8.5, color: MUTED, paddingVertical: mm(2), paddingHorizontal: mm(2) },

  /* Summary + payment (kept together, below table) — fixed mm widths */
  summaryWrap: { flexDirection: "row", gap: mm(6), marginTop: mm(6) },
  payCard: {
    width: mm(110),
    borderWidth: 0.5,
    borderColor: GOLD,
    borderRadius: mm(3),
    backgroundColor: "#FBF6EC",
    padding: mm(3.5),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  payLabelHead: { fontSize: 7.5, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: mm(1.5) },
  payRow: { flexDirection: "row", marginBottom: mm(0.7) },
  payKey: { width: mm(16), color: MUTED, fontSize: 8 },
  payVal: { fontSize: 8, fontWeight: 600 },
  qr: { width: mm(26), height: mm(26) },
  qrCaption: { fontSize: 6.5, color: MUTED, textAlign: "center", marginTop: mm(0.7) },

  totalsCard: { width: mm(78), borderWidth: 0.5, borderColor: BORDER, borderRadius: mm(3), padding: mm(3.5) },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: mm(1) },
  totalLabel: { color: MUTED, fontSize: 9 },
  grand: {
    marginTop: mm(2),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: GOLD,
    color: WHITE,
    borderRadius: mm(2),
    paddingVertical: mm(2.5),
    paddingHorizontal: mm(3),
  },
  grandLabel: { color: WHITE, fontSize: 8, fontWeight: 700, textTransform: "uppercase", marginRight: mm(3) },
  grandValue: { color: WHITE, fontSize: 12, fontWeight: 700 },
  notes: { marginTop: mm(6), backgroundColor: LIGHT, borderRadius: mm(2.5), padding: mm(3.5), fontSize: 8, color: MUTED },
  statutory: {
    marginTop: mm(6),
    borderWidth: 0.75,
    borderColor: GOLD,
    borderRadius: mm(2.5),
    backgroundColor: "#FBF6EC",
    padding: mm(3.5),
    fontSize: 8.5,
    fontWeight: 600,
    color: GRAPHITE,
  },

  /* Handover protocol body */
  section: { marginTop: mm(6) },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    color: GOLD,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: mm(2),
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 0.5,
    borderColor: BORDER,
    borderRadius: mm(3),
    overflow: "hidden",
  },
  summaryCell: {
    width: mm(CONTENT_MM / 2 - 0.5),
    paddingVertical: mm(2.5),
    paddingHorizontal: mm(3.5),
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryKey: { color: MUTED, fontSize: 8.5 },
  summaryVal: { fontWeight: 600, fontSize: 8.5 },
  block: {
    borderWidth: 0.5,
    borderColor: BORDER,
    borderRadius: mm(3),
    padding: mm(3.5),
    fontSize: 8.5,
  },
  signRow: { flexDirection: "row", gap: mm(6), marginTop: mm(8) },
  signBox: { width: mm(94) },
  signLine: {
    borderTopWidth: 0.75,
    borderTopColor: GRAPHITE,
    marginTop: mm(10),
    paddingTop: mm(1.5),
  },
  signRole: { fontSize: 8, fontWeight: 700 },
  signName: { fontSize: 8.5, marginTop: mm(0.5) },
  signMeta: { fontSize: 7, color: MUTED, marginTop: mm(0.5) },
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
        {data.logoUrl ? (
          <Image src={data.logoUrl} style={s.logoImg} />
        ) : (
          <>
            <View style={s.logoBox}>
              <Text style={s.logoLetter}>E</Text>
            </View>
            <View>
              <Text style={s.brandName}>ENDEVIS</Text>
              <Text style={s.brandSub}>InvoiceFlow</Text>
              <Text style={s.brandSlogan}>Premium fakturační a ERP systém</Text>
            </View>
          </>
        )}
      </View>
      <View>
        <Text style={s.docTitle}>{data.titleOverride ?? def.title}</Text>
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

function ProtocolBody({
  protocol,
  notes,
}: {
  protocol: DocumentProtocol;
  notes?: string | null;
}) {
  return (
    <View>
      {protocol.summary.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Souhrn projektu</Text>
          <View style={s.summaryGrid}>
            {protocol.summary.map((r, i) => (
              <View key={i} style={s.summaryCell}>
                <Text style={s.summaryKey}>{r.label}</Text>
                <Text style={s.summaryVal}>{r.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {protocol.scope ? (
        <ProtocolText title="Rozsah předání" text={protocol.scope} />
      ) : null}
      {protocol.completedWork ? (
        <ProtocolText title="Předané / dokončené práce" text={protocol.completedWork} />
      ) : null}
      {protocol.equipmentDelivered ? (
        <ProtocolText title="Předané zařízení" text={protocol.equipmentDelivered} />
      ) : null}
      {protocol.meters ? (
        <ProtocolText title="Odečty měřidel" text={protocol.meters} />
      ) : null}
      {protocol.keysHanded ? (
        <ProtocolText title="Předané klíče" text={protocol.keysHanded} />
      ) : null}
      {notes ? <ProtocolText title="Poznámky" text={notes} /> : null}

      <View style={s.signRow} wrap={false}>
        <SignatureBox
          role="Zhotovitel"
          name={protocol.contractorName}
          signedAt={protocol.signedContractorAt}
        />
        <SignatureBox
          role="Objednatel"
          name={protocol.customerName}
          signedAt={protocol.signedCustomerAt}
        />
      </View>
    </View>
  );
}

function ProtocolText({ title, text }: { title: string; text: string }) {
  return (
    <View style={s.section} wrap={false}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.block}>
        <Text>{text}</Text>
      </View>
    </View>
  );
}

function SignatureBox({
  role,
  name,
  signedAt,
}: {
  role: string;
  name?: string | null;
  signedAt?: string | null;
}) {
  return (
    <View style={s.signBox}>
      <View style={s.signLine}>
        <Text style={s.signRole}>{role}</Text>
        <Text style={s.signName}>{name || "……………………………"}</Text>
        <Text style={s.signMeta}>
          {signedAt ? `Podepsáno ${czDate(signedAt)}` : "Podpis / datum"}
        </Text>
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

        {data.protocol ? (
          <ProtocolBody protocol={data.protocol} notes={data.notes} />
        ) : (
          <>
            {/* Flexible area: only the items table grows / paginates */}
            <ItemsTable data={data} />

            {/* Summary block: stays together, moves to next page if needed */}
            <View style={s.summaryWrap} wrap={false}>
              {def.showPayment ? <PaymentCard data={data} /> : <View style={{ flex: 1 }} />}
              <TotalsCard data={data} />
            </View>

            {data.statutoryNote ? (
              <View style={s.statutory} wrap={false}>
                <Text>{data.statutoryNote}</Text>
              </View>
            ) : null}

            {data.notes ? (
              <View style={s.notes} wrap={false}>
                <Text>{data.notes}</Text>
              </View>
            ) : null}
          </>
        )}
      </Page>
    </Document>
  );
}
