# CLAUDE.md — Scientific Workflow Architecture App

## Stack
React 19 · TypeScript 5.8 · Vite · Tailwind CSS · Framer Motion · Vitest

---

## Content Rules

### Product Boundary
This app is an architecture reference layer for workload behavior and infrastructure implications.
Do not add sizing calculators or implementation count logic here; those belong in Optics Master / AI Cluster Planner.


### No Silicon Codenames
Do not use ASIC silicon codenames (e.g., Strata, Jericho) anywhere in user-facing content.
Reference capabilities by EOS feature name or Arista product family instead —
e.g., "Arista 7050X-series" or "supported in EOS" rather than "Strata-family ASICs only."

### Vault is the Authoritative Source
For Arista-specific definitions, thresholds, failure-mode context, and feature behavior,
use the PolymathOS vault (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/PolymathOS/`)
as the primary reference — not generic web sources.

### Content Lives in `constants/`
Never hardcode reference content inline in components. All data belongs in `constants/`:
- Glossary terms → `constants/glossary.ts` (Record<string, string>)
- Concepts, protocols, products, operations → their respective `constants/*.ts` files
- Category sections in glossary must be maintained — place new terms in the correct section comment block

### Source Attribution
When adding or updating data values with a traceable source, use the `claim()` helper:
```ts
import { claim } from '../utils/sourceClaims';
description: claim('text here', { sourceUrl, sourceTitle, sourceRevisionOrDate, verificationStatus })
```
Plain strings are acceptable for general reference content without a specific source.

`verificationStatus` values:
- `verified` — confirmed via Arista docs, EOS config output, or direct lab testing
- `vendor-claim` — stated by Arista/NVIDIA but not independently validated
- `estimated` — derived, approximate, or sourced from secondary/community references

After adding or updating `claim()` values, run the validation scripts:
```bash
node scripts/validate-claim-sources.mjs
node scripts/validate-claim-ids.mjs
```
`claimId` values must be unique across the entire codebase.

---

## Code Conventions

### TypeScript
- No `any` in component or constants code. `any` is only acceptable in admin glue code.
- Use existing types from `types/` — do not duplicate interfaces inline.
- Unused variables must use `_` prefix (`_unused`) to satisfy the ESLint rule.

### Components
- One component per file; filename matches component name (PascalCase).
- All components typed as `React.FC<Props>` with a named `Props` interface above the component.
- Props with optional classNames default to `className = ''` in the destructure.
- Wrap inline technical terms with `<GlossaryTerm term="TermName" />` when the term exists in the glossary. Only wrap a term if the key exists verbatim in `constants/glossary.ts` — the component silently falls back to plain text for missing keys. Check before adding new wrappers; if the term is missing, add it to the glossary first.

### New Sections
Register new architecture reference domains in `app/moduleRegistry.ts` — do not add ad-hoc renders in `App.tsx`.

### Styling
- Tailwind utility classes only — no CSS modules, no inline style objects.
- Follow the existing dark theme palette: `bg-[#0F1117]`, `bg-slate-900`, `border-white/5`.
- Use `sm:` / `md:` / `lg:` responsive prefixes consistently.

### Import Order
1. React core (`react`, `react-dom`)
2. Context and hooks (`../contexts/`, `../hooks/`)
3. Icons (`lucide-react`)
4. Local components (`../components/`, `./`)
5. Constants and utils (`../constants`, `../utils/`)

---

## Verification (Always Run After Changes)

```bash
npm run lint    # no new errors
npm run build   # zero TypeScript errors required
npm run test    # all 23 tests must pass
```

Run all three before considering any task complete.

---

## What NOT to Do
- Do not add Redux, Zustand, or any new state management library — the DataContext + usePersistedReducer pattern is sufficient.
- Do not create new utility files for one-off operations.
- Do not modify `Templates/`, `Scripts/`, `Attachments/`, `Dashboards/`, or `Excalidraw/` in the vault.
- Do not skip `npm run build` after glossary or type changes — glossary is a plain Record but other constants have strict shapes.
