import type {
  AdditionalWorkStatus,
  DefectPriority,
  DefectStatus,
  ProjectStage,
  ProjectStatus,
} from "@/types/database";

/** Ordered project lifecycle pipeline (Lead → … → Archive). */
export const PROJECT_STAGES: { value: ProjectStage; label: string }[] = [
  { value: "lead", label: "Poptávka" },
  { value: "inquiry", label: "Dotaz" },
  { value: "site_visit", label: "Obhlídka" },
  { value: "budget", label: "Rozpočet" },
  { value: "quotation", label: "Nabídka" },
  { value: "approval", label: "Schválení" },
  { value: "started", label: "Zahájení" },
  { value: "diary", label: "Deník" },
  { value: "warehouse", label: "Sklad" },
  { value: "delivery_notes", label: "Dodací listy" },
  { value: "advance_invoices", label: "Zálohy" },
  { value: "additional_work", label: "Vícepráce" },
  { value: "interim_handover", label: "Dílčí předání" },
  { value: "final_handover", label: "Finální předání" },
  { value: "final_invoice", label: "Konečná faktura" },
  { value: "warranty", label: "Záruka" },
  { value: "archived", label: "Archiv" },
];

export const PROJECT_STAGE_LABELS: Record<ProjectStage, string> =
  Object.fromEntries(PROJECT_STAGES.map((s) => [s.value, s.label])) as Record<
    ProjectStage,
    string
  >;

export function nextStage(stage: ProjectStage): ProjectStage | null {
  const i = PROJECT_STAGES.findIndex((s) => s.value === stage);
  return i >= 0 && i < PROJECT_STAGES.length - 1
    ? PROJECT_STAGES[i + 1].value
    : null;
}

export const DEFECT_STATUS_LABELS: Record<DefectStatus, string> = {
  open: "Otevřená",
  in_progress: "Řeší se",
  completed: "Vyřešená",
  rejected: "Zamítnutá",
};

export const DEFECT_STATUS_VARIANT: Record<
  DefectStatus,
  "secondary" | "warning" | "success" | "destructive"
> = {
  open: "secondary",
  in_progress: "warning",
  completed: "success",
  rejected: "destructive",
};

export const ADDITIONAL_WORK_STATUS_LABELS: Record<AdditionalWorkStatus, string> = {
  proposed: "Navrženo",
  approved: "Schváleno",
  rejected: "Zamítnuto",
};

export const ADDITIONAL_WORK_STATUS_VARIANT: Record<
  AdditionalWorkStatus,
  "secondary" | "success" | "destructive"
> = {
  proposed: "secondary",
  approved: "success",
  rejected: "destructive",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Plánováno",
  active: "Probíhá",
  on_hold: "Pozastaveno",
  completed: "Dokončeno",
  archived: "Archivováno",
};

export const PROJECT_STATUS_VARIANT: Record<
  ProjectStatus,
  "default" | "secondary" | "success" | "warning" | "outline"
> = {
  planned: "secondary",
  active: "default",
  on_hold: "warning",
  completed: "success",
  archived: "outline",
};

export const DEFECT_PRIORITY_LABELS: Record<DefectPriority, string> = {
  low: "Nízká",
  medium: "Střední",
  high: "Vysoká",
  critical: "Kritická",
};

export const DEFECT_PRIORITY_VARIANT: Record<
  DefectPriority,
  "secondary" | "default" | "warning" | "destructive"
> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  critical: "destructive",
};

export const COST_CATEGORIES = [
  { value: "material", label: "Materiál" },
  { value: "labor", label: "Práce" },
  { value: "transport", label: "Doprava" },
  { value: "rental", label: "Pronájem" },
  { value: "other", label: "Ostatní" },
] as const;

export const COST_CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  COST_CATEGORIES.map((c) => [c.value, c.label]),
);
