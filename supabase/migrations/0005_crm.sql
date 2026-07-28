-- ============================================================================
-- ENDEVIS InvoiceFlow — CRM: customer entity types, metadata, contact persons
-- ============================================================================

do $$ begin
  create type public.customer_entity_type as enum (
    'firma', 'osvc', 'soukroma_osoba', 'dodavatel', 'partner',
    'investor', 'developer', 'obec_mesto', 'organizace'
  );
exception when duplicate_object then null; end $$;

alter table public.customers
  add column if not exists entity_type public.customer_entity_type not null default 'firma';
alter table public.customers add column if not exists iban text;
alter table public.customers add column if not exists swift text;
alter table public.customers add column if not exists payment_terms_days int not null default 14;
alter table public.customers add column if not exists assigned_to uuid references public.profiles(id);

-- Nested contact persons (unlimited per customer)
create table if not exists public.customer_contacts (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid not null references public.customers(id) on delete cascade,
  first_name        text,
  last_name         text not null,
  position          text,
  phone             text,
  mobile            text,
  email             text,
  birthday          date,
  preferred_contact text,
  notes             text,
  is_primary        boolean not null default false,
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);
create index if not exists idx_customer_contacts_customer on public.customer_contacts (customer_id);

drop trigger if exists trg_set_updated_at on public.customer_contacts;
create trigger trg_set_updated_at before update on public.customer_contacts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_audit on public.customer_contacts;
create trigger trg_audit after insert or update or delete on public.customer_contacts
  for each row execute function public.record_audit();

alter table public.customer_contacts enable row level security;
drop policy if exists "customer_contacts_rw" on public.customer_contacts;
create policy "customer_contacts_rw" on public.customer_contacts
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
