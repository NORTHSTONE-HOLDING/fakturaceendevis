-- ============================================================================
-- ENDEVIS InvoiceFlow — VAT modes (Reverse Charge / OSS / EU / Export)
-- ============================================================================

do $$ begin
  create type public.vat_mode as enum
    ('standard', 'reverse_charge', 'oss', 'eu_vat', 'export');
exception when duplicate_object then null; end $$;

alter table public.invoices
  add column if not exists vat_mode public.vat_mode not null default 'standard';
alter table public.invoices
  add column if not exists vat_note text;

grant select, insert, update, delete on all tables in schema public to authenticated;
