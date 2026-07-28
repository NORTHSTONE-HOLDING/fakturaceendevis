-- ============================================================================
-- ENDEVIS InvoiceFlow — Handover protocols, project completion & warranty
-- ============================================================================

do $$ begin
  create type public.handover_type as enum
    ('partial', 'final', 'internal', 'subcontractor', 'warranty', 'acceptance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.handover_status as enum ('draft', 'signed', 'archived');
exception when duplicate_object then null; end $$;

-- Warranty window on the project (set when a final handover is signed)
alter table public.projects add column if not exists warranty_start_date date;
alter table public.projects add column if not exists warranty_end_date date;
alter table public.projects add column if not exists warranty_months int not null default 24;

-- Handover protocol enrichment
alter table public.handover_protocols
  add column if not exists protocol_type public.handover_type not null default 'final';
alter table public.handover_protocols
  add column if not exists status public.handover_status not null default 'draft';
alter table public.handover_protocols
  add column if not exists summary jsonb;
alter table public.handover_protocols
  add column if not exists customer_signed_at timestamptz;
alter table public.handover_protocols
  add column if not exists contractor_signed_at timestamptz;

drop trigger if exists trg_set_updated_at on public.handover_protocols;
alter table public.handover_protocols
  add column if not exists updated_at timestamptz not null default now();
create trigger trg_set_updated_at before update on public.handover_protocols
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
