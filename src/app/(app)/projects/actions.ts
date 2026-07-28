"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { nextStage } from "@/lib/projects";
import type { DefectPriority, DefectStatus, ProjectStage } from "@/types/database";

export interface ActionResult {
  error?: string;
  id?: string;
}

async function nextNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  type: "PRJ" | "HOV",
): Promise<string | null> {
  const { data } = await supabase.rpc("next_document_number", {
    p_doc_type: type,
  });
  return data ?? null;
}

export async function createProjectAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Název projektu je povinný." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const number = await nextNumber(supabase, "PRJ");
  if (!number) return { error: "Nepodařilo se vygenerovat číslo projektu." };

  const { data, error } = await supabase
    .from("projects")
    .insert({
      number,
      name,
      customer_id: strOrNull(formData.get("customer_id")),
      address: strOrNull(formData.get("address")),
      budget_amount: num(formData.get("budget_amount")),
      manager_id: user?.id ?? null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Chyba." };
  revalidatePath("/projects");
  return { id: data.id };
}

/** Approve a quotation and spin up a full construction project from it. */
export async function startProjectFromQuotationAction(
  quotationId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: quotation } = await supabase
    .from("quotations")
    .select("*, customers(company)")
    .eq("id", quotationId)
    .maybeSingle();
  if (!quotation) return { error: "Nabídka nenalezena." };

  const number = await nextNumber(supabase, "PRJ");
  if (!number) return { error: "Nepodařilo se vygenerovat číslo projektu." };

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      number,
      name: `Projekt dle nabídky ${quotation.number}`,
      customer_id: quotation.customer_id,
      quotation_id: quotation.id,
      budget_amount: Number(quotation.total),
      status: "active",
      manager_id: user?.id ?? null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !project) return { error: error?.message ?? "Chyba." };

  await supabase
    .from("quotations")
    .update({ status: "converted" })
    .eq("id", quotationId);

  revalidatePath("/projects");
  revalidatePath("/quotations");
  return { id: project.id };
}

export async function addDiaryEntryAction(
  projectId: string,
  input: {
    entry_date: string;
    weather: string | null;
    temperature: number | null;
    wind: string | null;
    rain: boolean;
    workers_count: number;
    working_hours: number;
    activities: string | null;
    materials_used: string | null;
    problems: string | null;
    notes: string | null;
    ai_summary: string | null;
  },
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("construction_diary_entries").insert({
    project_id: projectId,
    ...input,
    created_by: user?.id ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return {};
}

export async function addDefectAction(
  projectId: string,
  input: {
    description: string;
    priority: DefectPriority;
    responsible: string | null;
    deadline: string | null;
  },
): Promise<ActionResult> {
  if (!input.description.trim()) return { error: "Popis vady je povinný." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("defects").insert({
    project_id: projectId,
    description: input.description,
    priority: input.priority,
    responsible: input.responsible,
    deadline: input.deadline,
    created_by: user?.id ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return {};
}

export async function setDefectStatusAction(
  defectId: string,
  projectId: string,
  status: DefectStatus,
): Promise<void> {
  const supabase = await createClient();
  const completed = status === "completed";
  await supabase
    .from("defects")
    .update({
      status,
      completed,
      completion_date: completed ? new Date().toISOString().slice(0, 10) : null,
    })
    .eq("id", defectId);
  revalidatePath(`/projects/${projectId}`);
}

/** Advance the project one step along the lifecycle pipeline. */
export async function advanceStageAction(
  projectId: string,
  current: ProjectStage,
): Promise<ActionResult> {
  const next = nextStage(current);
  if (!next) return { error: "Projekt je již v poslední fázi." };
  const supabase = await createClient();
  const patch: { stage: ProjectStage; status?: "completed" | "archived" } = {
    stage: next,
  };
  if (next === "archived") patch.status = "archived";
  else if (next === "final_invoice" || next === "warranty") patch.status = "completed";
  const { error } = await supabase.from("projects").update(patch).eq("id", projectId);
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  return {};
}

export async function addAdditionalWorkAction(
  projectId: string,
  input: { description: string; amount: number; vat_rate: number },
): Promise<ActionResult> {
  if (!input.description.trim()) return { error: "Popis víceprací je povinný." };
  if (!(input.amount > 0)) return { error: "Zadejte částku." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("additional_works").insert({
    project_id: projectId,
    description: input.description,
    amount: input.amount,
    vat_rate: input.vat_rate,
    created_by: user?.id ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return {};
}

/** Approve additional work — instantly raises the project budget. */
export async function decideAdditionalWorkAction(
  id: string,
  projectId: string,
  decision: "approved" | "rejected",
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: aw } = await supabase
    .from("additional_works")
    .select("amount, status")
    .eq("id", id)
    .maybeSingle();
  if (!aw) return { error: "Vícepráce nenalezeny." };

  const { error } = await supabase
    .from("additional_works")
    .update({
      status: decision,
      approved_at: decision === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  // On approval, add the amount to the project budget (only if it was not already approved).
  if (decision === "approved" && aw.status !== "approved") {
    const { data: project } = await supabase
      .from("projects")
      .select("budget_amount")
      .eq("id", projectId)
      .maybeSingle();
    if (project) {
      await supabase
        .from("projects")
        .update({ budget_amount: Number(project.budget_amount) + Number(aw.amount) })
        .eq("id", projectId);
    }
  }

  revalidatePath(`/projects/${projectId}`);
  return {};
}

export async function addCostAction(
  projectId: string,
  input: { category: string; amount: number; note: string | null },
): Promise<ActionResult> {
  if (!(input.amount > 0)) return { error: "Zadejte částku." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("project_costs").insert({
    project_id: projectId,
    category: input.category,
    amount: input.amount,
    note: input.note,
    created_by: user?.id ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath(`/projects/${projectId}`);
  return {};
}

function num(v: FormDataEntryValue | null, fallback = 0): number {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}
function strOrNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length > 0 ? s : null;
}
