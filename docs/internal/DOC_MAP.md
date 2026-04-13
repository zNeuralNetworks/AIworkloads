# Doc Map — AIworkloads

Canonical index of every `.md` file and the two `docs/` folders.
Use this before starting any session to understand what to read and what to skip.

---

## 1. Repo Root `.md` Files

| File | Role | Read first? |
|------|------|-------------|
| `README.md` | Repo landing page — points to app root, explains layout | Yes |
| `AGENTS.md` | Agent/assistant workflow rules (bootstrap commands, paths, conventions) | **Always** |
| `ROADMAP.md` | Full product roadmap: current state, north star, 4 horizons, prioritized backlog | Yes for product context |

---

## 2. `docs/` — Repo-level docs (two folders)

### 2a. `docs/` (repo root level)
```
docs/
├── archive/
│   ├── README.md              ← "these are historical, not canonical"
│   └── root-history/          ← 7 superseded planning/review files
│       ├── APP_CONTENT_REVIEW.md
│       ├── CONTENT_REFRAME_BACKLOG.md   ← superseded by ROADMAP.md
│       ├── ENHANCEMENT_REVIEW.md
│       ├── FINAL_STATUS.md
│       ├── README_ENHANCEMENTS.md
│       ├── REBRAND_REFRAME_PLAN.md      ← superseded by REBRAND_REFRAME_STATUS.md
│       └── REFACTOR_RECOMMENDATIONS.md
└── internal/
    ├── README.md              ← "these are non-product metadata"
    ├── DOC_MAP.md             ← canonical doc index and read/skip guide
    ├── REBRAND_REFRAME_STATUS.md  ← CANONICAL rebrand handoff — read this
    ├── WORKLOG.md             ← this worklog (created 2026-04-03)
    └── assistant/
        └── ai-networking-education-center/
            ├── .agents/       ← agent workflow config
            └── .claude/       ← Claude-specific metadata
```

### 2b. `ai-networking-education-center/docs/` (app-level)
```
ai-networking-education-center/docs/
└── prompts/
    ├── new-module.md          ← scaffold prompt: how to add a new module
    └── vault-sync.md          ← prompt: how to sync vault notes into constants
```

---

## 3. App Root `.md` Files (`ai-networking-education-center/`)

| File | Role | Status |
|------|------|--------|
| `README.md` | **Canonical** product + contributor overview. Tech stack, architecture, layout, deployment | Always read |
| `AGENTS.md` | App-scoped Codex guidance. Defers to root `AGENTS.md`, points to `CLAUDE.md`, `README.md`, `WORKLOG.md`, and app verification commands | Always read when editing app |
| `CLAUDE.md` | **Code convention guide**: content rules, TypeScript rules, component rules, verification | Always read |
| `COMPLETE_SETUP_GUIDE.md` | Short aligned setup guide (sync, install, run, Supabase, Docker) | Useful, accurate |
| `IMPLEMENTATION_GUIDE.md` | Snapshot of implemented direction (auth, Docker, CI) — defers to README | Snapshot only |
| `IMPLEMENTATION_SUMMARY.md` | Completed milestone checklist (Supabase auth, Docker, GitHub Actions) | Snapshot only |
| `PHASE_1_SETUP.md` | Phase 1 (auth+observability) — complete; defers to README | Snapshot only |
| `PHASE_2_SETUP.md` | Phase 2 (Docker+CI/CD) — complete; defers to README | Snapshot only |
| `SUPABASE_QUICK_START.md` | Supabase setup walkthrough — **contains live credentials and Supabase URL** | ⚠️ See note below |

---

## 4. Token Optimization — What to Read vs Skip

### Always read (session start)
1. `AGENTS.md` (root)
2. `ai-networking-education-center/AGENTS.md` (if editing app)
3. `ai-networking-education-center/README.md`
4. `ai-networking-education-center/CLAUDE.md`
5. `docs/internal/REBRAND_REFRAME_STATUS.md` (if doing product/content work)
6. `ROADMAP.md` (if doing roadmap/strategy work)

### Skip unless specifically needed
- `docs/archive/root-history/*` — all superseded; context now lives in `ROADMAP.md` and `REBRAND_REFRAME_STATUS.md`
- `IMPLEMENTATION_GUIDE.md`, `IMPLEMENTATION_SUMMARY.md`, `PHASE_1_SETUP.md`, `PHASE_2_SETUP.md` — all defer to `README.md`; useful only as historical context

### Prompts (reference when scaffolding)
- `ai-networking-education-center/docs/prompts/new-module.md` — use when adding a new module
- `ai-networking-education-center/docs/prompts/vault-sync.md` — use when syncing vault notes

---

## 5. Issues and Recommendations

### ⚠️ SUPABASE_QUICK_START.md — credential exposure
This file contains the live Supabase project URL and a publishable API key inline in code examples and curl commands. The key is labeled "publishable" (low-risk) but the project URL and key are exposed.

**Recommendation:** Either redact the credentials to use `$VITE_SUPABASE_URL` and `$VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` env var placeholders, or move the file to `docs/archive/` since its operational content is now covered by `README.md` and `COMPLETE_SETUP_GUIDE.md`.

### 📦 5 snapshot `.md` files in app root
`IMPLEMENTATION_GUIDE.md`, `IMPLEMENTATION_SUMMARY.md`, `PHASE_1_SETUP.md`, `PHASE_2_SETUP.md`, and `SUPABASE_QUICK_START.md` are all referenced from `README.md` as "implementation snapshots." Each one defers to `README.md` as canonical.

**Recommendation:** Move these to `docs/archive/` (or a new `ai-networking-education-center/docs/archive/`) to reduce app root clutter and prevent future confusion about which files are authoritative.

### 📁 Two `docs/` folders — purpose is clear but asymmetric
- `docs/` at repo root: historical + internal assistant metadata. Clear purpose.
- `ai-networking-education-center/docs/`: only contains `prompts/`. Very small.

**Recommendation:** Both are fine to keep. The prompts folder is useful and correctly placed inside the app. No merge needed.

### 📋 Archive history is now fully superseded
All 7 files in `docs/archive/root-history/` are now superseded:
- `REBRAND_REFRAME_PLAN.md` → superseded by `docs/internal/REBRAND_REFRAME_STATUS.md`
- `CONTENT_REFRAME_BACKLOG.md` → superseded by `ROADMAP.md` § 14 (Prioritized Backlog)
- `ENHANCEMENT_REVIEW.md`, `APP_CONTENT_REVIEW.md`, `REFACTOR_RECOMMENDATIONS.md`, etc. → superseded by `ROADMAP.md`

These are already in archive, correctly labeled "not canonical." No action needed — just avoid reading them in new sessions.

---

## 6. Canonical Read Order for New Sessions

1. `AGENTS.md`
2. `ai-networking-education-center/AGENTS.md` ← app-scoped Codex guidance
3. `ai-networking-education-center/README.md`
4. `ai-networking-education-center/CLAUDE.md`
5. `docs/internal/WORKLOG.md` ← check what's been done
6. `docs/internal/REBRAND_REFRAME_STATUS.md` ← if doing product/content work
7. `ROADMAP.md` ← if doing roadmap/strategy work
