-- ============================================================================
-- ENDEVIS InvoiceFlow — Project lifecycle, defect status, additional work
-- ============================================================================

-- Project lifecycle pipeline (ordered)
do $$ begin
  create type public.project_stage as enum (
    'lead', 'inquiry', 'site_visit', 'budget', 'quotation', 'approval',
    'started', 'diary', 'warehouse', 'delivery_notes', 'advance_invoices',
    'additional_work', 'interim_handover', 'final_handover', 'final_invoice',
    'warranty', 'archived'
  );
exception when duplicate_object then null; end $$;

-- 4-state defect status
do $$ begin
  create type public.defect_status as enum ('open', 'in_progress', 'completed', 'rejected');
exception when duplicate_object then null; end $$;

-- Additional-work approval status
do $$ begin
  create type public.additional_work_status as enum ('proposed', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

alter table public.projects
  add column if not exists stage public.project_stage not null default 'started';

alter table public.defects
  add column if not exists status public.defect_status not null default 'open';

-- Backfill defect status from the legacy completed flag
update public.defects set status = 'completed' where completed = true and status = 'open';

-- ----------------------------------------------------------------------------
-- Additional work (vícepráce)
-- ----------------------------------------------------------------------------
create table if not exists public.additional_works (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  description text not null,
  amount      numeric(14,2) not null default 0,
  vat_rate    numeric(5,2) not null default 21,
  status      public.additional_work_status not null default 'proposed',
  approved_at timestamptz,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index if not exists idx_additional_works_project on public.additional_works (project_id);

drop trigger if exists trg_set_updated_at on public.additional_works;
create trigger trg_set_updated_at before update on public.additional_works
  for each row execute function public.set_updated_at();

drop trigger if exists trg_audit on public.additional_works;
create trigger trg_audit after insert or update or delete on public.additional_works
  for each row execute function public.record_audit();

-- ----------------------------------------------------------------------------
-- RLS + grants
-- ----------------------------------------------------------------------------
alter table public.additional_works enable row level security;
drop policy if exists "additional_works_rw" on public.additional_works;
create policy "additional_works_rw" on public.additional_works
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
