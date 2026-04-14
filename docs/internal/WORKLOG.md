# AIworkloads Worklog

## Purpose
Track assistant activity, decisions, and completed work across sessions.
Use this file as a running log — most recent entry at the top.

---

## 2026-04-13 — Data Movement Copy/UI Tightening

### Activity
- [x] Reworked `components/ConceptsSection.tsx` around a stage-first decision rule for ingest, shuffle, checkpoint, and restore
- [x] Replaced the workload carry-forward paragraph with a compact active-lens status chip
- [x] Collapsed the opening "Why This Matters" and lens-choice material into a concise decision-rule band
- [x] Tightened `components/LifecycleStageMap.tsx` so the lifecycle map behaves like a selector with active stage, dominant flow, first failure, and first signal
- [x] Shortened Data Movement simulator, protocol refresher, telemetry, runbook, knowledge-check, and closeout copy
- [x] Reduced Data Movement constants copy for stage summaries, notices, stress signatures, telemetry rationale, and decision notes
- [x] Renamed remaining local learning-language labels toward architecture-reference framing
- [x] Removed the post-hero "Why This Matters" / "Decision Lens" band from Data Movement

### Verification
- [x] `npm run lint` — clean
- [x] `npm run test` — 23/23 passed
- [x] `npm run build` — clean
- [x] Playwright CLI desktop and mobile screenshots for `/#concepts`

### Notes
- Scope stayed on Data Movement and directly supporting UI labels; existing Workload Types changes were preserved.
- The product boundary remains architecture/stage decision framing, with quantitative sizing left to AI Cluster Planner / Optics Master.

---

## 2026-04-13 — Workload Types Copy/UI Tightening

### Activity
- [x] Reviewed latest Workload Types screenshots across intro, checkpoint/simulator, traffic lab, transfer, and closing sections
- [x] Re-read the Workload Types component and supporting simulator/traffic lab code paths
- [x] Ran the app test suite to verify the current baseline before recommending changes
- [x] `components/TrainingVsInferenceSection.tsx` — shortened Workload Types intro, checkpoint answers, anchor contrast copy, simulator copy, telemetry/runbook intros, closeout, and final decision rule
- [x] `components/DecisionSimulator.tsx` — removed redundant guided-stage and selected-trait chip rows, tightened labels/disclosure summaries, reduced rounded dashboard chrome, and added clearer focus states on interactive controls
- [x] `components/TrafficPatternLab.tsx` — replaced full paragraph pattern cards with compact pattern chips, widened the visual/interpretation layout, and renamed learning-language labels to architecture-reference language
- [x] `components/KnowledgeCheckCard.tsx` — replaced "Check Your Understanding" / "Correct mental model" copy with more concise decision-check language
- [x] `index.css` — added Workload Types-specific post-hero spacing override to reduce excessive vertical gaps without changing every module

### Verification
- [x] `npm run test` — 23/23 passed
- [x] `npm run lint` — clean
- [x] `npm run build` — clean

### Notes
- Primary adjustment: treat the 33% zoom screenshots as structural evidence, not exact spacing; the fix focuses on lower copy load and stronger decision guidance.

---

## 2026-04-13 — "What to Tune" Content Pass

### Activity
- [x] `components/ProtocolsSection.tsx` — replaced non-standard `"What to explain clearly"` slot in `PROTOCOL_MODULE_IMPLICATIONS` with `"What to tune first"` (ECN threshold → DCQCN timers → PFC scope ordering)
- [x] `constants/architectureGuidance.ts` — added `ARCHITECTURE_MODULE_IMPLICATIONS` export with four standard slots: "What fails first", "What to monitor first", "What to tune first", "When to hand off"
- [x] `constants/index.ts` — added `ARCHITECTURE_MODULE_IMPLICATIONS` to architecture exports
- [x] `components/ArchitectureSection.tsx` — imported `InfrastructureImplicationsPanel` and `ARCHITECTURE_MODULE_IMPLICATIONS`; inserted "What this means operationally" panel before the Transfer Prompt closing block

### Verification
- [x] `npm run lint` — clean
- [x] `npm run build` — clean (7.71s)

### Notes
- All six modules now have a "What to tune first" slot in their module implications block
- ProtocolsSection's `PROTOCOL_MODULE_IMPLICATIONS` stays inline in the component (not moved to constants) to match existing pattern

---

## 2026-04-13 — Module Contract Structural Pass

### Activity
- [x] Renamed `"How to read this"` eyebrow → `"Why This Matters"` in `ArchitectureSection.tsx` (line 188) and `PerformanceSection.tsx` (line 112) — aligns both with the module contract slot label
- [x] Added missing structural slots to `LoadBalancingSection.tsx`:
  - "Why This Matters" + "Decision model" two-column grid after the section header
  - "Next decision" Transfer Prompt panel with `'Mark pattern lens reviewed'` mastery CTA
  - Planner handoff `CompactDisclosure` using `PLANNER_HANDOFF_SHORT_TEXT`
- [x] Added `CompactDisclosure` import and `PLANNER_HANDOFF_LABEL` / `PLANNER_HANDOFF_SHORT_TEXT` imports to `LoadBalancingSection.tsx`
- [x] Extended `useLearning()` destructuring in `LoadBalancingSection.tsx` to include `toggleMastered` and `masteredModules`

### Verification
- [x] `npm run lint` — clean
- [x] `npm run build` — clean (7.35s)

### Notes
- "What to tune" slot deferred — requires new per-module copy for 5 of 6 modules, not a label change
- `load-balancing` is the module ID used for mastery tracking (matches section `id` attribute)

---

## 2026-04-13 — Copy Cleanup Round 2

### Activity
- [x] Renamed `Deep Dive` nav label and module registry title to `Transport Control Lab` (`constants/navigation.ts`, `app/moduleRegistry.ts`) — route and IDs unchanged
- [x] Cleaned remaining product-boundary strings in `constants/future.ts`: "famous AI clusters" → production-scale framing; "course completion status" → "reference review state"; "educational data" → "reference content"
- [x] Added `PLANNER_HANDOFF_SHORT_TEXT` to `constants/plannerHandoff.ts` and exported via `constants/index.ts`
- [x] Switched `OperationsPlaybooksSection.tsx` from full planner handoff paragraph to short variant — full text now appears only in Architecture and Platform sections

### Verification
- [x] `npm run lint` — clean
- [x] `npm run build` — clean

### Notes
- `deep-dive` URL route and all e2e test selectors target the route path, not the display label — no test changes needed

---

## 2026-04-13 — Copy Terminology Pass

### Activity
- [x] Applied all 10 priority rewrites from `copy-review-ai-workloads.md`
- [x] Tier 1 quick wins: hero subtitle, `Reference Depth` label, `Performance Implications` title, `Validation View` status pill, `UEC 1.0 Reference` badge, home footer chips, PFC description, future.ts backlog items
- [x] Tier 2 learner sweep: removed all `learner` / `teaching step` / `Mark this module as understood` language from TrainingVsInferenceSection, ConceptsSection, ProtocolsSection, ArchitectureSection, LifecycleStageMap, LoadBalancingSection, CongestionSequenceStrip, PerformanceSection, TopologyWalkthrough
- [x] Replaced per-module mastery CTAs with decision-state labels: `Mark workload lens reviewed`, `Mark stage lens reviewed`, `Mark transport lens reviewed`, `Mark performance lens reviewed`
- [x] Replaced silicon codenames in `constants/products.ts` (`claim()` values, keyFeatures, and `chip:` fields) with capability language

### Verification
- [x] `npm run lint` — clean
- [x] `npm run build` — clean (5.19s, 2636 modules)
- [x] `npm run test` — 23/23 passed

### Notes
- `learningObjectives` data property key left unchanged (not user-facing)
- No architecture, routing, or runtime logic changed — all edits are string literals

---

## 2026-04-13 — Copy Audit

### Activity
- [x] Created `copy-review-ai-workloads.md` at the repo root
- [x] Audited live app copy against the architecture-reference product direction
- [x] Prioritized 10 copy issues with exact current text, classification, rewrite, and rationale

### Verification
- [x] Confirmed the audit structure matches the requested deliverable
- [x] No app code or runtime copy was changed

### Notes
- Follow-up terminology pass completed — see 2026-04-13 Copy Terminology Pass entry above.

---

## 2026-04-13 — Post-Hero UI Pass

### Activity
- [x] Implemented compact peek behavior for the global bottom navigation so reading content has a safer lower viewport
- [x] Consolidated sticky module chrome after scroll and reduced mobile header collisions
- [x] Added global scroll-safe spacing for anchored module sections
- [x] Reworked the Workload Types post-hero flow into clearer reading bands with reduced card weight
- [x] Tightened simulator, guided visual, search, progress rail, and context-label accessibility/copy
- [x] Added a Vitest localStorage shim for the current Node runtime so persisted-state tests run reliably

### Verification
- [x] `npm run lint`
- [x] `npm run test`
- [x] `npm run build`
- [x] Desktop and mobile Playwright screenshots for `/#training-vs-inference`
- [x] Direct-link Playwright screenshot pass for `/#concepts`, `/#protocols`, `/#load-balancing`, `/#performance`, and `/#hardware`

### Notes
- Preserved the entrance/hero direction and focused changes on post-hero reading, navigation, and reference flow.
- Worktree had pre-existing unrelated edits before this pass; do not treat this entry as a full-repo clean baseline.

---

## 2026-04-13 — Worklog Discipline

### Activity
- [x] Confirmed that `docs/internal/WORKLOG.md` should be updated as part of future work in this repo and app

### Notes
- Keep the worklog current whenever making repo or app changes so session context stays accurate.

---

## 2026-04-13 — Codex Guidance + Worklog Check

### Activity
- [x] Verified root `AGENTS.md` exists and points future sessions to `docs/internal/WORKLOG.md` and `docs/internal/DOC_MAP.md`
- [x] Added app-scoped `ai-networking-education-center/AGENTS.md` for Codex work inside the React/Vite app
- [x] Updated `docs/internal/DOC_MAP.md` so the app-level Codex guidance is part of the canonical read order
- [x] Confirmed the running worklog exists at `docs/internal/WORKLOG.md`

### Notes
- Kept the worklog at uppercase `WORKLOG.md` to match existing repo guidance and avoid duplicate case-only files on macOS.
- No app runtime code was changed in this pass.

---

## 2026-04-03 — Doc Review + Optimization Audit

### Activity
- [x] Reviewed all root-level `.md` files: `README.md`, `AGENTS.md`, `ROADMAP.md`
- [x] Reviewed both `docs/` folders: `docs/` (repo root) and `ai-networking-education-center/docs/`
- [x] Reviewed all app-level `.md` files in `ai-networking-education-center/`
- [x] Reviewed archive history: `docs/archive/root-history/` (7 files)
- [x] Reviewed internal metadata: `docs/internal/` + `assistant/` subdirectory
- [x] Reviewed app prompts: `ai-networking-education-center/docs/prompts/`
- [x] Created `docs/internal/WORKLOG.md` (this file)
- [x] Created `docs/internal/DOC_MAP.md` — canonical doc index and token optimization guide

### Findings
See `docs/internal/DOC_MAP.md` for full analysis. Summary:
- 5 stale snapshot `.md` files in app root are candidates for archival
- `SUPABASE_QUICK_START.md` exposes credentials and seed code — flagged for review
- `docs/internal/REBRAND_REFRAME_STATUS.md` is current and authoritative
- Archive history files in `docs/archive/root-history/` are now superseded by `ROADMAP.md`
- Recommendations documented in `DOC_MAP.md`

---
