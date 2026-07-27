import { notFound } from "next/navigation";

import { DocumentTemplate } from "@/components/documents/document-template";
import { PrintTrigger } from "@/components/documents/print-trigger";
import { getInvoiceById } from "@/services/invoices";
import { invoiceToDocument } from "@/lib/document-mappers";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getInvoiceById(id);
  if (!detail) notFound();

  const document = await invoiceToDocument(detail);

  return (
    <>
      <PrintTrigger />
      <DocumentTemplate data={document} />
    </>
  );
}
