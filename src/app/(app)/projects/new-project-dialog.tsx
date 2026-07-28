"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { createProjectAction, type ActionResult } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Vytvořit projekt
    </Button>
  );
}

export function NewProjectDialog({
  customers,
}: {
  customers: { id: string; company: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [state, formAction] = useFormState<ActionResult, FormData>(
    createProjectAction,
    {},
  );

  useEffect(() => {
    if (state.id) {
      toast.success("Projekt vytvořen");
      setOpen(false);
      router.push(`/projects/${state.id}`);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nový projekt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nový projekt</DialogTitle>
          <DialogDescription>
            Vytvořte stavební projekt. Deník, rozpočet, vady a doklady patří pod
            projekt.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="customer_id" value={customerId} />
          <div className="space-y-2">
            <Label htmlFor="name">Název projektu *</Label>
            <Input id="name" name="name" required placeholder="Rekonstrukce RD Praha" />
          </div>
          <div className="space-y-2">
            <Label>Zákazník</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Vyberte zákazníka…" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresa stavby</Label>
            <Input id="address" name="address" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget_amount">Rozpočet (bez DPH)</Label>
            <Input
              id="budget_amount"
              name="budget_amount"
              type="number"
              step="0.01"
              defaultValue="0"
            />
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
