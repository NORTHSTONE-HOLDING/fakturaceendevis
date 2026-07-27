"use client";

import { useEffect, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  createCustomerAction,
  type CustomerFormState,
} from "./actions";
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
import { Textarea } from "@/components/ui/textarea";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Uložit zákazníka
    </Button>
  );
}

export function CustomerFormDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState<CustomerFormState, FormData>(
    createCustomerAction,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success("Zákazník vytvořen");
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Nový zákazník
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nový zákazník</DialogTitle>
          <DialogDescription>
            Přidejte firmu do své databáze zákazníků.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="company">Firma *</Label>
              <Input id="company" name="company" required placeholder="Acme s.r.o." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_person">Kontaktní osoba</Label>
              <Input id="contact_person" name="contact_person" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ico">IČO</Label>
              <Input id="ico" name="ico" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dic">DIČ</Label>
              <Input id="dic" name="dic" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Web</Label>
              <Input id="website" name="website" placeholder="https://" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Adresa</Label>
              <Input id="address" name="address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Město</Label>
              <Input id="city" name="city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">PSČ</Label>
              <Input id="zip" name="zip" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tags">Štítky (oddělené čárkou)</Label>
              <Input id="tags" name="tags" placeholder="VIP, B2B" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Poznámky</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
