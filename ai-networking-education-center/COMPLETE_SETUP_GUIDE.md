# Complete Setup Guide (Current)

This guide is intentionally short and aligned to the current repository state.

## 1. Sync local repo

```bash
cd "/Users/theorajan/local builds/Aiworkloads"
git checkout main
git pull --ff-only origin main
```

## 2. Install and run app

```bash
cd ai-networking-education-center
npm ci
npm run dev
```

## 3. Configure Supabase for admin auth/sync

Create `.env.local` from `.env.example` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

Apply schema in Supabase SQL Editor from either:

- `SUPABASE_MIGRATION.sql`
- `supabase/migrations/001_init_tables.sql`

Without these env vars, admin auth and sync are disabled by design.

## 4. Verify quality gates

```bash
npm run lint
npm run test
npm run build
```

## 5. Verify Docker path

```bash
docker build -t ai-networking-center:local .
docker run --rm -p 8080:8080 ai-networking-center:local
```

Check:

- `curl http://127.0.0.1:8080/health`
- open `http://127.0.0.1:8080/operations`

## 6. CI/CD references

- Workflow: `/.github/workflows/ci.yml`
- Lighthouse config: `/.github/lighthouse-config.json`

For broader context, use [README.md](/Users/theorajan/local%20builds/Aiworkloads/ai-networking-education-center/README.md) as the canonical source.
