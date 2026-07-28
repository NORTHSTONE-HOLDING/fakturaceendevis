import type { CustomerEntityType } from "@/types/database";

export const CUSTOMER_ENTITY_TYPES: { value: CustomerEntityType; label: string }[] = [
  { value: "firma", label: "Firma" },
  { value: "osvc", label: "OSVČ" },
  { value: "soukroma_osoba", label: "Soukromá osoba" },
  { value: "dodavatel", label: "Dodavatel" },
  { value: "partner", label: "Partner" },
  { value: "investor", label: "Investor" },
  { value: "developer", label: "Developer" },
  { value: "obec_mesto", label: "Obec / Město" },
  { value: "organizace", label: "Organizace" },
];

export const CUSTOMER_ENTITY_LABELS: Record<CustomerEntityType, string> =
  Object.fromEntries(
    CUSTOMER_ENTITY_TYPES.map((t) => [t.value, t.label]),
  ) as Record<CustomerEntityType, string>;
