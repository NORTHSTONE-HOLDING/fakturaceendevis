-- ============================================================================
-- ENDEVIS InvoiceFlow — Construction Project Management
-- Project-oriented: projects own diary, defects, costs, handover, documents.
-- ============================================================================

-- New document numbering types (used at runtime, safe to add here)
alter type public.document_type add value if not exists 'PRJ';
alter type public.document_type add value if not exists 'HOV';

do $$ begin
  create type public.project_status as enum
    ('planned', 'active', 'on_hold', 'completed', 'archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.defect_priority as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- Projects
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  number        text not null unique,
  name          text not null,
  customer_id   uuid references public.customers(id),
  quotation_id  uuid references public.quotations(id),
  status        public.project_status not null default 'active',
  address       text,
  start_date    date not null default current_date,
  end_date      date,
  budget_amount numeric(14,2) not null default 0,
  currency      text not null default 'CZK',
  manager_id    uuid references public.profiles(id),
  notes         text,
  created_by    uuid references public.profiles(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index if not exists idx_projects_customer on public.projects (customer_id);
create index if not exists idx_projects_active on public.projects (deleted_at) where deleted_at is null;

-- Link invoices to a project + advance-invoice support
alter table public.invoices
  add column if not exists project_id uuid references public.projects(id);
alter table public.invoices
  add column if not exists is_advance boolean not null default false;
alter table public.invoices
  add column if not exists advance_category text;
create index if not exists idx_invoices_project on public.invoices (project_id);

-- ----------------------------------------------------------------------------
-- Construction diary
-- ----------------------------------------------------------------------------
create table if not exists public.construction_diary_entries (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  entry_date     date not null default current_date,
  weather        text,
  temperature    numeric(5,1),
  wind           text,
  rain           boolean not null default false,
  location       text,
  workers_count  int not null default 0,
  working_hours  numeric(6,1) not null default 0,
  activities     text,
  materials_used text,
  equipment_used text,
  problems       text,
  notes          text,
  image_urls     text[] not null default '{}',
  ai_summary     text,
  created_by     uuid references public.profiles(id),
  created_at     timestamptz not null default now()
);
create index if not exists idx_diary_project on public.construction_diary_entries (project_id, entry_date desc);

-- ----------------------------------------------------------------------------
-- Handover protocols
-- ----------------------------------------------------------------------------
create table if not exists public.handover_protocols (
  id                   uuid primary key default gen_random_uuid(),
  number               text not null unique,
  project_id           uuid not null references public.projects(id) on delete cascade,
  customer_id          uuid references public.customers(id),
  address              text,
  protocol_date        date not null default current_date,
  responsible_person   text,
  completed_work       text,
  equipment_delivered  text,
  keys_handed          text,
  meters               text,
  customer_signature   text,
  contractor_signature text,
  notes                text,
  created_by           uuid references public.profiles(id),
  created_at           timestamptz not null default now()
);
create index if not exists idx_handover_project on public.handover_protocols (project_id);

-- ----------------------------------------------------------------------------
-- Defects (linked to project, optionally to a handover protocol)
-- ----------------------------------------------------------------------------
create table if not exists public.defects (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references public.projects(id) on delete cascade,
  handover_id        uuid references public.handover_protocols(id) on delete set null,
  description        text not null,
  priority           public.defect_priority not null default 'medium',
  photo_url          text,
  responsible        text,
  deadline           date,
  completed          boolean not null default false,
  completion_date    date,
  customer_confirmed boolean not null default false,
  created_by         uuid references public.profiles(id),
  created_at         timestamptz not null default now()
);
create index if not exists idx_defects_project on public.defects (project_id, completed);

-- ----------------------------------------------------------------------------
-- Project actual costs (material / labor / transport / rental / other)
-- ----------------------------------------------------------------------------
create table if not exists public.project_costs (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  category   text not null default 'material',
  amount     numeric(14,2) not null default 0,
  note       text,
  cost_date  date not null default current_date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_project_costs_project on public.project_costs (project_id);

-- ----------------------------------------------------------------------------
-- updated_at + audit triggers
-- ----------------------------------------------------------------------------
drop trigger if exists trg_set_updated_at on public.projects;
create trigger trg_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

do $$
declare t text;
begin
  foreach t in array array[
    'projects','construction_diary_entries','handover_protocols','defects','project_costs'
  ]
  loop
    execute format(
      'drop trigger if exists trg_audit on public.%I;
       create trigger trg_audit after insert or update or delete on public.%I
       for each row execute function public.record_audit();', t, t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- RLS + grants (consistent with the rest of the schema)
-- ----------------------------------------------------------------------------
alter table public.projects                    enable row level security;
alter table public.construction_diary_entries  enable row level security;
alter table public.handover_protocols          enable row level security;
alter table public.defects                     enable row level security;
alter table public.project_costs               enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'projects','construction_diary_entries','handover_protocols','defects','project_costs'
  ]
  loop
    execute format('drop policy if exists "%1$s_rw" on public.%1$I;', t);
    execute format('create policy "%1$s_rw" on public.%1$I
      for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
