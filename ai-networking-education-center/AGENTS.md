# AGENTS.md

## Scope
These instructions apply to the `ai-networking-education-center/` app.

## Parent Guidance
- Also follow the repository-level `../AGENTS.md`.
- This directory is the only application root for the AI Workloads / Workload Architecture Reference app.
- Run Node, Vite, lint, test, build, and claim-check commands from this directory.
- Keep assistant session tracking in `../docs/internal/WORKLOG.md`.
- Use `../docs/internal/DOC_MAP.md` before reading historical docs.

## Required Session Context
Read these before changing app code or content:
1. `../docs/internal/WORKLOG.md`
2. `../docs/internal/DOC_MAP.md`
3. `CLAUDE.md`
4. `README.md`

For product/content/rebrand work, also read:
- `../docs/internal/REBRAND_REFRAME_STATUS.md`
- `../ROADMAP.md`

## App Conventions
- Use React, Vite, TypeScript, and Tailwind patterns already present in the app.
- Follow `CLAUDE.md` for component structure, import order, styling, and validation.
- Keep reference content in `constants/`; do not hardcode reference datasets inside components.
- Register new sections in `app/moduleRegistry.ts`.
- Use existing shared types from `types/`.
- Use `GlossaryTerm` only when the glossary key exists verbatim in `constants/glossary.ts`.
- Do not add sizing calculator logic to this app; sizing belongs in AI Cluster Planner / Optics Master.

## Verification
After app code or content changes, run the narrowest relevant checks, with the standard full set being:
```bash
npm run lint
npm run test
npm run build
```

After adding or updating `claim()` values, also run:
```bash
npm run check:claim-sources
npm run check:claim-ids
```
