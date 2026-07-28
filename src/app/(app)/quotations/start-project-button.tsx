"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { HardHat, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { startProjectFromQuotationAction } from "../projects/actions";
import { Button } from "@/components/ui/button";

export function StartProjectButton({ quotationId }: { quotationId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function start() {
    startTransition(async () => {
      const result = await startProjectFromQuotationAction(quotationId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Projekt zahájen");
      router.push(`/projects/${result.id}`);
    });
  }

  return (
    <Button size="sm" variant="outline" onClick={start} disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <HardHat className="h-4 w-4" />
      )}
      Zahájit projekt
    </Button>
  );
}
