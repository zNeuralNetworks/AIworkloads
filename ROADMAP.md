# AI Workloads App Roadmap

## 1. Executive Review

### Current product state

The app is no longer best described as an "education center."
It is already partway through a stronger repositioning into a workload-to-infrastructure architecture reference for AI, HPC, and scientific workflow environments.

That reframe is materially visible in the current codebase:

- landing and module metadata now emphasize architecture decisions over generic learning
- several core modules already use implication-first framing
- operations content is stronger than a typical reference app and includes meaningful runbooks
- the app already maintains a clear product boundary with sizing and BOM-level tooling

At the same time, the product is not yet fully coherent.
The strongest remaining gaps are:

- inconsistent brand and product-language carryover from the older "education center" framing
- incomplete vendor-neutral architecture framing at the decision layer
- uneven module maturity across the main flow
- incomplete telemetry and SLO guidance as a first-class decision surface
- an admin/content system that is useful locally but not yet production-grade for shared editing

### Overall assessment

The app is in a strong "good product, incomplete product thesis" state.

It already has enough structure and depth to become a differentiated reference for systems engineers, architects, and field teams.
The next stage should not be a redesign-heavy rebuild.
It should be a disciplined product-hardening effort around narrative consistency, decision support, cross-module coherence, and operational usefulness.

## 2. North Star

### Product north star

Build the best workload-architecture reference for translating AI, HPC, and scientific workflow behavior into network, transport, platform, and operations decisions.

### What the app should feel like

- fast to navigate like a premium technical reference
- deep enough for experienced architects
- structured enough for field engineers and cross-functional teams
- implication-first rather than definition-first
- vendor-neutral at the architecture layer, while remaining precise and credible about Arista-relevant implementation realities

### Core product promise

When a user asks, "What does this workload behavior imply for the infrastructure?", this app should help them answer:

1. what traffic pattern and pressure point dominate
2. what fails first if the design posture is wrong
3. what signals to observe first
4. what design or operational decision follows
5. when to hand off to a separate sizing or planning tool

## 3. Product Goals

### Primary goals

1. Make workload behavior the primary organizing principle for the app.
2. Make architecture implications explicit in every core module.
3. Strengthen vendor-neutral decision framing without diluting Arista accuracy.
4. Turn telemetry, failure signatures, and runbooks into first-class guidance.
5. Preserve a premium, uncluttered interface rather than drifting into LMS-style UX.
6. Keep the product boundary clear: architecture reference here, detailed sizing in AI Cluster Planner / Optics Master.

### Secondary goals

- improve content consistency across modules
- make cross-module progression more obvious
- reduce stale legacy language in UI and docs
- prepare the content model for eventual shared CMS sync without blocking product work on it now

## 4. Non-Goals

The app should not become:

- a full training course platform
- a quiz-heavy LMS
- a quantitative sizing calculator
- a platform SKU selector
- a vendor marketing brochure
- a protocol glossary disguised as a product

## 5. Intended Users

### Primary audience

- systems engineers
- network architects
- AI/HPC infrastructure specialists
- field engineers supporting customer design conversations

### Secondary audience

- platform teams building internal guidance
- technically strong customers trying to map workload behavior to design posture
- technical marketing and enablement teams that need accurate reference material

## 6. Current Strengths

### What is already working

- The architecture-reference positioning is already visible in product metadata and docs.
- The landing experience is visually strong again after restoring the cleaner hero-and-card composition.
- The operations module is relatively mature and already contains practical runbooks, principles, and migration guidance.
- Data Movement, Communication Patterns, and Workload Types are moving in the right direction with implication-first and lifecycle-oriented framing.
- The app already maintains a valuable boundary between reference guidance and downstream planner/sizing tools.
- The design language is differentiated and premium when the top-level chrome stays restrained.

### What creates strategic value

- The app can sit between high-level customer conversations and detailed implementation planning.
- It can function as both an internal field tool and a customer-facing architecture explainer.
- It is credible because it is grounded in real transport, queueing, and operational behavior rather than generic AI content.

## 7. Current Gaps

### Product and narrative gaps

- A few visible surfaces still use older "education center" language, including the footer.
- Vendor-neutral framing exists implicitly but still lacks one unmistakable architecture-layer anchor.
- Some modules still read more like explainers than decision tools.
- Cross-module sequencing is improved in places but still not uniformly obvious.

### Content and decision-support gaps

- Telemetry and SLO guidance is still not systematic enough across the main flow.
- Architecture patterns are strong but still scattered rather than standardized into a reusable decision template.
- Not every major module consistently answers:
  - why this matters
  - what fails first
  - what to monitor first
  - what to tune first
  - what the user should do next

### Platform and operational gaps

- The admin system is still browser-local in practice.
- Shared Supabase-backed editing across all editable datasets is not yet wired.
- Content governance is still more code-structured than editor-structured.
- UI and content regressions are still mostly protected by lint/build/tests rather than stronger product-level acceptance checks.

## 8. Strategic Pillars

### Pillar 1: Decision-first reference

Every core module should help users move from workload behavior to infrastructure posture, not just explain terminology.

### Pillar 2: Vendor-neutral architecture layer

The app should state architecture principles in a vendor-neutral way first, then connect those principles to Arista-accurate implementation depth where relevant.

### Pillar 3: Operations-aware guidance

The product should make failure signatures, telemetry, and first-response actions as visible as transports and topology diagrams.

### Pillar 4: Premium technical UX

The experience should stay elegant, sparse, and visually disciplined.
Pedagogy should support understanding without visually overwhelming the interface.

### Pillar 5: Clear product boundaries

The app should hand off cleanly to AI Cluster Planner / Optics Master for quantitative planning, optics, and detailed build decisions.

## 9. Roadmap Overview

### Horizon structure

- Horizon 1: product coherence and narrative hardening
- Horizon 2: decision-support depth and architecture standardization
- Horizon 3: operations maturity and telemetry systemization
- Horizon 4: content platform and workflow hardening

## 10. Horizon 1: Product Coherence and Narrative Hardening

### Objective

Make the app internally and externally consistent with the current product thesis.

### Workstreams

#### 1. Brand and copy consistency

- remove remaining "education center" language from live UI and docs
- align footer, metadata, README fragments, and route-level labels to the architecture-reference posture
- standardize language around:
  - workload behavior
  - architecture implications
  - design posture
  - operational signals

#### 2. Landing and top-level experience

- keep the restored clean landing composition
- ensure hero copy stays premium, sparse, and decision-oriented
- audit top-level UI surfaces for accidental clutter regression

#### 3. Product boundary clarity

- make planner handoff cues consistent in relevant modules
- explicitly distinguish:
  - reference guidance in this app
  - quantitative planning in downstream tools

### Acceptance criteria

- no user-facing top-level surface describes the app primarily as an education center
- the landing page clearly reads as a technical architecture reference
- planner handoff language is visible and consistent in all relevant modules

## 11. Horizon 2: Decision-Support Depth and Architecture Standardization

### Objective

Turn the strongest modules into a repeatable decision framework across the app.

### Workstreams

#### 1. Standard module contract

Every core module should include:

- why this matters
- dominant workload or traffic condition
- architecture implications
- what fails first
- what to monitor first
- what to tune first
- next logical module or handoff

#### 2. Architecture patterns standardization

Create a reusable pattern template for architecture modules:

- best-fit workload
- topology posture
- strengths
- tradeoffs
- operational complexity
- migration constraints
- telemetry watchpoints
- handoff conditions to planner tooling

#### 3. Vendor-neutral anchor

Add one explicit first-class vendor-neutral architecture layer that:

- explains core principles without vendor branding
- preserves a path into platform-specific depth
- reduces the chance that the app is misread as a vendor explainer

### Acceptance criteria

- all flagship modules use a shared decision pattern
- architecture patterns are presented as options and tradeoffs, not only narrative explanation
- vendor-neutral framing is visibly present in at least one first-class module and cross-linked from other relevant sections

## 12. Horizon 3: Operations Maturity and Telemetry Systemization

### Objective

Make observability, failure signatures, and day-2 operations part of the main product value.

### Workstreams

#### 1. Telemetry baseline

Add a minimum viable telemetry layer across the core flow:

- p95 and p99 flow or operation latency
- ECN mark-rate stability
- retransmit behavior
- pause and HOL indicators
- queue occupancy trend
- path-distribution health indicators

#### 2. Failure-mode mapping

For major workload and transport patterns, document:

- likely first failure signal
- common misdiagnosis
- first-response action
- escalation boundary

#### 3. Runbook linkage

- ensure communication patterns, transport sections, and architecture patterns link to operational runbooks where relevant
- add "if you see this in production" bridges between reference content and operations content

### Acceptance criteria

- telemetry guidance appears as a first-class concept in at least three core modules
- at least three major content areas link directly to runbooks
- users can move from architecture implication to operational validation without leaving the app’s core logic

## 13. Horizon 4: Content Platform and Workflow Hardening

### Objective

Make the app maintainable and scalable as a living technical product.

### Workstreams

#### 1. Content model maturity

- continue expanding module metadata already added in the app
- define a stable schema for:
  - learning objectives
  - scenarios
  - implications
  - checks
  - runbook references
  - planner handoffs

#### 2. Admin and editorial workflow

- keep browser-local editing usable in the near term
- design the shared Supabase-backed content model before wiring it broadly
- only wire shared editing after dataset coverage, conflict behavior, and governance rules are explicit

#### 3. Product quality checks

- expand review criteria beyond lint/build/test
- add product-level acceptance checks for:
  - module consistency
  - content completeness
  - copy posture
  - planner handoff visibility

### Acceptance criteria

- the content model supports the roadmap without one-off module hacks
- the future shared-editing implementation has a clear schema and scope
- product-level regressions are easier to catch before release

## 14. Prioritized Backlog

### P0: Immediate

- remove remaining legacy "education center" wording from live UI, starting with the footer
- add explicit vendor-neutral architecture framing in a first-class module
- standardize implications and telemetry callouts across core modules
- tighten planner handoff cues across architecture, transport, and operations sections

### P1: Near term

- formalize the architecture pattern template
- add cross-links from communication patterns and transport decisions to runbooks
- add telemetry watchpoint blocks to flagship modules
- clean up remaining module-to-module consistency issues in tone and structure

### P2: After core coherence

- design full shared content editing coverage for all editable datasets
- expand automated acceptance checks for narrative and product consistency
- consider exportable field assets derived from the same module content

## 15. Success Metrics

### Product quality signals

- users can identify the right next module without guidance confusion
- modules consistently answer the design question they introduce
- fewer UI surfaces use outdated product framing
- more sections visibly connect design decisions to operational validation

### Adoption and usefulness signals

- field teams use the app for customer architecture discussions
- users can hand off from app guidance into planner tooling without ambiguity
- internal reviewers judge the app as reference-grade rather than training-grade

### Editorial maturity signals

- new modules can adopt the shared decision template without bespoke UI work
- content changes are easier to review for completeness and consistency

## 16. Recommended Sequence

### Phase 1

- narrative consistency cleanup
- vendor-neutral anchor
- footer and remaining copy fixes
- planner handoff consistency pass

### Phase 2

- architecture pattern standardization
- telemetry blocks in flagship modules
- cross-link runbooks into main-flow modules

### Phase 3

- product-level acceptance framework
- content-model hardening
- Supabase shared-editing design, not full rollout

### Phase 4

- shared-editing implementation across all editable datasets
- stronger editorial workflow and release discipline

## 17. Final Direction

The right long-term direction is not to make this app broader.
It is to make it sharper.

This product should become the most credible answer to the question:
"Given this workload behavior, what should the infrastructure team care about first?"

If the app stays elegant, implication-first, operationally grounded, and clear about where planner tooling begins, it can occupy a valuable and defensible position between generic education content and deep implementation tooling.
