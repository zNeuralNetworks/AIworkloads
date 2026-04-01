# Scientific Workflow Architecture

An architecture reference layer for understanding how workloads create infrastructure requirements.

**Live:** [learn.polymathsystem.com](https://learn.polymathsystem.com)

> **Product boundary:** This app frames workload/system behavior and architecture implications. Detailed node/NIC/leaf/spine/optics sizing belongs in the AI Cluster Planner inside Optics Master.

---

## Content Structure

| Module | Title | Route / Anchor | Key Topics |
|--------|-------|---------------|------------|
| 01 | **Architecture Patterns** | `/#etherlink` | AI Ethernet fabric basics, leaf-spine topology, North-South vs East-West traffic |
| 02 | **Data Movement** | `/#concepts` | RDMA, RoCEv2, NVMe-oF, kernel bypass, GPUDirect, lossless fabric requirements |
| 03 | **Transport & Congestion** | `/#protocols` | RoCEv2 vs Ultra Ethernet (UET), PFC/ECN, DCQCN congestion control |
| 04 | **Protocol Deep Dive** | `/deep-dive` | Advanced RoCEv2/UET technical comparison — separate page |
| 05 | **Communication Patterns** | `/#load-balancing` | ECMP, DLB, CLB, packet spraying, path symmetry |
| 06 | **Transport Tradeoffs** | `/#uec` | RoCEv2 vs InfiniBand vs UET — technology tradeoffs |
| 07 | **Performance Implications** | `/#performance` | ECN, PFC, head-of-line blocking, job completion time, tail latency |
| 08 | **Operations Playbooks** | `/operations` | Vendor-neutral runbooks, migration matrix, module checks — separate page |
| 09 | **Platform Considerations** | `/#hardware` | Arista 7060X, 7800R, 7700R DES, 7280R3, 7280R3A — specs, variants, key features |
| 10 | **Workload Types** | `/#training-vs-inference` | Traffic patterns, latency targets, scale-up vs scale-out design tradeoffs |
| 11 | **Scientific Workflow Context** | `/#hpc` | Synchronization barriers, traffic patterns, scale priorities comparison |
| 12 | **Glossary** | `/glossary` | 158+ searchable networking terms — separate page |

All content is editable at runtime via the built-in [Admin CMS](#admin-cms).

> **Scope note:** quantitative sizing (nodes/NICs/leaf-spine/optics) belongs in AI Cluster Planner, not this reference app.

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
| Static server | serve (npm) | — |
| Container | Docker (node:22-alpine) | — |
| Hosting | Google Cloud Run | — |

> **No backend.** All data is client-side: defaults in `constants/`, overrides persisted to `localStorage`.
>
> Tailwind CSS is installed as an npm package and processed at build time. `index.html` also includes the Tailwind CDN as a runtime fallback in case the build-time CSS regresses.
>
> The app is a **Progressive Web App (PWA)** — installable on desktop and mobile with offline asset caching via Workbox.

---

## Repository Layout

```
AIworkloads/
├── README.md
├── cloudbuild.yaml             # Cloud Build pipeline — lint, validate, build, push, deploy
└── ai-networking-education-center/
    ├── index.html              # HTML shell — Google Fonts, Tailwind CDN fallback
    ├── index.tsx               # React root (createRoot → App)
    ├── App.tsx                 # BrowserRouter + Routes → MainPage / OperationsPage / GlossaryPage / DeepDivePage
    ├── vite.config.ts          # Vite config — port 3000, @-alias, PWA plugin, bundle visualizer
    ├── tsconfig.json           # TypeScript config — ESNext, react-jsx, bundler resolution
    ├── Dockerfile              # 2-stage build: compile → serve on :8080
    ├── package.json
    │
    ├── app/
    │   └── moduleRegistry.ts   # Central registry of all sections (id, anchorId, title, page, component)
    │
    ├── pages/
    │   ├── MainPage.tsx        # "/" — all main-page modules rendered from MODULE_REGISTRY
    │   ├── OperationsPage.tsx  # "/operations" — standalone Operations Playbooks page
    │   ├── GlossaryPage.tsx    # "/glossary" — standalone Glossary page
    │   └── DeepDivePage.tsx    # "/deep-dive" — standalone Protocol Deep Dive page
    │
    ├── constants/              # All default data (single source of truth)
    │   ├── index.ts            # Re-exports all constants
    │   ├── icons.ts            # ICON_MAP — string keys → Lucide React components
    │   ├── navigation.ts       # NAVIGATION — nav items for the floating dock
    │   ├── modules.ts          # DEFAULT_APP_CONFIG, DEFAULT_HOME_MODULES
    │   ├── concepts.ts         # SCALING_CONCEPTS, CORE_CONCEPTS, TOPOLOGY_SELECTION
    │   ├── protocols.ts        # PROTOCOL_CONCEPTS, CONGESTION_PROCEDURE
    │   ├── performance.ts      # PERFORMANCE_DATA, FAILOVER_DATA
    │   ├── comparison.ts       # COMPARISON_TABLE
    │   ├── products.ts         # PRODUCTS
    │   ├── glossary.ts         # GLOSSARY (158+ terms)
    │   ├── hpcChecklist.ts     # HPC_CHECKLIST_DEFAULT, VALIDATION_PHASES
    │   ├── loadBalancing.ts    # Load balancing content
    │   ├── operations.ts       # OPERATIONS_RUNBOOKS, OPERATIONS_PRINCIPLES, etc.
    │   ├── trainingVsInference.ts  # TVI_COMPARISON, TVI_DESIGN_NOTES
    │   └── future.ts           # FUTURE_IMPROVEMENTS
    │
    ├── types/                  # TypeScript interfaces
    │   ├── index.ts            # Re-exports all types
    │   ├── ui.ts               # NavItem, AppConfig, HomeModule
    │   ├── content.ts          # ProductData, ConceptData, ChartData, HPCItem, etc.
    │   └── admin.ts            # FeedbackItem
    │
    ├── content/                # Rich structured content for animated sections
    │
    ├── contexts/
    │   └── DataContext.tsx     # Client-side CMS — localStorage persistence, schema version guard
    │
    ├── components/
    │   ├── Navigation.tsx           # Floating bottom dock + scrollspy active state
    │   ├── TableOfContents.tsx      # Sticky sidebar — section links
    │   ├── HomeDashboard.tsx        # Hero + Bento-grid module launcher
    │   ├── SearchPalette.tsx        # Cmd-K full-site search palette
    │   ├── StickyModuleHeader.tsx   # Module title that sticks at top while scrolling
    │   ├── NextSectionCTA.tsx       # "Next: …" call-to-action between sections
    │   ├── ArchitectureSection.tsx  # Scaling concepts + SVG topology visual
    │   ├── ConceptsSection.tsx      # RDMA, NVMe, RoCEv2 cards with animations
    │   ├── ProtocolsSection.tsx     # Tabbed RoCEv2 vs UET comparison
    │   ├── ProtocolDeepDive.tsx     # Advanced protocol detail
    │   ├── LoadBalancingSection.tsx # ECMP, DLB, CLB, packet spraying
    │   ├── ComparisonTable.tsx      # Feature matrix (Ethernet vs legacy)
    │   ├── PerformanceSection.tsx   # Recharts efficiency/failover graphs
    │   ├── OperationsPlaybooksSection.tsx  # Day-2 runbooks + migration matrix
    │   ├── HardwareSection.tsx      # Arista platform selector + specs
    │   ├── TrainingVsInferenceSection.tsx  # Training vs inference design comparison
    │   ├── HPCSection.tsx           # Scientific workflow context and AI/HPC divergence
    │   ├── GlossarySection.tsx      # Searchable 3-column term grid
    │   ├── GlossaryTerm.tsx         # Inline hover-tooltip for any term
    │   ├── RoadmapSection.tsx       # Future improvements roadmap
    │   ├── SourceBadge.tsx          # Citation badge for claim-linked values
    │   ├── FadeIn.tsx               # IntersectionObserver + Framer Motion reveal
    │   ├── Footer.tsx               # Footer + hidden admin trigger (Settings icon)
    │   ├── Hero.tsx                 # Hero section
    │   ├── Loading.tsx              # Spinner
    │   ├── ErrorBoundary.tsx        # Top-level error boundary
    │   └── admin/
    │       ├── AdminDashboard.tsx   # Modal container + auth gate (in components/, not admin/)
    │       ├── AdminLogin.tsx       # Password check
    │       ├── AdminSidebar.tsx     # 11-tab navigation
    │       ├── AdminEditors.tsx     # Editor dispatcher
    │       └── editors/             # One editor component per content section
    │           ├── ConfigEditor.tsx
    │           ├── LayoutEditor.tsx
    │           ├── ArchitectureEditor.tsx
    │           ├── ConceptsEditor.tsx
    │           ├── ProtocolEditor.tsx
    │           ├── ComparisonEditor.tsx
    │           ├── ProductsEditor.tsx
    │           ├── HPCEditor.tsx
    │           ├── PerformanceEditor.tsx
    │           ├── GlossaryEditor.tsx
    │           └── FutureEditor.tsx
    │
    ├── hooks/
    │   ├── useActiveSection.ts      # IntersectionObserver → active nav item
    │   ├── usePersistedReducer.ts   # useReducer + localStorage persistence
    │   ├── useProtocolSimulation.ts # Protocol animation state machine
    │   └── useSearchPalette.ts      # Search palette open/close + query state
    │
    ├── utils/
    │   ├── scroll.ts                # smoothScrollTo()
    │   ├── sourceClaims.ts          # claim() helper for source-linked values
    │   ├── loadState.ts             # localStorage load with version check
    │   ├── safeStorage.ts           # localStorage wrapper (quota-safe)
    │   └── arrayMutate.ts           # Immutable array helpers for admin editors
    │
    └── scripts/
        ├── validate-claim-ids.mjs   # CI: ensures no unsourced numeric literals in key files
        └── validate-claim-sources.mjs  # CI: ensures claim() coverage in constants
```

---

## Architecture

### Routing

The app uses **React Router DOM v7** with `BrowserRouter`. Four top-level routes split content across pages:

| Route | Page Component | Content |
|-------|---------------|---------|
| `/` | `MainPage` | All main modules (architecture through HPC) |
| `/operations` | `OperationsPage` | Operations Playbooks — standalone |
| `/glossary` | `GlossaryPage` | Glossary — standalone |
| `/deep-dive` | `DeepDivePage` | Protocol Deep Dive — standalone |
| `*` | — | Redirects to `/` |

Within `MainPage`, in-page navigation uses anchor IDs and `smoothScrollTo()`. The active section is tracked by `useActiveSection()` via `IntersectionObserver`.

### High-Level Component Tree

```
App
├── ErrorBoundary
└── DataProvider (React Context)
    └── BrowserRouter
        └── Routes
            ├── Route "/" → MainPage
            │   ├── Navigation            (floating dock, scrollspy)
            │   ├── TableOfContents       (sticky sidebar)
            │   ├── SearchPalette         (Cmd-K search)
            │   ├── StickyModuleHeader    (section title — sticks on scroll)
            │   ├── HomeDashboard         id="intro"
            │   ├── [for each main module in MODULE_REGISTRY]
            │   │   └── FadeIn > Suspense > SectionComponent
            │   │       Modules (in order):
            │   │       ArchitectureSection       id="etherlink"
            │   │       ConceptsSection           id="concepts"   // Data Movement
            │   │       ProtocolsSection          id="protocols"  // Transport & Congestion
            │   │       LoadBalancingSection      id="load-balancing" // Communication Patterns
            │   │       ComparisonTable           id="uec"       // Transport Tradeoffs
            │   │       PerformanceSection        id="performance" // Performance Implications
            │   │       HardwareSection           id="hardware"
            │   │       TrainingVsInferenceSection id="training-vs-inference" // Workload Types
            │   │       HPCSection                id="hpc"       // Scientific Workflow Context
            │   ├── NextSectionCTA        (between sections)
            │   ├── Footer
            │   └── AdminDashboard        (modal, conditionally rendered)
            ├── Route "/operations" → OperationsPage
            ├── Route "/glossary"   → GlossaryPage
            └── Route "/deep-dive"  → DeepDivePage
```

### Module Registry

All sections are registered in `app/moduleRegistry.ts` as `ModuleRegistryItem` objects. Each entry declares:

```typescript
interface ModuleRegistryItem {
  id: string;           // e.g. "load-balancing"
  anchorId: string;     // DOM id, e.g. "load-balancing"
  title: string;        // Display name in TOC/nav
  subtitle?: string;    // One-line preview for NextSectionCTA
  order: number;        // Render order
  tocVisible: boolean;  // Whether to show in TableOfContents
  page: 'main' | 'operations' | 'glossary' | 'deep-dive';
  component: ComponentType | LazyExoticComponent<ComponentType>;
}
```

All section components are **lazy-loaded** (`React.lazy`) and wrapped in `<Suspense>` in `MainPage`.

### Component Reference

| Component | Anchor ID | Data from `useData()` | Notable Pattern |
|-----------|----------|----------------------|-----------------|
| `HomeDashboard` | `intro` | `homeModules`, `appConfig` | Bento-grid module launcher |
| `ArchitectureSection` | `etherlink` | `scalingConcepts` | SVG animated leaf-spine diagram |
| `ConceptsSection` | `concepts` | `coreConcepts` | Data movement primitives (RDMA / RoCEv2 / NVMe-oF) |
| `ProtocolsSection` | `protocols` | `protocolConcepts` | Transport and congestion decision tabs |
| `ProtocolDeepDive` | — (own page) | — | Advanced content on `/deep-dive` |
| `LoadBalancingSection` | `load-balancing` | — | Communication pattern and path-distribution guidance |
| `ComparisonTable` | `uec` | `comparisonTable` | Transport tradeoff matrix rows |
| `PerformanceSection` | `performance` | `performanceData`, `failoverData` | Recharts BarChart + LineChart |
| `OperationsPlaybooksSection` | — (own page) | — | Runbooks + migration matrix on `/operations` |
| `HardwareSection` | `hardware` | `products` | Product selector, `DescriptionRenderer` auto-glossary |
| `TrainingVsInferenceSection` | `training-vs-inference` | — | Workload type comparison (training vs inference) |
| `HPCSection` | `hpc` | `hpcChecklist` | Scientific workflow context and divergence from AI training |
| `GlossarySection` | — (own page) | `glossary` | Searchable 3-col grid on `/glossary` |

### Data Flow

```
constants/
  └── Default values (CORE_CONCEPTS, PRODUCTS, GLOSSARY, ...)
        │
        ▼
DataContext.tsx  (loadState / usePersistedReducer)
  ├── Check localStorage for 'app_<key>'
  │     ├── Found + version matches → use saved value
  │     └── Not found / version mismatch → use constants default
  │
  └── Exposes via useData() hook
        │
        ▼
Components  (useData())
  └── Render UI from context data
        │
        ▼  (Admin edits)
DataContext update functions (updateGlossary, updateProducts, ...)
  └── Persist → localStorage via safeStorage helpers
```

### State Management

- **Store:** React Context (`DataContext`) — no Redux, no Zustand
- **Persistence:** Browser `localStorage` (JSON-serialized). Simple state uses `loadState()` directly; complex state uses `usePersistedReducer()` (a `useReducer` wrapper that syncs to localStorage).
- **Schema versioning:** `APP_SCHEMA_VERSION = '3.10'` — on mismatch the entire store resets to `constants/` defaults
- **No server state:** Clearing `localStorage` resets the app to its compiled defaults

### Source Attribution

Numeric claims in constants are wrapped with the `claim()` helper from `utils/sourceClaims.ts`:

```typescript
import { claim } from '../utils/sourceClaims';

desc: claim('800Gbps per port, 128×800G line-rate', {
  sourceUrl: '...',
  sourceTitle: 'Arista 7800R Datasheet',
  sourceRevisionOrDate: '2024-Q3',
  verificationStatus: 'vendor-claim',
})
```

Two CI scripts enforce coverage:
- `npm run check:claim-sources` — verifies `claim()` is used in key constant fields
- `npm run check:claim-ids` — verifies no unsourced numeric literals with unit suffixes exist in target files

---

## Admin CMS

The app ships with a password-protected content management system that edits every section at runtime without code changes.

**Access:** Click the **Settings icon** (⚙) in the page footer.

| Field | Value |
|-------|-------|
| Password | `19901991` (or `VITE_ADMIN_PASSWORD` env var) |
| Storage | Browser `localStorage` |
| Backend | None |

### Editor Tabs

| Tab | Controls |
|-----|---------|
| Global Config | Hero title and subtitle (`AppConfig`) |
| Home Layout | Bento-grid module cards (`HomeModule[]`) |
| Architecture Patterns | Scaling concept cards (`ScalingConcept[]`) |
| Data Movement | RDMA, NVMe, RoCEv2 cards (`ConceptData[]`) |
| Transport & Congestion | Protocol comparison cards (`ProtocolConcept[]`) |
| Transport Tradeoffs | Feature comparison table rows (`ComparisonRow[]`) |
| Platform Considerations | Hardware platform cards + variants (`ProductData[]`) |
| Scientific Workflow Context | AI/HPC context checklist items (`HPCItem[]`) |
| Performance Implications | Chart data — efficiency and failover (`ChartData[]`) |
| Glossary Terms | All 158+ term definitions (`Record<string, string>`) |
| Suggested Improvements | Roadmap items by category (`FutureCategory[]`) |

**Reset:** A "Reset to Defaults" button in the admin panel clears all `localStorage` keys and reloads the page, restoring the compiled defaults from `constants/`.

> Admin changes persist across browser sessions until reset. They do **not** affect other users or the deployed container — data never leaves the client.

---

## Development Guide

### Prerequisites & Quick Start

```bash
# Node.js 18+ required
cd ai-networking-education-center
npm install
npm run dev        # → http://localhost:3000
```

```bash
npm run build      # Production build → dist/
npm run preview    # Preview dist/ locally
npm run test       # Vitest unit tests (23 tests)
npm run test:e2e   # Playwright end-to-end tests
```

### Validation Scripts

Run after any change to constants or source claims:

```bash
node scripts/validate-claim-sources.mjs   # must print "All source coverage checks passed."
node scripts/validate-claim-ids.mjs       # must print "Numeric claim validation passed."
```

Both scripts are also run as Cloud Build Step 0 before the Docker build.

### Adding or Editing Content

All default content lives in `constants/`. The pattern for adding a new concept, product, or glossary term:

1. **Add to the relevant file** in `constants/` (e.g., `concepts.ts`, `products.ts`, `glossary.ts`)
2. **Export from `constants/index.ts`** if it's a new export
3. **Add to `DataContext.tsx`** if the new data shape needs a new state variable and `localStorage` key
4. **Register in `app/moduleRegistry.ts`** if it's a new section
5. **Render in the component** that consumes that data via `useData()`
6. **Add an editor** in `components/admin/editors/` if runtime editing is needed

### ICON_MAP Pattern

Icons cannot be JSON-serialized, so all icon references use string keys mapped to Lucide React components:

```typescript
// constants/icons.ts
export const ICON_MAP: Record<string, React.ElementType> = {
  "Server": Server,
  "Network": Network,
  "Database": Database,
  // ...70+ mappings
};

// In a component:
const Icon = ICON_MAP[item.iconKey] || Server;
<Icon size={24} />
```

To use a new icon: import it from `lucide-react` and add the mapping to `ICON_MAP` in `constants/icons.ts`.

### GlossaryTerm Pattern

Wrap any technical term with `<GlossaryTerm>` to show a hover tooltip with the term's definition:

```tsx
import GlossaryTerm from './GlossaryTerm';

<GlossaryTerm term="RoCEv2">RoCE</GlossaryTerm>
// → renders "RoCE" with a tooltip showing the GLOSSARY["RoCEv2"] definition
```

`HardwareSection` uses `DescriptionRenderer` which automatically wraps known glossary terms in product description text.

### FadeIn Animation

Wrap any section in `<FadeIn>` for an IntersectionObserver-triggered reveal:

```tsx
import FadeIn from './FadeIn';

<FadeIn direction="up">
  <MySection />
</FadeIn>
```

Supports `direction`: `"up"` | `"down"` | `"left"` | `"right"` | `"none"`. Triggers once on first viewport entry.

---

## Build & Deployment

### Docker

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build          # → /app/dist

# Stage 2: Serve
FROM node:22-alpine
RUN npm install -g serve
COPY --from=build /app/dist ./dist
ENV PORT=8080
CMD ["serve", "-s", "dist", "-l", "8080"]
```

```bash
docker build -t aiworkloads .
docker run -p 8080:8080 aiworkloads
```

### Cloud Build Pipeline

`cloudbuild.yaml` defines the CI/CD steps run on every push to `main`:

1. **validate** — `npm run check:claim-sources` + `npm run check:claim-ids`
2. **build** — Docker image build
3. **push** — Push image to Artifact Registry
4. **deploy** — `gcloud run deploy`

### Google Cloud Run — infralens-486218

| Setting | Value |
|---------|-------|
| GCP Project | `infralens-486218` |
| Service name | `aiworkloads` |
| Region | `europe-west1` |
| Min instances | `1` |
| Max instances | `3` |
| Memory | `512Mi` |
| CPU | `1` |
| Port | `8080` |
| Access | Public (unauthenticated) |
| Custom domain | `learn.polymathsystem.com` |
| DNS | `CNAME → ghs.googlehosted.com` |
| SSL | Cloud Run managed (auto-provisioned) |
| Image registry | `europe-west1-docker.pkg.dev/infralens-486218/cloud-run-source-deploy/aiworkloads` |

**Deploy from source** (builds via Cloud Build, no local Docker required):

```bash
cd ai-networking-education-center

gcloud run deploy aiworkloads \
  --source . \
  --project=infralens-486218 \
  --region=europe-west1 \
  --min-instances=1 \
  --max-instances=3 \
  --memory=512Mi \
  --cpu=1 \
  --concurrency=80 \
  --timeout=60s \
  --allow-unauthenticated
```

### Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `PORT` | Runtime (Cloud Run injects) | Port the `serve` process binds to |
| `VITE_ADMIN_PASSWORD` | Build-time (`.env` → Vite) | Overrides the default admin panel password |
| `ANALYZE` | Build-time | Set to `true` to open the Rollup bundle visualizer after build |

`.env` file (not committed — gitignored):
```
VITE_ADMIN_PASSWORD=your-password-here
```

---

## Data Schema Reference

Key TypeScript interfaces from `types/`:

```typescript
// types/ui.ts
interface AppConfig {
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
}

interface HomeModule {
  id: string;
  title: string;
  subtitle: string;
  iconKey: string;         // Key into ICON_MAP
  progress: number;        // 0–100, displayed as progress bar
  href: string;            // Route or anchor e.g. "/glossary", "#concepts"
  color: string;           // Tailwind color name e.g. "blue"
}

// types/content.ts
// Many string fields accept string | SourceLinkedValue for source attribution.
interface SourceLinkedValue {
  claimId?: string;
  value: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceRevisionOrDate: string;
  verificationStatus: 'verified' | 'vendor-claim' | 'estimated';
}

interface ConceptData {
  id: string;
  title: string;
  fullName: string;
  description: string | SourceLinkedValue;
  iconKey: string;
  features: Array<string | SourceLinkedValue>;
}

interface ProtocolConcept {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconKey: string;
  color: string;
  mechanisms: { label: string; detail: string }[];
  pros: string[];
  cons: string[];
}

interface ProductData {
  id: string;
  series: string;
  role: string;
  iconKey: string;
  desc: string | SourceLinkedValue;
  specs: Array<string | SourceLinkedValue>;
  scale: string;
  datasheetUrl?: string;
  keyFeatures?: ProductFeature[];
  variants?: ProductVariant[];
}

interface ChartData {              // Used for both performanceData and failoverData
  name: string | SourceLinkedValue;
  value?: number;
  time?: number;
  efficiency?: number;
  delay?: number;
  fill?: string;
}

interface ComparisonRow {
  feature: string;
  modern: string;
  legacy: string;
  advantage: "modern" | "legacy" | "neutral";
}

interface ScalingConcept {
  title: string;
  desc: string | SourceLinkedValue;
  details: string | SourceLinkedValue;
  iconKey: string;
  color: string;
  pinnacle: string;
  legacy: string;
}

interface HPCItem {
  testId: string;
  name: string;
  points: Array<string | SourceLinkedValue>;
}

interface FutureCategory {
  category: string;
  iconKey: string;
  items: FutureItem[];
}

interface FutureItem {
  title: string;
  description: string;
  iconKey: string;
}
```

---

## LocalStorage Keys Reference

All keys are prefixed `app_`. A version mismatch on `app_version` clears the entire store and resets to `constants/` defaults.

Simple state is loaded via `loadState(key, default, version)`. Complex state uses `usePersistedReducer(key, reducer, initialState, version)` — these keys have a `_state` suffix.

| Key | Type | Source Constant |
|-----|------|----------------|
| `app_version` | `string` (`'3.10'`) | Hardcoded in `DataContext` |
| `app_config` | `AppConfig` | `DEFAULT_APP_CONFIG` |
| `app_home_modules` | `HomeModule[]` | `DEFAULT_HOME_MODULES` |
| `app_glossary` | `Record<string, string>` | `GLOSSARY` |
| `app_products` | `ProductData[]` | `PRODUCTS` |
| `app_future` | `FutureCategory[]` | `FUTURE_IMPROVEMENTS` |
| `app_feedback` | `FeedbackItem[]` | `[]` (empty default) |
| `app_performance_state` | `ChartData[]` (perf + failover) | `PERFORMANCE_DATA`, `FAILOVER_DATA` |
| `app_protocols_state` | `ProtocolConcept[]` | `PROTOCOL_CONCEPTS` |
| `app_hpc_state` | `HPCItem[]` | `HPC_CHECKLIST_DEFAULT` |
| `app_scaling_state` | `ScalingConcept[]` | `SCALING_CONCEPTS` |
| `app_core_concepts_state` | `ConceptData[]` | `CORE_CONCEPTS` |
| `app_comparison_state` | `ComparisonRow[]` | `COMPARISON_TABLE` |
