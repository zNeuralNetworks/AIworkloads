# Phase 1 Setup (Auth + Observability)- Complete


## Scope

- Supabase authentication for admin access
- Supabase integration primitives
- Sentry initialization

## Current behavior

- Admin authentication is Supabase-only (no PIN fallback).
- If Supabase env vars are missing, app still loads but admin auth/sync remain disabled.

## Required env vars

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
```

Optional:

```bash
VITE_SENTRY_DSN=...
```

## Database setup

Run one of:

- `SUPABASE_MIGRATION.sql`
- `supabase/migrations/001_init_tables.sql`

in Supabase SQL Editor.

## Primary files

- `config/supabase.ts`
- `services/auth.ts`
- `contexts/AuthContext.tsx`
- `components/admin/AdminLogin.tsx`
- `components/AdminDashboard.tsx`

Use [README.md](/Users/theorajan/local%20builds/Aiworkloads/ai-networking-education-center/README.md) for ongoing workflow.
