# Rebrand / Reframe Status

## Purpose

This file is the canonical Codex handoff for the current rebrand and reframe work.
Use it before making additional changes to positioning, content hierarchy, or module copy.

## Current repo state

The repository has already completed structural cleanup:

- `ai-networking-education-center/` is the single application root
- `/.github/workflows/ci.yml` is the only authoritative GitHub Actions workflow
- root historical markdown moved to `docs/archive/root-history/`
- assistant metadata moved to `docs/internal/assistant/`

The app has also completed part of the framing shift from "education center" to "decision-oriented architecture reference."

## What has already landed

### Positioning and naming

- Hero content is already reframed in `constants/modules.ts`
  - `heroLabel`: `Architecture Decision Reference`
  - `heroTitle`: `Scientific Workflow`
  - `heroHighlight`: `Architecture`
- App README is restored as a rich product README and now reflects current auth, Docker, and CI behavior

### Navigation and IA

- Navigation labels are already partially decision-oriented in `constants/navigation.ts`
  - `Workload Types`
  - `Communication Patterns`
  - `Data Movement`
  - `Transport & Congestion`
  - `Transport Tradeoffs`
  - `Performance Implications`
  - `Architecture Patterns`
  - `Operational Runbooks`
- Module registry titles and subtitles are already partially reframed in `app/moduleRegistry.ts`

### Operational content

- The operations module is stronger than the older archive notes assumed
- `constants/operations.ts` already contains four meaningful runbooks:
  - PFC storm / HOL blocking
  - ECN mark rate instability
  - high tail latency during all-reduce
  - throughput collapse during incast
- It also already includes:
  - operations principles
  - migration recommendation rows
  - operations checks

## What is still incomplete

The core gap is no longer top-level naming. The remaining work is module-depth and decision framing.

### 1. Vendor-neutral framing still needs one explicit anchor

The app is still heavily useful for Arista-centric audiences, but it needs one dedicated vendor-neutral architecture lens section or panel to avoid being perceived as a vendor explainer.

This does not require removing Arista-specific content.
It requires adding one explicit abstraction layer above platform-specific guidance.

## Recommended next implementation sequence

### Completed: Phases A-D

The following have landed in the live app:

- `components/InfrastructureImplicationsPanel.tsx`
- `components/SoWhatCallout.tsx`
- workload profile rewrite in `constants/trainingVsInference.ts` and `components/TrainingVsInferenceSection.tsx`
- communication-pattern rewrite in `constants/loadBalancing.ts` and `components/LoadBalancingSection.tsx`
- data-movement lifecycle rewrite in `constants/concepts.ts` and `components/ConceptsSection.tsx`

The app now has:

- workload profiles instead of a binary training-vs-inference framing
- implication-first communication pattern cards before load-balancing controls
- lifecycle-based data movement stages:
  - ingest
  - preprocess / shuffle
  - checkpoint / writeback
  - restore / restart
- standardized implications panels across at least three first-class modules
- repeated "So What?" summary pattern across those modules

### Next: Phase E vendor-neutral decision layer

Target files:

- likely `constants/operations.ts`, `constants/comparison.ts`, or a small new content file
- one supporting component or panel in the main flow
- likely small follow-on README phrasing adjustments if the live copy shifts materially

Goals:

- add vendor-neutral architecture principles
- preserve clear handoff to platform-specific sections and Optics Master
- avoid erasing the existing Arista-specific depth in platform-oriented modules

## Acceptance criteria for the next rebrand sprint

- Workload Types presents at least four workload profiles, not only training vs inference
- Communication Patterns includes implication-first cards for at least four communication patterns
- Data Movement is framed as a lifecycle, not only a protocol glossary
- At least three modules include the standardized implications panel
- At least three modules include explicit runbook links or references
- Vendor-neutral architecture framing is visible in at least one first-class module
- Product boundary handoff to AI Cluster Planner / Optics Master remains visible

## Files to read first in the next session

1. `docs/internal/REBRAND_REFRAME_STATUS.md`
2. `docs/archive/root-history/REBRAND_REFRAME_PLAN.md`
3. `docs/archive/root-history/CONTENT_REFRAME_BACKLOG.md`
4. `ai-networking-education-center/README.md`
5. `ai-networking-education-center/app/moduleRegistry.ts`
6. `ai-networking-education-center/constants/modules.ts`
7. `ai-networking-education-center/constants/navigation.ts`
8. `ai-networking-education-center/constants/trainingVsInference.ts`
9. `ai-networking-education-center/constants/loadBalancing.ts`
10. `ai-networking-education-center/constants/concepts.ts`
11. `ai-networking-education-center/constants/operations.ts`

## Important decisions already made

- Reframe, do not rebuild
- Keep the existing feature-oriented app structure
- Do not convert this app into a quantitative sizing tool
- Preserve Arista accuracy, but improve vendor-neutral framing at the architecture layer
- Use the app README for product narrative and contributor orientation
- Keep structural cleanup complete; do not reintroduce app-local `.github/` or root markdown sprawl
