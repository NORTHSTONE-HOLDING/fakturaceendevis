"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface CustomerFormState {
  error?: string;
  success?: boolean;
}

export async function createCustomerAction(
  _prev: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const company = String(formData.get("company") ?? "").trim();
  if (!company) return { error: "Název firmy je povinný." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const tagsRaw = String(formData.get("tags") ?? "").trim();
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const { error } = await supabase.from("customers").insert({
    company,
    contact_person: strOrNull(formData.get("contact_person")),
    ico: strOrNull(formData.get("ico")),
    dic: strOrNull(formData.get("dic")),
    email: strOrNull(formData.get("email")),
    phone: strOrNull(formData.get("phone")),
    website: strOrNull(formData.get("website")),
    address: strOrNull(formData.get("address")),
    city: strOrNull(formData.get("city")),
    zip: strOrNull(formData.get("zip")),
    notes: strOrNull(formData.get("notes")),
    tags,
    created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCustomerAction(id: string): Promise<void> {
  const supabase = await createClient();
  // Soft delete
  await supabase
    .from("customers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/customers");
}

function strOrNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length > 0 ? s : null;
}
