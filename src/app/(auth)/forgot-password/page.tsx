"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { requestPasswordResetAction, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      Odeslat odkaz pro obnovení
    </Button>
  );
}

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState<AuthState, FormData>(
    requestPasswordResetAction,
    {},
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Obnovení hesla
        </h2>
        <p className="text-sm text-muted-foreground">
          Zadejte svůj e-mail a zašleme vám bezpečný odkaz pro obnovení.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
        </div>

        {state.error && (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}
        {state.success && (
          <div className="flex items-start gap-2 rounded-md bg-[hsl(var(--success)/0.12)] p-3 text-sm text-[hsl(var(--success))]">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{state.success}</span>
          </div>
        )}

        <SubmitButton />
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Zpět na přihlášení
        </Link>
      </p>
    </div>
  );
}
