"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface SettingsResult {
  error?: string;
}

/**
 * Persists the uploaded company logo URL into company_settings. The logo is then
 * injected globally into every document header by the unified PDF engine.
 */
export async function saveCompanyLogoAction(
  logoUrl: string | null,
): Promise<SettingsResult> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("company_settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("company_settings")
      .update({ logo_url: logoUrl })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("company_settings")
      .insert({ logo_url: logoUrl });
    if (error) return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/invoices", "layout");
  return {};
}
