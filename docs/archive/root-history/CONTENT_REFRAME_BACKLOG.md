# Content Reframe Backlog (Decision-First)

## Purpose
Translate the rebrand/reframe strategy into concrete module-level updates prioritized by architecture decision impact.

## Coverage matrix

| Topic | Current state | Why it matters | Required update | Priority |
|---|---|---|---|---|
| Workload types | Partial | Workload semantics determine traffic shape and latency tolerance | Expand profiles (pre-training, fine-tuning, batch inference, real-time inference) with decision outputs | P0 |
| Communication patterns | Partial | Collective behavior drives congestion, queueing, and path requirements | Add implication-first cards for all-reduce/all-to-all/parameter-server/MoE dispatch + runbook links | P0 |
| Data movement patterns | Partial | Ingest/checkpoint/restore paths create hidden bottlenecks and failure recovery constraints | Add lifecycle mapping and explicit east-west vs north-south implications | P0 |
| Infrastructure implications | Partial | Core promise of the product reframe | Add a standardized implications panel to every major module | P0 |
| Architecture patterns | Strong but scattered | Users need explicit options/tradeoffs for decisions | Add reusable pattern template and workload->pattern mapping matrix | P1 |
| Telemetry and SLO signals | Missing/implicit | Decision support is weak without observable signals | Add minimum viable telemetry checklist and per-pattern failure signatures | P0 |

## Module-level implementation map

### 1) Workload Types module
- Add workload profile taxonomy and "decision outputs" block:
  - dominant traffic direction
  - burstiness profile
  - latency/jitter sensitivity
  - retransmission tolerance
- Add "when this matters" intro copy and "so what" summary.

### 2) Communication Patterns module
- Add one implication card per pattern:
  - trigger condition
  - network stress signature
  - required design posture
  - operational risk
- Add links to runbooks for each pattern.

### 3) Data Movement module
- Split content into lifecycle stages:
  - ingest
  - preprocess/shuffle
  - checkpoint/writeback
  - restore/restart
- Add implications for storage-fabric coupling and congestion behavior.

### 4) Infrastructure implications layer (cross-cutting)
- Add a standard panel in each core module:
  1. what fails first
  2. what to monitor first
  3. what to tune first
  4. when to hand off to capacity/sizing tools

### 5) Architecture Patterns module
- Add standard pattern template fields:
  - best-fit workload
  - strengths
  - tradeoffs
  - operational complexity
  - migration constraints
- Add decision matrix rows mapping workload profiles to pattern recommendations.

### 6) Operations telemetry layer
- Add minimum viable telemetry checklist:
  - p95/p99 flow completion latency
  - ECN mark-rate stability
  - retransmit rate
  - pause frame behavior / HOL indicators
  - queue occupancy trend
- Add failure-mode signatures and first-response actions.

## Sequenced delivery (10 working days)

1. **Day 1–2**: rename/reframe pass for section headers and intros.
2. **Day 2–4**: publish workload + communication implication updates.
3. **Day 4–6**: publish data movement lifecycle and infrastructure implications panels.
4. **Day 6–8**: publish telemetry checklist and failure signatures.
5. **Day 8–10**: publish pattern matrix + migration guidance and complete review.

## Acceptance criteria
- All five requested topics include explicit architecture implications.
- Every core module ends with a "so what" decision summary.
- At least 3 runbooks are linked from pattern/content modules.
- Telemetry checklist is visible and tied to at least 3 failure modes.
