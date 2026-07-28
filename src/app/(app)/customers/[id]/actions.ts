"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export interface ContactResult {
  error?: string;
}

export async function addContactAction(
  customerId: string,
  input: {
    last_name: string;
    first_name: string | null;
    position: string | null;
    phone: string | null;
    email: string | null;
    is_primary: boolean;
  },
): Promise<ContactResult> {
  if (!input.last_name.trim()) return { error: "Příjmení je povinné." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("customer_contacts").insert({
    customer_id: customerId,
    last_name: input.last_name,
    first_name: input.first_name,
    position: input.position,
    phone: input.phone,
    email: input.email,
    is_primary: input.is_primary,
    created_by: user?.id ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath(`/customers/${customerId}`);
  return {};
}

export async function deleteContactAction(
  contactId: string,
  customerId: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("customer_contacts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", contactId);
  revalidatePath(`/customers/${customerId}`);
}

export async function saveCustomerNotesAction(
  customerId: string,
  notes: string,
): Promise<ContactResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({ notes })
    .eq("id", customerId);
  if (error) return { error: error.message };
  revalidatePath(`/customers/${customerId}`);
  return {};
}
