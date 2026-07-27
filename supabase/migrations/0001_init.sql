-- ============================================================================
-- ENDEVIS InvoiceFlow — Initial schema
-- UUID primary keys · Row Level Security · Soft delete · Audit log
-- Database-controlled document numbering
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum
    ('administrator', 'manager', 'accountant', 'warehouse', 'sales');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invoice_status as enum
    ('draft', 'sent', 'paid', 'overdue', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.quotation_status as enum
    ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.product_status as enum ('active', 'inactive', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.document_type as enum ('INV', 'ADV', 'QTN', 'ORD', 'DLV');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- Shared helpers
-- ----------------------------------------------------------------------------

-- Auto-update updated_at on row modification
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- Audit log
-- ----------------------------------------------------------------------------
create table if not exists public.audit_log (
  id          uuid primary key default gen_random_uuid(),
  table_name  text not null,
  record_id   uuid,
  action      text not null,
  actor_id    uuid,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_audit_log_table on public.audit_log (table_name, record_id);
create index if not exists idx_audit_log_created on public.audit_log (created_at desc);

create or replace function public.record_audit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_record_id uuid;
begin
  if (tg_op = 'DELETE') then
    v_record_id := old.id;
    insert into public.audit_log(table_name, record_id, action, actor_id, old_data)
    values (tg_table_name, v_record_id, tg_op, auth.uid(), to_jsonb(old));
    return old;
  elsif (tg_op = 'UPDATE') then
    v_record_id := new.id;
    insert into public.audit_log(table_name, record_id, action, actor_id, old_data, new_data)
    values (tg_table_name, v_record_id, tg_op, auth.uid(), to_jsonb(old), to_jsonb(new));
    return new;
  else
    v_record_id := new.id;
    insert into public.audit_log(table_name, record_id, action, actor_id, new_data)
    values (tg_table_name, v_record_id, tg_op, auth.uid(), to_jsonb(new));
    return new;
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        public.app_role not null default 'sales',
  avatar_url  text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- Create a profile automatically when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'sales')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role helpers (defined after profiles, since SQL functions are validated eagerly)
create or replace function public.current_app_role()
returns public.app_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_administrator()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_app_role() = 'administrator', false);
$$;

-- ----------------------------------------------------------------------------
-- Reference data
-- ----------------------------------------------------------------------------
create table if not exists public.product_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table if not exists public.suppliers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ----------------------------------------------------------------------------
-- Customers
-- ----------------------------------------------------------------------------
create table if not exists public.customers (
  id             uuid primary key default gen_random_uuid(),
  company        text not null,
  contact_person text,
  ico            text,
  dic            text,
  address        text,
  city           text,
  zip            text,
  country        text default 'Česká republika',
  phone          text,
  email          text,
  website        text,
  notes          text,
  tags           text[] not null default '{}',
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create index if not exists idx_customers_company on public.customers using gin (to_tsvector('simple', company));
create index if not exists idx_customers_active on public.customers (deleted_at) where deleted_at is null;

-- ----------------------------------------------------------------------------
-- Products / price list / warehouse
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  name              text not null,
  description       text,
  category_id       uuid references public.product_categories(id),
  supplier_id       uuid references public.suppliers(id),
  unit              text not null default 'ks',
  purchase_price    numeric(14,2) not null default 0,
  sale_price        numeric(14,2) not null default 0,
  vat_rate          numeric(5,2) not null default 21,
  is_warehouse_item boolean not null default false,
  sku               text,
  ean               text,
  barcode           text,
  stock             numeric(14,3) not null default 0,
  min_stock         numeric(14,3) not null default 0,
  image_url         text,
  status            public.product_status not null default 'active',
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  -- Derived helpers (generated always)
  price_with_vat    numeric(14,2) generated always as (round(sale_price * (1 + vat_rate/100), 2)) stored,
  margin            numeric(14,2) generated always as (sale_price - purchase_price) stored
);
create index if not exists idx_products_name on public.products using gin (to_tsvector('simple', name));
create index if not exists idx_products_code on public.products (code);
create index if not exists idx_products_active on public.products (deleted_at) where deleted_at is null;

-- Warehouse stock movements
create table if not exists public.warehouse_movements (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  change      numeric(14,3) not null,
  reason      text,
  actor_id    uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);
create index if not exists idx_movements_product on public.warehouse_movements (product_id);

-- ----------------------------------------------------------------------------
-- Document numbering
-- ----------------------------------------------------------------------------
create table if not exists public.document_sequences (
  id             uuid primary key default gen_random_uuid(),
  doc_type       public.document_type not null,
  year           int not null,
  current_number int not null default 0,
  unique (doc_type, year)
);

-- Atomically returns the next formatted document number, e.g. INV-2026-000001.
-- Creates a fresh sequence for each new year automatically.
create or replace function public.next_document_number(p_doc_type public.document_type)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_year int := extract(year from now())::int;
  v_next int;
begin
  insert into public.document_sequences (doc_type, year, current_number)
  values (p_doc_type, v_year, 0)
  on conflict (doc_type, year) do nothing;

  update public.document_sequences
     set current_number = current_number + 1
   where doc_type = p_doc_type and year = v_year
   returning current_number into v_next;

  return p_doc_type::text || '-' || v_year::text || '-' || lpad(v_next::text, 6, '0');
end;
$$;

-- ----------------------------------------------------------------------------
-- Quotations
-- ----------------------------------------------------------------------------
create table if not exists public.quotations (
  id          uuid primary key default gen_random_uuid(),
  number      text not null unique,
  customer_id uuid references public.customers(id),
  status      public.quotation_status not null default 'draft',
  issue_date  date not null default current_date,
  valid_until date,
  currency    text not null default 'CZK',
  subtotal    numeric(14,2) not null default 0,
  vat_total   numeric(14,2) not null default 0,
  total       numeric(14,2) not null default 0,
  notes       text,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- ----------------------------------------------------------------------------
-- Invoices
-- ----------------------------------------------------------------------------
create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  number          text not null unique,
  customer_id     uuid references public.customers(id),
  status          public.invoice_status not null default 'draft',
  issue_date      date not null default current_date,
  due_date        date not null default (current_date + interval '14 days'),
  tax_date        date not null default current_date,
  currency        text not null default 'CZK',
  subtotal        numeric(14,2) not null default 0,
  vat_total       numeric(14,2) not null default 0,
  total           numeric(14,2) not null default 0,
  notes           text,
  iban            text,
  swift           text,
  variable_symbol text,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists idx_invoices_customer on public.invoices (customer_id);
create index if not exists idx_invoices_status on public.invoices (status);
create index if not exists idx_invoices_active on public.invoices (deleted_at) where deleted_at is null;

create table if not exists public.invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references public.invoices(id) on delete cascade,
  product_id  uuid references public.products(id),
  description text not null,
  quantity    numeric(14,3) not null default 1,
  unit        text not null default 'ks',
  unit_price  numeric(14,2) not null default 0,
  vat_rate    numeric(5,2) not null default 21,
  line_total  numeric(14,2) not null default 0,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_invoice_items_invoice on public.invoice_items (invoice_id);

-- ----------------------------------------------------------------------------
-- Notifications (AI alerts, reminders, system)
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  message     text,
  severity    text not null default 'info',
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications (user_id, is_read);

-- ----------------------------------------------------------------------------
-- Company settings (single row)
-- ----------------------------------------------------------------------------
create table if not exists public.company_settings (
  id               uuid primary key default gen_random_uuid(),
  name             text not null default 'ENDEVIS',
  logo_url         text,
  icon_url         text,
  primary_color    text default '#C6A15B',
  ico              text,
  dic              text,
  address          text,
  iban             text,
  swift            text,
  default_vat_rate numeric(5,2) not null default 21,
  currency         text not null default 'CZK',
  email            text,
  phone            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

-- ----------------------------------------------------------------------------
-- Triggers: updated_at + audit
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','product_categories','suppliers','customers','products',
    'quotations','invoices','company_settings'
  ]
  loop
    execute format(
      'drop trigger if exists trg_set_updated_at on public.%I;
       create trigger trg_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t);
  end loop;

  foreach t in array array[
    'customers','products','quotations','invoices','invoice_items'
  ]
  loop
    execute format(
      'drop trigger if exists trg_audit on public.%I;
       create trigger trg_audit after insert or update or delete on public.%I
       for each row execute function public.record_audit();', t, t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.product_categories  enable row level security;
alter table public.suppliers           enable row level security;
alter table public.customers           enable row level security;
alter table public.products            enable row level security;
alter table public.warehouse_movements enable row level security;
alter table public.quotations          enable row level security;
alter table public.invoices            enable row level security;
alter table public.invoice_items       enable row level security;
alter table public.notifications       enable row level security;
alter table public.company_settings    enable row level security;
alter table public.document_sequences  enable row level security;
alter table public.audit_log           enable row level security;

-- Profiles: users read all, edit own, admins edit all
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);
create policy "profiles_update_self_or_admin" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_administrator())
  with check (id = auth.uid() or public.is_administrator());

-- Generic business tables: any authenticated user may read/write.
-- (Fine-grained per-role rules can be layered on later without schema changes.)
do $$
declare t text;
begin
  foreach t in array array[
    'product_categories','suppliers','customers','products',
    'warehouse_movements','quotations','invoices','invoice_items',
    'company_settings','document_sequences'
  ]
  loop
    execute format('create policy "%1$s_rw" on public.%1$I
      for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- Notifications: users see their own (or global, user_id null)
create policy "notifications_select" on public.notifications
  for select to authenticated
  using (user_id = auth.uid() or user_id is null);
create policy "notifications_write" on public.notifications
  for all to authenticated
  using (user_id = auth.uid() or user_id is null)
  with check (user_id = auth.uid() or user_id is null);

-- Audit log: read-only for authenticated users
create policy "audit_select" on public.audit_log
  for select to authenticated using (true);

-- ----------------------------------------------------------------------------
-- Grants
-- RLS controls row access, but roles still need table-level privileges.
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to anon, authenticated;

-- Ensure future objects inherit the same grants.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;
alter default privileges in schema public
  grant execute on functions to anon, authenticated;
