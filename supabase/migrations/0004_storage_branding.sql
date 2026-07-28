-- ============================================================================
-- ENDEVIS InvoiceFlow — Company branding storage (logo uploads)
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

-- Public read (so the PDF engine and browser can load the logo by URL).
drop policy if exists "branding_public_read" on storage.objects;
create policy "branding_public_read" on storage.objects
  for select using (bucket_id = 'branding');

-- Authenticated users may upload / replace / remove branding assets.
drop policy if exists "branding_auth_insert" on storage.objects;
create policy "branding_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'branding');

drop policy if exists "branding_auth_update" on storage.objects;
create policy "branding_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'branding') with check (bucket_id = 'branding');

drop policy if exists "branding_auth_delete" on storage.objects;
create policy "branding_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'branding');
