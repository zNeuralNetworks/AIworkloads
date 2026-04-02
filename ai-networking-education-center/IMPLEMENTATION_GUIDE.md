# Implementation Guide (Snapshot)

This file is kept as a lightweight snapshot of implementation direction.
For active operational instructions, use:

- [README.md](/Users/theorajan/local%20builds/Aiworkloads/ai-networking-education-center/README.md)
- [COMPLETE_SETUP_GUIDE.md](/Users/theorajan/local%20builds/Aiworkloads/ai-networking-education-center/COMPLETE_SETUP_GUIDE.md)

## Implemented direction

- Supabase-based admin authentication (magic link + Google OAuth)
- Supabase client configured to degrade gracefully when env vars are absent
- Dockerized static serving with SPA route fallback and health endpoint
- Root-level GitHub Actions workflow for lint/test/build/e2e, Docker build, Cloud Run deploy, and Lighthouse

## Important paths

- Auth context: `contexts/AuthContext.tsx`
- Auth service: `services/auth.ts`
- Supabase config: `config/supabase.ts`
- Admin modal/login: `components/AdminDashboard.tsx`, `components/admin/AdminLogin.tsx`
- Docker runtime server: `server.cjs`, `Dockerfile`
- CI workflow: `/.github/workflows/ci.yml`

## Notes

- Legacy `VITE_ADMIN_PASSWORD` gate is removed.
- Admin auth and sync require Supabase env vars.
