"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { nextStage } from "@/lib/projects";
import type {
  DefectPriority,
  DefectStatus,
  HandoverType,
  ProjectStage,
} from "@/types/database";

function czk(n: number): string {
  return (
    new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(n) + " Kč"
  );
}

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

/** Create a handover protocol with an auto-compiled project summary snapshot. */
export async function createHandoverAction(
  projectId: string,
  input: {
    protocol_type: HandoverType;
    scope: string | null;
    completed_work: string | null;
    equipment_delivered: string | null;
    keys_handed: string | null;
    meters: string | null;
    responsible_person: string | null;
    notes: string | null;
  },
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (!project) return { error: "Projekt nenalezen." };

  const [{ data: invoices }, { data: defects }, { data: aw }] = await Promise.all([
    supabase
      .from("invoices")
      .select("total, status, is_advance")
      .eq("project_id", projectId)
      .is("deleted_at", null),
    supabase.from("defects").select("status").eq("project_id", projectId),
    supabase
      .from("additional_works")
      .select("amount, status")
      .eq("project_id", projectId)
      .is("deleted_at", null),
  ]);

  const inv = invoices ?? [];
  const revenue = inv
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.total), 0);
  const outstanding = inv
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + Number(i.total), 0);
  const advances = inv
    .filter((i) => i.is_advance && i.status === "paid")
    .reduce((s, i) => s + Number(i.total), 0);
  const openDefects = (defects ?? []).filter(
    (d) => d.status !== "completed" && d.status !== "rejected",
  ).length;
  const approvedAw = (aw ?? [])
    .filter((a) => a.status === "approved")
    .reduce((s, a) => s + Number(a.amount), 0);

  const summary = [
    { label: "Číslo projektu", value: project.number },
    { label: "Rozpočet", value: czk(Number(project.budget_amount)) },
    { label: "Uhrazené faktury", value: czk(revenue) },
    { label: "Neuhrazeno", value: czk(outstanding) },
    { label: "Uhrazené zálohy", value: czk(advances) },
    { label: "Schválené vícepráce", value: czk(approvedAw) },
    { label: "Počet faktur", value: String(inv.length) },
    { label: "Otevřené vady", value: String(openDefects) },
  ];

  const number = await nextNumber(supabase, "HOV");
  if (!number) return { error: "Nepodařilo se vygenerovat číslo protokolu." };

  const { data, error } = await supabase
    .from("handover_protocols")
    .insert({
      number,
      project_id: projectId,
      customer_id: project.customer_id,
      address: project.address,
      protocol_type: input.protocol_type,
      responsible_person: input.responsible_person,
      completed_work: input.completed_work,
      equipment_delivered: input.equipment_delivered,
      keys_handed: input.keys_handed,
      meters: input.meters,
      notes: input.notes,
      summary,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Chyba." };
  revalidatePath(`/projects/${projectId}`);
  return { id: data.id };
}

/**
 * Sign a handover protocol. A signed *final* handover closes the project:
 * status → completed, stage → warranty, and warranty timers are set.
 */
export async function signHandoverAction(
  handoverId: string,
  projectId: string,
  input: { customerName: string; contractorName: string },
): Promise<ActionResult> {
  if (!input.customerName.trim() || !input.contractorName.trim()) {
    return { error: "Vyplňte jméno objednatele i zhotovitele." };
  }
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: handover } = await supabase
    .from("handover_protocols")
    .select("protocol_type")
    .eq("id", handoverId)
    .maybeSingle();
  if (!handover) return { error: "Protokol nenalezen." };

  const { error } = await supabase
    .from("handover_protocols")
    .update({
      status: "signed",
      customer_signature: input.customerName,
      contractor_signature: input.contractorName,
      customer_signed_at: now,
      contractor_signed_at: now,
    })
    .eq("id", handoverId);
  if (error) return { error: error.message };

  // Final handover = legal project closure → completion + warranty timers.
  if (handover.protocol_type === "final") {
    const { data: project } = await supabase
      .from("projects")
      .select("warranty_months")
      .eq("id", projectId)
      .maybeSingle();
    const months = project?.warranty_months ?? 24;
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    await supabase
      .from("projects")
      .update({
        status: "completed",
        stage: "warranty",
        end_date: start.toISOString().slice(0, 10),
        warranty_start_date: start.toISOString().slice(0, 10),
        warranty_end_date: end.toISOString().slice(0, 10),
      })
      .eq("id", projectId);
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
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
