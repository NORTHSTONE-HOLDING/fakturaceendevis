import type { DefectPriority, ProjectStatus } from "@/types/database";

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
