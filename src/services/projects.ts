import { createClient } from "@/lib/supabase/server";
import type {
  Customer,
  Defect,
  DiaryEntry,
  HandoverProtocol,
  Invoice,
  Project,
  ProjectCost,
} from "@/types/database";

export interface ProjectFinancials {
  budget: number;
  costsByCategory: Record<string, number>;
  actualCost: number;
  revenue: number;
  advancesPaid: number;
  profit: number;
  margin: number;
  budgetUsedPct: number;
}

export interface ProjectDetail {
  project: Project;
  customer: Customer | null;
  diary: DiaryEntry[];
  defects: Defect[];
  costs: ProjectCost[];
  invoices: Pick<
    Invoice,
    "id" | "number" | "total" | "status" | "issue_date" | "is_advance"
  >[];
  handovers: HandoverProtocol[];
  financials: ProjectFinancials;
}

export async function getProjects(): Promise<
  (Project & { customers: { company: string } | null })[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*, customers(company)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []) as (Project & { customers: { company: string } | null })[];
}

export async function getProjectById(id: string): Promise<ProjectDetail | null> {
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!project) return null;

  const [
    customer,
    { data: diary },
    { data: defects },
    { data: costs },
    { data: invoices },
    { data: handovers },
  ] = await Promise.all([
    project.customer_id
      ? supabase.from("customers").select("*").eq("id", project.customer_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("construction_diary_entries")
      .select("*")
      .eq("project_id", id)
      .order("entry_date", { ascending: false }),
    supabase
      .from("defects")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("project_costs").select("*").eq("project_id", id),
    supabase
      .from("invoices")
      .select("id, number, total, status, issue_date, is_advance")
      .eq("project_id", id)
      .is("deleted_at", null)
      .order("issue_date", { ascending: false }),
    supabase
      .from("handover_protocols")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const costList = costs ?? [];
  const invList = invoices ?? [];

  const costsByCategory: Record<string, number> = {};
  for (const c of costList) {
    costsByCategory[c.category] =
      (costsByCategory[c.category] ?? 0) + Number(c.amount);
  }
  const actualCost = costList.reduce((s, c) => s + Number(c.amount), 0);
  const revenue = invList
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + Number(i.total), 0);
  const advancesPaid = invList
    .filter((i) => i.is_advance && i.status === "paid")
    .reduce((s, i) => s + Number(i.total), 0);
  const budget = Number(project.budget_amount);
  const profit = revenue - actualCost;

  return {
    project,
    customer: (customer.data as Customer | null) ?? null,
    diary: diary ?? [],
    defects: defects ?? [],
    costs: costList,
    invoices: invList,
    handovers: handovers ?? [],
    financials: {
      budget,
      costsByCategory,
      actualCost,
      revenue,
      advancesPaid,
      profit,
      margin: revenue > 0 ? (profit / revenue) * 100 : 0,
      budgetUsedPct: budget > 0 ? (actualCost / budget) * 100 : 0,
    },
  };
}
