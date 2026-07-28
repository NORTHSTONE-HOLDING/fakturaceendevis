"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { createCustomerAction, type CustomerFormState } from "./actions";
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
  const [ico, setIco] = useState("");
  const [aresPending, setAresPending] = useState(false);
  const [state, formAction] = useFormState<CustomerFormState, FormData>(
    createCustomerAction,
    {},
  );

  const refs = {
    company: useRef<HTMLInputElement>(null),
    dic: useRef<HTMLInputElement>(null),
    address: useRef<HTMLInputElement>(null),
    city: useRef<HTMLInputElement>(null),
    zip: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    if (state.success) {
      toast.success("Zákazník vytvořen");
      setOpen(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  async function loadFromAres() {
    const clean = ico.replace(/\D/g, "");
    if (clean.length !== 8) {
      toast.error("Zadejte platné IČO (8 číslic).");
      return;
    }
    setAresPending(true);
    try {
      const res = await fetch(`/api/ares/${clean}`);
      const data = (await res.json()) as {
        company?: string;
        dic?: string;
        address?: string;
        city?: string;
        zip?: string;
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Načtení z ARES selhalo.");
        return;
      }
      if (refs.company.current) refs.company.current.value = data.company ?? "";
      if (refs.dic.current) refs.dic.current.value = data.dic ?? "";
      if (refs.address.current) refs.address.current.value = data.address ?? "";
      if (refs.city.current) refs.city.current.value = data.city ?? "";
      if (refs.zip.current) refs.zip.current.value = data.zip ?? "";
      toast.success(`Načteno z ARES: ${data.company ?? ""}`);
    } finally {
      setAresPending(false);
    }
  }

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
            Zadejte IČO a načtěte údaje automaticky z registru ARES, nebo vyplňte
            ručně.
          </DialogDescription>
        </DialogHeader>

        {/* ARES lookup */}
        <div className="flex items-end gap-2 rounded-lg border bg-muted/40 p-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="ico_ares">IČO</Label>
            <Input
              id="ico_ares"
              value={ico}
              onChange={(e) => setIco(e.target.value)}
              placeholder="27082440"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={loadFromAres}
            disabled={aresPending}
          >
            {aresPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Načíst z ARES
          </Button>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="ico" value={ico} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="company">Firma *</Label>
              <Input id="company" name="company" ref={refs.company} required placeholder="Acme s.r.o." />
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
              <Label htmlFor="dic">DIČ</Label>
              <Input id="dic" name="dic" ref={refs.dic} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="website">Web</Label>
              <Input id="website" name="website" placeholder="https://" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="address">Adresa</Label>
              <Input id="address" name="address" ref={refs.address} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Město</Label>
              <Input id="city" name="city" ref={refs.city} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">PSČ</Label>
              <Input id="zip" name="zip" ref={refs.zip} />
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
