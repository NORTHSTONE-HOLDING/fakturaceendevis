# ENDEVIS InvoiceFlow

Premium ERP platform for small and medium businesses — invoicing, warehouse,
quotations and AI automation. Built with a clean, modular, extendable
architecture.

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript (strict), TailwindCSS, shadcn/ui, Framer Motion
- **Backend:** Next.js Route Handlers + Server Actions
- **Database / Auth / Storage:** Supabase (PostgreSQL) with Row Level Security, soft delete and audit log
- **AI:** OpenAI Responses API (with a data-aware local fallback)
- **PDF:** Unified A4 document template (print-to-PDF) with Czech QR Platba

## Prerequisites

- Node.js 20+
- Docker (for local Supabase)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Start the local Supabase stack (Postgres + Auth + Storage)
#    Applies migrations in supabase/migrations and seeds supabase/seed.sql
supabase start

# 3. Create .env.local from the template and fill in the keys printed by
#    `supabase status` (NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / SERVICE_ROLE_KEY)
cp .env.example .env.local

# 4. Run the dev server
npm run dev
```

The app runs at http://localhost:3000. Supabase Studio is at http://localhost:54323.

### Demo login

A demo administrator is created during setup:

- **Email:** `admin@endevis.cz`
- **Password:** `Endevis123!`

## Key concepts

- **Document numbering** is database-controlled via `next_document_number()`
  (e.g. `INV-2026-000001`), guaranteed unique and reset per year.
- **Security:** RLS on all tables, role system (Administrator/Manager/
  Accountant/Warehouse/Sales), audit log via triggers, soft delete via
  `deleted_at`.
- **Types:** `src/types/database.generated.ts` is generated from the live schema
  (`supabase gen types typescript --local`).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm run db:start` / `db:stop` | Start/stop local Supabase |
| `npm run db:reset` | Reset DB, re-run migrations + seed |
