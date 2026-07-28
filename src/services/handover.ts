import { createClient } from "@/lib/supabase/server";
import type {
  CompanySettings,
  Customer,
  HandoverProtocol,
  Project,
} from "@/types/database";

export interface HandoverDetail {
  handover: HandoverProtocol;
  project: Project | null;
  customer: Customer | null;
  company: CompanySettings | null;
}

export async function getHandoverForPdf(
  id: string,
): Promise<HandoverDetail | null> {
  const supabase = await createClient();

  const { data: handover } = await supabase
    .from("handover_protocols")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!handover) return null;

  const [project, customer, { data: company }] = await Promise.all([
    supabase.from("projects").select("*").eq("id", handover.project_id).maybeSingle(),
    handover.customer_id
      ? supabase.from("customers").select("*").eq("id", handover.customer_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("company_settings").select("*").limit(1).maybeSingle(),
  ]);

  return {
    handover,
    project: (project.data as Project | null) ?? null,
    customer: (customer.data as Customer | null) ?? null,
    company: company ?? null,
  };
}
