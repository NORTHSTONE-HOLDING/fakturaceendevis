import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";

import { createClient } from "@/lib/supabase/server";
import { getInvoiceById } from "@/services/invoices";
import { invoiceToDocument } from "@/lib/document-mappers";
import { DocumentPdf } from "@/components/pdf/document-pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const detail = await getInvoiceById(id);
  if (!detail) return new Response("Not found", { status: 404 });

  const document = await invoiceToDocument(detail);
  const element = createElement(DocumentPdf, {
    data: document,
  }) as unknown as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${detail.invoice.number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
