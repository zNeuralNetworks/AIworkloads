# Phase 2 Setup (Performance + DevOps)

## Scope

- Build chunking and production bundling improvements
- Containerized runtime for Cloud Run
- GitHub Actions CI/CD and Lighthouse

## Docker

Build and run:

```bash
docker build -t ai-networking-center:local .
docker run --rm -p 8080:8080 ai-networking-center:local
```

Expected:

- `/health` returns `OK`
- SPA routes (for example `/operations`) load through fallback
- static assets use correct MIME types

## CI/CD

Current workflow path:

- `/.github/workflows/ci.yml`

Current lighthouse config:

- `/.github/lighthouse-config.json`

The workflow runs from `ai-networking-education-center/` for app commands.

## Primary files

- `vite.config.ts`
- `Dockerfile`
- `server.cjs`
- `/.github/workflows/ci.yml`
- `/.github/lighthouse-config.json`

Use [README.md](/Users/theorajan/local%20builds/Aiworkloads/ai-networking-education-center/README.md) for canonical run instructions.
