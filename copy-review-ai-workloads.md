# AI Workloads Copy Review

## 1. Executive Summary

### What the copy does well

- The strongest copy is already decision-oriented. Workload Types, Data Movement, Communication Patterns, Architecture Patterns, and Performance repeatedly ask the right engineering questions: what dominates, what fails first, what to monitor, what to tune, and when to hand off.
- The app has a credible technical center of gravity. It uses real AI/HPC networking concepts such as all-reduce, ECN, PFC, DCQCN, checkpoint bursts, VOQ, queue occupancy, rail imbalance, JCT, and restart posture in ways that generally serve the architecture-reference goal.
- The product boundary is well stated in docs and in `PLANNER_HANDOFF_STANDARD_TEXT`: this app frames workload behavior and infrastructure implications; quantitative sizing belongs in Optics Master / AI Cluster Planner.
- The recent shift away from generic education language is directionally right. Labels such as `Architecture Reference`, `Decision Lens`, `Architecture Patterns`, and `Operational Runbooks` fit the intended audience better than an LMS-style frame.

### What feels weak or fragmented

- The app still mixes two product languages: a premium architecture reference and a teaching/learning flow. Terms like `learner`, `learning flow`, `teaching step`, `Learning Depth`, `Mark this module as understood`, and `course materials` weaken the expert-reference posture.
- Some copy is technically dense but over-explains the obvious. Several modules tell the user not to memorize or not to start with acronyms; that is useful once, but it becomes repetitive as a system pattern.
- A few high-visibility labels sound impressive but are not precise enough for a sophisticated audience: `Ultra Low Latency`, `Lossless Fabric`, `100% Non-Blocking`, `System Active`, `UEC 1.0 Compliant`, and `Implementation Ready`.
- The platform/product copy contains unsupported or risky phrasing, especially silicon codenames and superlatives. This conflicts with the app's own `CLAUDE.md` guidance not to use silicon codenames in user-facing content.
- The roadmap/admin "future improvements" copy still reads like an older generic app backlog, with SaaS/product buzzwords and features outside the current product boundary.

### Overall assessment

The copy quality is above average for a technical reference app, but inconsistent. The best sections feel like an architecture review tool for systems engineers. The weakest sections still feel like an education portal, feature backlog, or product-marketing surface. The priority is not a wholesale rewrite. It is a terminology and hierarchy pass that removes the remaining LMS language, standardizes the decision vocabulary, tightens module CTAs, and makes claims more precise.

## 2. Copy System Assessment

### Current voice and tone

The current voice is technical, explanatory, and increasingly decision-first. It often uses a useful "diagnostic instructor" mode: classify the workload, predict the failure, validate with telemetry, and only then choose a design posture.

That voice fits the product when it speaks to engineers as peers. It weakens when it describes the user as a `learner`, frames the app as `teaching`, or treats completion as a module-understanding activity.

### Audience fit

The intended audience from the repo is systems engineers, network architects, AI/HPC infrastructure specialists, field engineers, platform teams, and technical customers. The copy fits that audience when it uses operationally grounded language: `queue containment`, `rail imbalance`, `checkpoint duration`, `endpoint reaction`, `restart posture`, `path symmetry`, `telemetry watchpoints`.

The copy mismatches the audience when it uses classroom language or generic product-roadmap terms. A sophisticated user does not need the app to say `the learner should...`; they need the app to make the next engineering move obvious.

### Terminology inconsistencies

- `Learning` vs `Architecture Reference`: `learningObjectives`, `Learning Depth`, `learner`, `teaching`, `learning flow`, `course materials`, and `Mark this module as understood` compete with the architecture-reference frame.
- `Silicon` vs platform capability language: `Platform & Silicon`, `silicon behavior`, `Tomahawk`, `Jericho`, and `Jericho 2C+` conflict with the local content rule against user-facing silicon codenames.
- `Performance Metrics` vs `Performance Implications`: navigation and registry say `Performance Implications`, but the section title says `Performance Metrics`, which is less decision-oriented.
- `Deep Dive` is too generic next to concrete labels like `Transport & Congestion` and `Operational Runbooks`.
- `Architecture Patterns` and `Platform Considerations` are good labels, but some copy still says `topology`, `platform`, `product`, and `SKU` without a consistent progression from architecture constraint to product family.

### Naming/system breakdowns

- The app's main system language should be: `workload behavior`, `traffic geometry`, `architecture posture`, `failure signature`, `telemetry signal`, `operational response`, and `planner handoff`.
- The current system sometimes drifts into: `learning flow`, `module understood`, `teaching step`, `course materials`, and `feature backlog`.
- CTAs should standardize around actions like `Set active lens`, `Open telemetry guide`, `Validate posture`, `Open planner handoff`, and `Mark decision reviewed`, not learning-completion labels.

## 3. Highest-Priority Problems

### 1. Legacy learning language appears in the main module progression

- Classification: `audience mismatch`
- File/path: `ai-networking-education-center/components/TrainingVsInferenceSection.tsx`
- UI surface/component: Workload Types / Anchor Contrasts intro
- Current text: `These anchor cases reduce the category load. The learner only needs a few strong contrasts to build the right mental model.`
- Why it is weak: The sentence is pedagogically clear, but it speaks about the user as a learner and exposes the teaching method. For a senior technical audience, the copy should speak in terms of decision leverage.
- Improved version: `Use these anchor cases to separate the dominant workload profiles quickly before moving into transport or platform decisions.`
- Rationale: Keeps the purpose of the section while removing classroom framing.

### 2. CTA language implies course completion instead of decision confidence

- Classification: `poor terminology`
- File/path: `ai-networking-education-center/components/TrainingVsInferenceSection.tsx`
- UI surface/component: Workload Types / Transfer Prompt button
- Current text: `Mark this module as understood`
- Why it is weak: This sounds like LMS progress tracking. The app is positioned as an architecture reference, so the action should reflect a decision or review state.
- Improved version: `Mark workload lens reviewed`
- Rationale: Keeps the persisted progress behavior but reframes it around the architecture lens the user just validated.

### 3. Hero subtitle still starts with generic education language

- Classification: `audience mismatch`
- File/path: `ai-networking-education-center/constants/modules.ts`
- UI surface/component: Home hero subtitle
- Current text: `Learn the decision chain from workload shape to fabric posture, architecture choice, and operational consequences.`
- Why it is weak: The rest of the hero is strong, but `Learn` pulls the product back toward an education-center posture. The app should present itself as a reference for applying a decision chain, not as a course.
- Improved version: `Use the decision chain from workload shape to fabric posture, architecture choice, and operational consequence.`
- Rationale: Changes one verb and sharpens the product's use case without changing meaning.

### 4. Home footer chips are claim-like but under-contextualized

- Classification: `unsupported claim`
- File/path: `ai-networking-education-center/components/HomeDashboard.tsx`
- UI surface/component: Home footer quick links
- Current text: `Ultra Low Latency`; `Lossless Fabric`; `100% Non-Blocking`
- Why it is weak: These sound like marketing claims or absolute guarantees rather than reference entry points. `100% Non-Blocking` is especially risky without context, and the trio does not explain what a user should do next.
- Improved version: `Latency & Tail Risk`; `Lossless Control Loops`; `Topology & Path Symmetry`
- Rationale: Reframes the chips as decision topics rather than broad performance claims.

### 5. Platform copy violates the app's own terminology rule

- Classification: `poor terminology`
- File/path: `ai-networking-education-center/constants/products.ts`
- UI surface/component: Platform Considerations / product specs and feature cards
- Current text: `Tomahawk5`; `Jericho Silicon`; `Jericho 2`; `Jericho 2C+`; `Latest Broadcom chipset architecture`
- Why it is weak: `CLAUDE.md` says not to use ASIC silicon codenames in user-facing content. This copy also makes the platform section feel like a SKU/spec catalog instead of an architecture-reference layer.
- Improved version: `High-radix fixed platform`; `Deep-buffer modular platform`; `Deep-buffer fixed platform`; `Deep-buffer fixed platform with enhanced telemetry`; `Current-generation fixed switching architecture`
- Rationale: Preserves decision-relevant meaning while avoiding silicon codenames and unsupported chipset framing.

### 6. Performance section title conflicts with the module name

- Classification: `inconsistent`
- File/path: `ai-networking-education-center/content/performance.ts`
- UI surface/component: Performance module title
- Current text: `Performance Metrics`
- Why it is weak: The navigation and registry use `Performance Implications`, which is more strategic. `Performance Metrics` sounds like a chart gallery and weakens the module's stated role as architecture validation.
- Improved version: `Performance Implications`
- Rationale: Aligns the section title with the product framing and the nav label.

### 7. Performance status label is decorative and low-signal

- Classification: `low-signal filler`
- File/path: `ai-networking-education-center/content/performance.ts`
- UI surface/component: Performance module status pill
- Current text: `System Active`
- Why it is weak: It creates the impression of a live system state, but the module is showing reference content and charts. It does not tell the user what is active or why it matters.
- Improved version: `Validation View`
- Rationale: More accurately describes the function of the section: interpreting metrics as evidence.

### 8. Transport Tradeoffs badge overstates compliance

- Classification: `unsupported claim`
- File/path: `ai-networking-education-center/components/ComparisonTable.tsx`
- UI surface/component: Transport Tradeoffs header badge
- Current text: `UEC 1.0 Compliant`
- Why it is weak: This reads like a certification claim for the app or a product. The surrounding table is a comparison view, not a compliance test or formal standard validation.
- Improved version: `UEC 1.0 Reference`
- Rationale: Keeps the standards context while avoiding an implied compliance assertion.

### 9. Deep Dive page frames PFC too positively

- Classification: `unclear`
- File/path: `ai-networking-education-center/components/ProtocolDeepDive.tsx`
- UI surface/component: Deep Dive / RoCEv2 Flow Control intro
- Current text: `Visualize how Priority Flow Control (PFC) prevents packet loss by pausing specific traffic queues during congestion.`
- Why it is weak: This is technically true but incomplete. Elsewhere the app correctly teaches that sustained PFC is a backstop and can indicate a late congestion loop. The intro should carry that nuance.
- Improved version: `Visualize how PFC acts as a lossless backstop when queue pressure exceeds the early congestion-control loop.`
- Rationale: Preserves the function of PFC while aligning with the app's stronger congestion-control narrative.

### 10. Future improvements copy breaks the product boundary

- Classification: `audience mismatch`
- File/path: `ai-networking-education-center/constants/future.ts`
- UI surface/component: Admin / Suggested Improvements
- Current text: `Certification Quiz`; `Flashcard Mode`; `Spaced repetition system for memorizing acronyms.`; `Offline Learning (PWA)`; `Access course materials without an internet connection.`
- Why it is weak: These labels belong to an LMS backlog, not a premium architecture reference. Several items also point toward features the roadmap explicitly says the product should not become.
- Improved version: `Decision Check`; `Reference Drilldown`; `Short prompts for validating terminology and failure-mode recognition.`; `Offline Reference`; `Access reference modules without an internet connection.`
- Rationale: Keeps plausible utility while removing course/certification language.

## 4. Structural Recommendations

- Standardize the user role in copy. Do not call the user `learner` in live UI. Use `engineer`, `architect`, `operator`, `team`, or direct imperative copy depending on context.
- Use a consistent module contract: `Why this matters`, `Decision model`, `What fails first`, `What to monitor`, `What to tune`, `Next decision`, `Planner handoff`.
- Replace learning-progress CTAs with decision-state CTAs. Preferred patterns: `Mark lens reviewed`, `Mark posture reviewed`, `Mark signal reviewed`, `Open planner handoff`, `Open telemetry guide`.
- Treat performance and platform sections as validation layers, not product proof. Prefer `validates`, `indicates`, `suggests`, and `watch` over `proves`, `compliant`, `optimized`, and absolute claims unless source-backed.
- Rename or demote generic labels. `Deep Dive` should become more specific, such as `RoCEv2 Flow Control Lab` or `Transport Control Lab`, if the route remains focused on that content.
- Remove silicon codenames from user-facing platform copy and replace them with capability language: `high-radix fixed`, `deep-buffer modular`, `single-hop distributed`, `telemetry-oriented`, `storage-coupled`.
- Keep the planner handoff language visible, but avoid repeating the full standard paragraph too often. Use the full text once per relevant section and short variants elsewhere.
- Convert backlog/admin feature copy to the same product language as the app. Avoid `course`, `certification`, `flashcards`, `education data`, and `famous AI clusters` unless the product direction explicitly returns to training content.

## 5. Quick Wins

- Change `Learn the decision chain...` to `Use the decision chain...` in `constants/modules.ts`.
- Replace `Mark this module as understood` across modules with decision-state language.
- Replace visible `learner` references with direct user-facing copy, especially in Workload Types, Data Movement, Communication Patterns, Transport & Congestion, Architecture Patterns, Performance, and shared helper components.
- Rename `Performance Metrics` to `Performance Implications` and `System Active` to `Validation View`.
- Change `UEC 1.0 Compliant` to `UEC 1.0 Reference`.
- Replace home footer chips `Ultra Low Latency`, `Lossless Fabric`, and `100% Non-Blocking` with decision-topic labels.
- Remove silicon codenames from platform specs and feature cards.
- Rename `Learning Depth` in `DepthPreferenceTabs.tsx` to `Reference Depth` or `Analysis Depth`.
- Change admin `Suggested Improvements` backlog items that use LMS language: `Offline Learning`, `Certification Quiz`, `Flashcard Mode`, and `course materials`.
- Tighten status/empty-state text so it describes what the user can do next, not just what happened.

## 6. Optional Deeper Rewrite Candidates

- Workload Types: The module is directionally strong, but it still has the highest concentration of `learner`, `teaching`, and `mental model` phrasing. A focused rewrite should preserve the decision chain but make it read like a field architecture workflow.
- Data Movement: Strong substance, but many sentences explain the pedagogy rather than the decision. Rewrite around `stage`, `failure mode`, `telemetry`, and `handoff`.
- Transport & Congestion: Keep the ECN/PFC control-loop narrative, but remove `learning goal`, `teaching moments`, and `learner` language. This section should sound like an operational control-loop review.
- Platform Considerations: Needs a more comprehensive terminology pass to remove silicon codenames, reduce SKU-first language, and foreground architecture constraints.
- Admin / Suggested Improvements: This is the clearest remnant of the old education-center backlog. It should either be reframed as an internal roadmap for the architecture reference or moved out of the live operator-facing admin surface.
- Glossary: Several definitions are useful but long. The deeper rewrite should split terms into `definition`, `why it matters`, and `operational caution` if the UI supports it later, rather than compressing full runbook-level explanation into a single paragraph.
