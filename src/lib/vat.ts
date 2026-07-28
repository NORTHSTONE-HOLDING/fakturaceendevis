import type { VatMode } from "@/types/database";

export const VAT_MODES: { value: VatMode; label: string }[] = [
  { value: "standard", label: "Standardní DPH" },
  { value: "reverse_charge", label: "Přenesená daňová povinnost" },
  { value: "oss", label: "OSS (One Stop Shop)" },
  { value: "eu_vat", label: "EU DPH" },
  { value: "export", label: "Vývoz (mimo EU)" },
];

export const VAT_MODE_LABELS: Record<VatMode, string> = Object.fromEntries(
  VAT_MODES.map((m) => [m.value, m.label]),
) as Record<VatMode, string>;

/** Whether the mode forces 0% VAT with a statutory note. */
export function isZeroRated(mode: VatMode): boolean {
  return mode !== "standard";
}

/** Statutory note text required on the document for each special VAT mode. */
export function statutoryVatNote(mode: VatMode): string | null {
  switch (mode) {
    case "reverse_charge":
      return "Daň odvede zákazník (Czech Reverse Charge / přenesená daňová povinnost).";
    case "oss":
      return "Režim One Stop Shop (OSS) – DPH odvedeno v zemi spotřeby.";
    case "eu_vat":
      return "Dodání do jiného členského státu EU – osvobozeno od DPH dle § 64 ZDPH.";
    case "export":
      return "Vývoz zboží mimo EU – osvobozeno od DPH dle § 66 ZDPH.";
    default:
      return null;
  }
}
