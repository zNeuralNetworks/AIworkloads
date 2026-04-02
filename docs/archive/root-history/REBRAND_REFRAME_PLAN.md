# Rebrand + Reframe Plan (Phase 1)

## Objective
Reposition the product from an "education center" framing to a decision-oriented architecture reference while preserving the existing technical core.

---

## 1) Category and positioning

### Recommended category
- **Workload Architecture Reference** (primary)
- **Architecture Decision Reference** (alternate)

### Recommended product naming options
1. **Workload Architecture**
   - Subtitle: *Understand how workloads shape infrastructure decisions*
2. **Scientific Workflow Architecture**
   - Subtitle: *Map workload behavior to infrastructure implications*

### Audience model
**Primary audiences**
- Systems engineers
- Solutions architects
- Infrastructure architects
- AI / HPC platform teams
- Research compute teams
- Technically strong technical buyers

**Secondary audiences**
- Account teams and overlay teams needing system-level mental models
- Customer leadership consuming architecture outputs
- Internal enablement audiences

---

## 2) Reframe principles (do now)

1. **Reframe, do not rebuild**
   - Preserve workload categories, technical content, relationship mapping, and visuals.
   - Change interpretive framing, naming, and architecture-decision language.

2. **Shift copy from definitions to implications**
   - From "what this is" to "why this matters architecturally."
   - Example pattern:
     - Weak: "All-reduce is a collective communication operation..."
     - Strong: "All-reduce creates repeated synchronized east-west traffic and strongly influences backend fabric design."

3. **Organize IA around decision logic**
   - Emphasize:
     - workload types
     - communication patterns
     - data movement patterns
     - infrastructure implications
     - architecture patterns

4. **De-emphasize low-value pedagogy in primary flow**
   - Keep foundational context available, but move it into optional support states or tagged intro callouts.
   - Add section depth tags: Intro / Intermediate / Deep Dive.

5. **Strengthen product boundary cues**
   - Keep explicit handoff language to AI Cluster Planner / Optics Master for quantitative sizing.

---

## 3) What to rename, merge, cut, elevate

### Rename (high priority)
Replace labels that signal generic learning:
- education
- learning
- academy
- explainer
- intro
- AI basics

With decision-oriented vocabulary:
- architecture
- patterns
- implications
- reference
- systems
- decision support

### Merge (where it improves decisions)
Merge content currently split by technology silo when it is part of one architecture decision:
- workload type + traffic pattern
- storage behavior + data movement
- training/inference + communication implications

### Cut or down-rank
Down-rank content that is generic, tutorial-like, or obvious for expert users unless required for context.

### Elevate
Prioritize layers that produce architecture outcomes:
- communication patterns
- data movement patterns
- infrastructure implications
- architecture patterns
- design tradeoffs
- explicit "what this means" summaries

---

## 4) Implementation sequence (2-week sprint)

### Week 1: framing + IA/copy pass
1. Select final name + subtitle.
2. Update hero and top-level "what this is for" statements.
3. Rename nav and section labels to implication-first wording.
4. Add "when this matters" copy block to each major module.

### Week 2: content lift + quality gates
1. Add operations runbooks (3–5):
   - high tail latency during all-reduce
   - PFC storm / HOL blocking
   - unstable ECN mark rates
   - throughput collapse during incast
2. Add vendor-neutral architecture lens section.
3. Add migration decision matrix for fabric/protocol transitions.
4. Add difficulty tags for each section (Intro / Intermediate / Deep Dive).

---

## 5) Engineering alignment

1. Keep current product logic and module structure where possible.
2. Use configuration-driven composition and content extraction to speed future copy iteration.
3. Treat deep schema redesign as a phase-2 optimization unless immediate blockers are found.

---

## 6) Definition of done for Phase 1

- New category + name/subtitle is selected and applied in user-facing surfaces.
- Primary navigation reflects decision-oriented IA.
- At least 3 operator runbooks are published.
- Vendor-neutral lens and migration matrix are present.
- Every major section includes a clear "architectural implication" statement.
- Product boundary handoff to AI Cluster Planner / Optics Master is visible.

---

## 7) What to update next by topic (recommended)

The following topics should all be updated in Phase 1. Priority is based on impact to architecture decision quality.

### A) Workload types (update now)
**Why:** workload semantics are the entry point for infrastructure decisions.

**Content updates**
- Expand training vs inference into workload profiles:
  - pre-training (large synchronized collectives)
  - fine-tuning (mixed compute + checkpoint pressure)
  - batch inference (throughput-oriented fan-out/fan-in)
  - real-time inference (latency and jitter sensitivity)
- Add explicit "decision outputs" for each profile:
  - dominant traffic direction
  - tolerance for retransmission/queueing
  - topology sensitivity

### B) Communication patterns (update now)
**Why:** this is one of the strongest differentiators vs generic AI explainers.

**Content updates**
- Add pattern cards with implication framing:
  - all-reduce, all-to-all, parameter server, mixture-of-experts dispatch
- For each pattern, add:
  - burstiness signature
  - incast risk profile
  - path symmetry requirement
  - congestion sensitivity
- Cross-link each pattern to troubleshooting runbooks.

### C) Data movement patterns (update now)
**Why:** storage/ingest/checkpoint movement drives hidden bottlenecks.

**Content updates**
- Separate control-plane vs data-plane movement.
- Add stage mapping:
  - ingest
  - pre-processing/shuffle
  - checkpoint/writeback
  - restore/restart
- Add architecture implications:
  - east-west vs north-south pressure
  - fabric buffer and queue behavior
  - storage fabric coupling considerations

### D) Infrastructure implications (highest priority to strengthen)
**Why:** this is the central rebrand promise.

**Content updates**
- Add an "Infrastructure Implications" panel to each major module:
  - what fails first
  - what to monitor
  - what to tune first
  - what to escalate to capacity planning tools
- Standardize module ending with "So what?" summaries and handoff cues.

### E) Architecture patterns (update now)
**Why:** decision support is strongest when options are compared explicitly.

**Content updates**
- Introduce architecture pattern templates:
  - pattern name
  - best-fit workload profile
  - strengths / tradeoffs
  - operational complexity
  - migration constraints
- Add decision matrix rows mapping workload profile -> recommended pattern.

### Additional topic to include (recommended)
#### F) Operations telemetry and SLO signals (add in Phase 1)
**Why:** without observability linkage, decision guidance is hard to operationalize.

**Content updates**
- For each topic above, include:
  - critical signals (e.g., tail latency, ECN mark rate, retransmits, pause behavior)
  - likely failure mode signatures
  - first-response runbook links
- Add "minimum viable telemetry" checklist for platform teams.

---

## 8) Immediate execution checklist (next 10 working days)

1. Build a topic coverage matrix for the five core topics + telemetry.
2. Annotate each section with:
   - current state (strong / partial / missing)
   - required update type (rename, reframe, add net-new content)
3. Ship copy updates for section headers and implication-first intros.
4. Publish first 3 runbooks and link them from communication + data movement sections.
5. Publish migration matrix v1 and vendor-neutral design lens.
6. Run internal review with one primary audience representative from:
   - infrastructure architecture
   - platform operations
   - solutions engineering
