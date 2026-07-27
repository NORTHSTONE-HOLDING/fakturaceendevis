import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a numeric amount as a localized currency string.
 * Defaults to CZK (the primary market for ENDEVIS InvoiceFlow).
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency = "CZK",
  locale = "cs-CZ",
): string {
  const value = typeof amount === "number" && !Number.isNaN(amount) ? amount : 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(
  date: string | Date | null | undefined,
  locale = "cs-CZ",
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export function formatNumber(value: number | null | undefined, locale = "cs-CZ") {
  const v = typeof value === "number" && !Number.isNaN(value) ? value : 0;
  return new Intl.NumberFormat(locale).format(v);
}

/** Compose initials from a name for avatars. */
export function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}
