"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Send, Printer, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { updateInvoiceStatusAction } from "../actions";
import { Button } from "@/components/ui/button";
import type { InvoiceStatus } from "@/types/database";

export function InvoiceActions({
  id,
  status,
}: {
  id: string;
  status: InvoiceStatus;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function setStatus(next: InvoiceStatus, label: string) {
    startTransition(async () => {
      await updateInvoiceStatusAction(id, next);
      toast.success(label);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        onClick={() => window.open(`/invoices/${id}/pdf`, "_blank")}
      >
        <Printer className="h-4 w-4" /> PDF / Tisk
      </Button>
      {status !== "sent" && status !== "paid" && (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => setStatus("sent", "Faktura označena jako odeslaná")}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Označit jako odeslané
        </Button>
      )}
      {status !== "paid" && (
        <Button
          disabled={pending}
          onClick={() => setStatus("paid", "Faktura označena jako zaplacená")}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Označit jako zaplacené
        </Button>
      )}
      {status !== "cancelled" && status !== "paid" && (
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-destructive"
          disabled={pending}
          onClick={() => setStatus("cancelled", "Faktura stornována")}
        >
          <XCircle className="h-4 w-4" /> Stornovat
        </Button>
      )}
    </div>
  );
}
