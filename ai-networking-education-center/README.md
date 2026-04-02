# Workload Architecture Reference

An architecture decision reference for understanding how workload behavior drives infrastructure requirements.

**Live:** [learn.polymathsystem.com](https://learn.polymathsystem.com)

> **Product boundary:** This app frames workload and system behavior plus architecture implications. Detailed node, NIC, leaf-spine, and optics sizing belongs in the AI Cluster Planner inside Optics Master.
>
> **Positioning:** decision-first guidance for systems engineers, infrastructure architects, and AI/HPC platform teams.

---

## Content Structure

| Module | Title | Route / Anchor | Key Topics |
|--------|-------|---------------|------------|
| 01 | **Architecture Patterns** | `/#etherlink` | AI Ethernet fabric basics, leaf-spine topology, North-South vs East-West traffic |
| 02 | **Data Movement** | `/#concepts` | RDMA, RoCEv2, NVMe-oF, kernel bypass, GPUDirect, lossless fabric requirements |
| 03 | **Transport & Congestion** | `/#protocols` | RoCEv2 vs Ultra Ethernet (UET), PFC/ECN, DCQCN congestion control |
| 04 | **Protocol Deep Dive** | `/deep-dive` | Advanced RoCEv2/UET technical comparison |
| 05 | **Communication Patterns** | `/#load-balancing` | ECMP, DLB, CLB, packet spraying, path symmetry |
| 06 | **Transport Tradeoffs** | `/#uec` | RoCEv2 vs InfiniBand vs UET tradeoffs |
| 07 | **Performance Implications** | `/#performance` | ECN, PFC, head-of-line blocking, job completion time, tail latency |
| 08 | **Operations Playbooks** | `/operations` | Runbooks, migration matrix, module checks |
| 09 | **Platform Considerations** | `/#hardware` | Arista platforms, variants, key features |
| 10 | **Workload Types** | `/#training-vs-inference` | Traffic patterns, latency targets, scale-up vs scale-out design tradeoffs |
| 11 | **Scientific Workflow Context** | `/#hpc` | Synchronization barriers, traffic patterns, scale priorities comparison |
| 12 | **Glossary** | `/glossary` | Searchable networking terms |

All content is editable at runtime through the built-in admin surface, with edits persisted in the browser for the current origin.

> **Scope note:** quantitative sizing belongs in AI Cluster Planner, not this reference app.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2 |
| Router | React Router DOM | 7.13 |
| Build tool | Vite | 6.2 |
| Language | TypeScript | 5.8 |
| Styling | Tailwind CSS | 3.4 |
| Animation | Framer Motion | 11.0 |
| Charts | Recharts | 3.5 |
| Icons | Lucide React | 0.554 |
| PWA | vite-plugin-pwa | 1.2 |
| Container runtime | Docker (node:22-alpine) | — |
| Static server | custom Node server (`server.cjs`) | — |
| Hosting | Google Cloud Run | — |
| Optional backend | Supabase Auth + data sync | — |

> Default content is compiled from `constants/` and persisted locally in `localStorage`.
>
> When Supabase is configured, admin authentication is enabled. Broad multi-dataset sync is planned separately; today, runtime editing remains browser-local unless additional sync wiring is added.
>
> The app is a Progressive Web App (PWA) with offline asset caching via Workbox.

---

## Repository Layout

```text
AIworkloads/
├── README.md                         # Repo landing page — points to app root
├── AGENTS.md                         # Repo workflow guidance
├── .github/workflows/ci.yml          # Authoritative GitHub Actions workflow
├── .github/lighthouse-config.json    # Lighthouse CI config
├── cloudbuild.yaml                   # Cloud Build / Cloud Run source deploy path
├── docs/archive/                     # Historical reviews and planning material
├── docs/internal/                    # Assistant-specific internal metadata
└── ai-networking-education-center/
    ├── index.html                    # HTML shell
    ├── index.tsx                     # React root
    ├── App.tsx                       # Router + providers
    ├── Dockerfile                    # Build image for Cloud Run
    ├── server.cjs                    # SPA-aware static server with /health
    ├── package.json
    ├── app/
    │   └── moduleRegistry.ts         # Section registry
    ├── pages/                        # Route-level pages
    ├── components/                   # UI sections and admin UI
    ├── constants/                    # Default content
    ├── contexts/                     # Data and auth contexts
    ├── hooks/                        # UI and sync hooks
    ├── services/                     # Auth, Sentry, Supabase sync
    ├── types/                        # Shared interfaces
    ├── utils/                        # Persistence and helper utilities
    ├── scripts/                      # Claim validation scripts
    ├── e2e/                          # Playwright tests
    ├── __tests__/                    # Vitest tests
    └── supabase/migrations/          # SQL migrations
```

---

## Architecture

### Routing

The app uses `BrowserRouter` with four top-level routes:

| Route | Page Component | Content |
|-------|---------------|---------|
| `/` | `MainPage` | Main reference modules |
| `/operations` | `OperationsPage` | Operations Playbooks |
| `/glossary` | `GlossaryPage` | Glossary |
| `/deep-dive` | `DeepDivePage` | Protocol Deep Dive |

Within `MainPage`, in-page navigation uses anchor IDs and `smoothScrollTo()`. Active section state comes from `useActiveSection()` via `IntersectionObserver`.

### High-Level Component Tree

```text
App
├── ErrorBoundary
├── AuthProvider
├── DataProvider
└── BrowserRouter
    └── Routes
        ├── "/" -> MainPage
        ├── "/operations" -> OperationsPage
        ├── "/glossary" -> GlossaryPage
        └── "/deep-dive" -> DeepDivePage
```

### Module Registry

All sections are registered in `app/moduleRegistry.ts` as `ModuleRegistryItem` objects:

```ts
interface ModuleRegistryItem {
  id: string;
  anchorId: string;
  title: string;
  subtitle?: string;
  order: number;
  tocVisible: boolean;
  page: 'main' | 'operations' | 'glossary' | 'deep-dive';
  component: ComponentType | LazyExoticComponent<ComponentType>;
}
```

All section components are lazy-loaded and rendered through the registry.

### Data Flow

```text
constants/ defaults
    -> DataContext loadState / usePersistedReducer
    -> components consume useData()
    -> admin edits update context
    -> localStorage persistence
    -> optional Supabase sync when configured
```

### State Management

- Store: React Context (`DataContext`)
- Persistence: browser `localStorage`
- Schema versioning: `APP_SCHEMA_VERSION = '3.10'`
- Optional backend sync: Supabase-backed auth and selected data synchronization

### Source Attribution

Numeric claims in constants use the `claim()` helper from `utils/sourceClaims.ts`.

Validation scripts:

- `npm run check:claim-sources`
- `npm run check:claim-ids`

Cloud Build currently runs the claim-id check before Docker build.

---

## Admin Surface

The app includes an authenticated admin editing surface that updates runtime data without code changes.

**Access:** click the Settings icon in the footer.

| Field | Value |
|-------|-------|
| Authentication | Supabase magic link or Google OAuth |
| Local persistence | Browser `localStorage` |
| Shared sync | Not yet wired for all editable datasets |

### Editor Areas

- Global config
- Home layout
- Architecture patterns
- Data movement
- Transport and congestion
- Transport tradeoffs
- Platform considerations
- Scientific workflow context
- Performance implications
- Glossary
- Future improvements

**Reset:** the admin panel can reset runtime edits back to compiled defaults.

---

## Development Guide

### Local Workflow

Start from repo root:

```bash
cd "/Users/theorajan/local builds/Aiworkloads"
git checkout main
git pull --ff-only origin main
cd ai-networking-education-center
```

### Quick Start

```bash
npm ci
npx playwright install --with-deps chromium
npm run dev
```

App URL: `http://localhost:3000`

### Quality Checks

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

`npm run test:e2e` requires Playwright's Chromium binary to be installed locally.

### Adding or Editing Content

Default content lives in `constants/`.

Typical flow:

1. Add or update content in the relevant file under `constants/`
2. Export from `constants/index.ts` if needed
3. Extend `DataContext.tsx` if a new persisted shape is required
4. Register new sections in `app/moduleRegistry.ts`
5. Render through the consuming component
6. Add an admin editor if runtime editing is required

### Key Patterns

- `ICON_MAP` in `constants/icons.ts` maps serializable icon keys to Lucide components
- `GlossaryTerm` wraps known technical terms with inline glossary tooltips
- `FadeIn` provides intersection-observer-triggered reveal animations

---

## Build & Deployment

### Docker

The container build compiles the app and serves it with a small SPA-aware Node runtime:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache tini
COPY --from=build /app/dist ./dist
COPY server.cjs ./server.cjs
ENV PORT=8080
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.cjs"]
```

Local run:

```bash
docker build -t ai-networking-center:local .
docker run --rm -p 8080:8080 ai-networking-center:local
```

Runtime checks:

- `GET /health` returns `OK`
- Browser routes such as `/operations` load through SPA fallback
- JS and CSS assets are served with correct MIME types

### GitHub Actions

Authoritative workflow:

- `/.github/workflows/ci.yml`

The workflow:

- runs lint, build, unit tests, and e2e tests from `ai-networking-education-center/`
- builds and pushes Docker image on `main`
- deploys to Cloud Run
- runs Lighthouse on pull requests

### Cloud Build Pipeline

`cloudbuild.yaml` remains at repo root because it orchestrates the app directory from the outer repo layout.

### Cloud Run

Current deployment posture:

| Setting | Value |
|---------|-------|
| GCP Project | `infralens-486218` |
| Service name | `aiworkloads` or `ai-networking-center` depending on deploy path |
| Region | `europe-west1` |
| Memory | `512Mi` |
| CPU | `1` |
| Port | `8080` |

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `PORT` | Runtime port injected by Cloud Run |
| `VITE_SUPABASE_URL` | Enables Supabase auth and sync |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase publishable key |
| `VITE_SENTRY_DSN` | Optional Sentry DSN |
| `ANALYZE` | Optional bundle analysis flag |

---

## Supabase Schema

Use either of these when initializing the backend side:

- `SUPABASE_MIGRATION.sql`
- `supabase/migrations/001_init_tables.sql`

Apply migration in Supabase SQL Editor, then verify the required tables exist.

---

## Related Docs

Implementation snapshots retained in the app directory:

- `COMPLETE_SETUP_GUIDE.md`
- `IMPLEMENTATION_GUIDE.md`
- `IMPLEMENTATION_SUMMARY.md`
- `PHASE_1_SETUP.md`
- `PHASE_2_SETUP.md`

This README is the canonical product and contributor overview for the app.
