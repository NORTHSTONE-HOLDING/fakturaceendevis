"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";

interface Rate {
  code: string;
  currency: string;
  amount: number;
  rate: number;
}

export function ExchangeRates() {
  const [rates, setRates] = useState<Rate[] | null>(null);
  const [date, setDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/rates")
      .then((r) => r.json())
      .then((d: { rates?: Rate[]; date?: string; error?: string }) => {
        if (!active) return;
        if (d.error) setError(d.error);
        else {
          setRates(d.rates ?? []);
          setDate(d.date ?? "");
        }
      })
      .catch(() => active && setError("Nepodařilo se načíst kurzy."));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      {error ? (
        <p className="text-sm text-muted-foreground">{error}</p>
      ) : !rates ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Načítám kurzy ČNB…
        </p>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {rates.map((r) => (
              <div key={r.code} className="rounded-lg border p-3">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" /> {r.code}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums">
                  {r.rate.toFixed(3)} Kč
                </p>
                <p className="text-[11px] text-muted-foreground">
                  za {r.amount} {r.code}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Kurzovní lístek ČNB · {date}
          </p>
        </div>
      )}
    </div>
  );
}
