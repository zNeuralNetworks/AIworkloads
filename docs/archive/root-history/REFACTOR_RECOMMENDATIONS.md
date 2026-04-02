# Refactor Recommendations: AI Networking Education Center

## Current Observations

1. **Top-level composition is manually wired and section-specific**
   - `App.tsx` imports every section directly and wraps each one with `FadeIn`, which makes composition repetitive and harder to scale when adding/removing modules.
2. **State management is centralized but monolithic**
   - `DataContext.tsx` stores all domain states in one provider and exposes many `any`-typed update functions.
   - Persistence is implemented with repeated `useEffect` blocks, one per state slice.
3. **Visualization code is duplicated in section components**
   - `PerformanceSection.tsx` duplicates chart container structure and tooltip patterns.
   - `HomeDashboard.tsx`, `ConceptsSection.tsx`, and `ProtocolDeepDive.tsx` include embedded visual primitives that could be generalized.
4. **Educational content and presentation are tightly coupled**
   - Narrative text and module content are embedded in large TSX files (e.g., concepts/protocol deep-dive), which complicates content authoring and reuse.

## Refactor Plan by Goal

### 1) Modular Architecture

- Introduce a feature-oriented folder structure:

```text
src/
  app/
    AppShell.tsx
    routes.ts
    providers/
      AppProviders.tsx
  features/
    architecture/
      components/
      content/
      hooks/
      state/
      index.ts
    concepts/
    protocols/
    performance/
    hardware/
  shared/
    components/
    visualization/
    hooks/
    lib/
    types/
```

- Move section registration to config:
  - Create a `moduleRegistry.ts` with `{ id, title, component, nav, order, enabled }` entries.
  - Render modules by mapping the registry in `App.tsx` or a new `AppShell`.
  - This replaces manual import + repeated `<FadeIn>` wrappers.

- Standardize boundaries:
  - `features/*`: domain-specific UI + logic.
  - `shared/*`: reusable primitives only (no domain text).
  - `content/*`: pure educational data/assets.

### 2) Reusable Visualization Components

- Build a small visualization design system in `shared/visualization`:
  - `SectionCard` (shell with title/subtitle/icon/status)
  - `MetricStatCard` (current `StatCard` extracted)
  - `ChartPanel` (consistent header, body, legend, empty state)
  - `HorizontalBarComparisonChart` (parameterized Recharts wrapper)
  - `SimulationCanvas` (layout shell + legend + control panel)

- Reuse extracted components in:
  - `PerformanceSection` for both chart panels.
  - `HomeDashboard` card visuals for consistent card behavior.
  - `ProtocolDeepDive` visual frame and controls.

- Define visualization contracts with strict types:
  - Example: `ChartSeriesConfig`, `KpiMetric`, `SimulationStatus`.
  - Remove remaining `any` from icon and protocol-related UI props.

### 3) Clear State Management

- Split global context into scoped stores:
  - `AppConfigStore` (hero/layout)
  - `ContentStore` (concepts/protocols/glossary/products)
  - `TelemetryStore` (performance/failover/hpc simulation data)
  - `AdminStore` (draft edits, unsaved changes, reset flow)

- Replace repetitive persistence effects with a generic persisted reducer hook:
  - `usePersistedReducer(key, reducer, initialState, version)`.
  - Centralize schema versioning and migration map (`v3.10 -> v3.11`).

- Enforce typed actions:
  - `dispatch({ type: 'content/conceptsUpdated', payload })`
  - Avoid direct setter exports for better traceability and easier testing.

- Add selector hooks to reduce re-renders:
  - `useGlossary()`, `usePerformanceData()`, `useHomeModules()`.

### 4) Separation of UI and Educational Content

- Move educational narrative out of TSX into content modules:
  - `features/concepts/content/coreConcepts.ts`
  - `features/protocols/content/deepDive.mdx` (or JSON + markdown fields)
  - `features/performance/content/metrics.ts`

- Keep UI components presentational:
  - Components receive typed view-models and render only.
  - Use adapters/selectors in feature hooks to transform content into UI props.

- Create content schema validation:
  - Add runtime checks with `zod` (or equivalent) before hydrating state.
  - Protect against malformed localStorage payloads and editor mistakes.

## Suggested Implementation Sequence (Low Risk)

1. **Foundation pass**
   - Add `shared/visualization` primitives and replace in `PerformanceSection` only.
2. **State pass**
   - Extract persisted store utility and migrate one domain slice (performance) first.
3. **Content pass**
   - Externalize one section’s narrative (Concepts) into content files + adapters.
4. **Composition pass**
   - Introduce module registry and map-render sections.
5. **Admin alignment**
   - Point editors to new feature stores and schema validators.

## Concrete Hotspots to Prioritize

- `ai-networking-education-center/App.tsx`
  - Replace hardcoded section list with module registry.
- `ai-networking-education-center/contexts/DataContext.tsx`
  - Break up into feature stores, typed reducers, generic persistence.
- `ai-networking-education-center/components/PerformanceSection.tsx`
  - Extract duplicate chart/container blocks into reusable chart components.
- `ai-networking-education-center/components/ConceptsSection.tsx`
  - Externalize long educational narrative and flow diagram labels.
- `ai-networking-education-center/components/ProtocolDeepDive.tsx`
  - Separate simulation logic/state model from rendering primitives.
- `ai-networking-education-center/components/HomeDashboard.tsx`
  - Extract dashboard card + progress ring into shared reusable components.

## Target Outcomes

- Faster addition of new learning modules with minimal `App` changes.
- Lower UI duplication across visualization-heavy sections.
- More testable and observable state transitions.
- Cleaner editorial workflow where content updates do not require JSX editing.
