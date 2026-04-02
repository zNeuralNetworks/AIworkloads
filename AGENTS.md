# AGENTS.md

## Scope
These instructions apply to the entire repository.

## Working directory
- Standard repo bootstrap before working locally or on the GitHub-backed repo:
```bash
cd "/Users/theorajan/local builds/Aiworkloads"
git checkout main
git pull --ff-only origin main
```
- Front-end app lives in `ai-networking-education-center/`.
- Run Node/Vite commands from that directory.
- Treat `ai-networking-education-center/` as the only application root.
- Treat `/.github/` as the only authoritative GitHub workflow location.
- Historical notes and review artifacts live under `docs/archive/root-history/`.
- Assistant-specific metadata lives under `docs/internal/assistant/` and should not be treated as product code.
- Rebrand/reframe continuity file: `docs/internal/REBRAND_REFRAME_STATUS.md`.

## Common workflows and commands
```bash
cd ai-networking-education-center
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run check:claim-sources
npm run check:claim-ids
```

## Deployment workflow (Cloud Run source deploy)
```bash
cd ai-networking-education-center
gcloud run deploy aiworkloads \
  --source . \
  --project=infralens-486218 \
  --region=europe-west1
```

## TODO
- Add any new validated repo workflows here when introduced (prefer exact commands from README/package scripts).
