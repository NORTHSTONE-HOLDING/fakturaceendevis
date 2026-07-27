# AGENTS.md

## Project

ENDEVIS InvoiceFlow — an ERP SaaS (invoicing, warehouse, quotations, AI) built
with Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui, backed by
Supabase (PostgreSQL/Auth/Storage). See `README.md` for the full stack and the
standard scripts.

## Cursor Cloud specific instructions

The update script (run automatically on VM startup) only installs npm
dependencies. Docker, the Supabase CLI, and the local Supabase stack are **not**
started by it — start them yourself when you need to run or test the app.

### Bringing the environment up

1. **Docker daemon** must be running before Supabase. It is installed but not
   auto-started. If `docker info` fails:
   - `sudo nohup dockerd > /tmp/dockerd.log 2>&1 &` then wait ~8s.
   - `sudo chmod 666 /var/run/docker.sock` so the `ubuntu` user can use Docker
     without re-login (group membership alone does not apply to the current
     shell).
   - Docker 29 defaults to the containerd snapshotter, which ignores the
     `fuse-overlayfs` storage driver required here. `/etc/docker/daemon.json`
     pins `storage-driver: fuse-overlayfs` and `containerd-snapshotter: false`
     — keep it that way.
2. **Local Supabase:** `supabase start` (from repo root). First run pulls images.
   This applies `supabase/migrations/*` and seeds `supabase/seed.sql`.
3. **Env vars:** regenerate `.env.local` from the running stack. The anon/service
   keys are the well-known local demo keys (stable across installs):
   `eval "$(supabase status -o env)"` then write
   `NEXT_PUBLIC_SUPABASE_URL=$API_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY`.
   `.env.local` is gitignored, so it must be recreated on a fresh VM.
4. **Demo admin user** (created via the Auth admin API, not seed.sql, because
   users live in the `auth` schema). If login fails with invalid credentials,
   recreate it:
   ```
   eval "$(supabase status -o env)"
   curl -s -X POST "$API_URL/auth/v1/admin/users" \
     -H "apikey: $SERVICE_ROLE_KEY" -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@endevis.cz","password":"Endevis123!","email_confirm":true,"user_metadata":{"full_name":"ENDEVIS Admin","role":"administrator"}}'
   ```
   Login: `admin@endevis.cz` / `Endevis123!` (pre-filled on the login form).
5. **Dev server:** `npm run dev` → http://localhost:3000. Supabase Studio →
   http://localhost:54323, Mailpit (password-reset emails) →
   http://localhost:54324.

### Gotchas

- SQL-language functions (e.g. `current_app_role()`) are validated eagerly at
  creation, so any table they reference must be defined earlier in the migration.
- After changing the schema, regenerate types:
  `supabase gen types typescript --local > src/types/database.generated.ts`.
  A version skew between the CLI's generated type format and an old
  `@supabase/supabase-js` makes every query resolve to `never` — keep
  `@supabase/supabase-js` and `@supabase/ssr` current if that happens.
- The AI assistant and email/WhatsApp features degrade gracefully without API
  keys (`OPENAI_API_KEY`, `RESEND_API_KEY`, `WHATSAPP_*`); the assistant uses a
  live-data fallback so it stays functional locally.
- Invoice/quotation numbers come from the DB function `next_document_number()`;
  never assign numbers in application code.
