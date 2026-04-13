import React, { useState, useEffect, ReactNode } from 'react';
import { useData } from '../contexts/DataContext';
import { useLearning } from '../contexts/LearningContext';
import { ChevronRight, Info, Server, ExternalLink, Gauge, TimerReset, Activity, MoveRight } from 'lucide-react';
import { ICON_MAP, PLANNER_HANDOFF_LABEL, PLANNER_HANDOFF_STANDARD_TEXT } from '../constants';
import GlossaryTerm from './GlossaryTerm';
import InfrastructureImplicationsPanel from './InfrastructureImplicationsPanel';
import RunbookLinksPanel from './RunbookLinksPanel';
import SoWhatCallout from './SoWhatCallout';
import SourceBadge from './SourceBadge';
import TelemetryWatchPanel from './TelemetryWatchPanel';
import CompactDisclosure from './CompactDisclosure';
import QuickKnowledgeCheck from './QuickKnowledgeCheck';
import { claimText, hasSourceMetadata } from '../utils/sourceClaims';
import type { InfrastructureImplication, KnowledgeCheck, RunbookReference, TelemetryWatchpoint } from '../types';

// Helper component to parse text and auto-wrap known glossary terms
// This ensures that even dynamic content from the admin panel gets tooltips.
const DescriptionRenderer: React.FC<{ text: string }> = ({ text }) => {
  // List of high-value terms to auto-highlight in this specific section
  const termsToHighlight = [
    'Radix',
    'VOQ',
    'LPO',
    'Deep Buffers',
    'Tomahawk',
    'Jericho',
    'PCIe',
    'Fabric',
    'Leaf',
    'Spine',
    'CLOS',
  ];

  // Create a regex that finds these words (case insensitive, whole word)
  const regex = new RegExp(`\\b(${termsToHighlight.join('|')})\\b`, 'gi');

  const parts = text.split(regex);

  return (
    <p className="text-slate-300 leading-relaxed text-sm">
      {parts.map((part, i) => {
        // Check if this part matches one of our terms (case insensitive)
        const match = termsToHighlight.find((t) => t.toLowerCase() === part.toLowerCase());
        if (match) {
          return (
            <GlossaryTerm key={i} term={match}>
              {part}
            </GlossaryTerm>
          );
        }
        return part;
      })}
    </p>
  );
};

interface ProductTip {
  title: string;
  body: ReactNode;
}

const PRODUCT_TIPS: Record<string, ProductTip> = {
  '7060X': {
    title: 'Why LPO?',
    body: (
      <>
        <GlossaryTerm term="LPO">Linear Pluggable Optics</GlossaryTerm> remove the DSP from
        transceiver modules, cutting power per port by up to 15%. On a 64-port 800G leaf, that
        adds up to kilowatts of savings at the rack level.
      </>
    ),
  },
  '7800R': {
    title: 'Why VOQ?',
    body: (
      <>
        <GlossaryTerm term="VOQ">Virtual Output Queuing</GlossaryTerm> eliminates{' '}
        <GlossaryTerm term="Head-of-Line Blocking">head-of-line blocking</GlossaryTerm> by
        buffering packets at ingress sorted by destination. Essential for{' '}
        <GlossaryTerm term="Incast">incast</GlossaryTerm>-heavy AI collectives.
      </>
    ),
  },
  '7700R': {
    title: 'Why Single Hop?',
    body: (
      <>
        Single-hop removes the spine tier entirely. Any GPU can reach any other GPU in one switch
        traversal — minimizing{' '}
        <GlossaryTerm term="Tail Latency">tail latency</GlossaryTerm> and simplifying fabric
        management at ultra-large scale.
      </>
    ),
  },
  '7280R3': {
    title: 'Why Deep Buffers?',
    body: (
      <>
        AI traffic consists of "<GlossaryTerm term="Incast">incast</GlossaryTerm>" bursts.
        Shallow buffer switches drop packets during these microbursts.{' '}
        <GlossaryTerm term="Deep Buffers">Deep buffers</GlossaryTerm> (
        <GlossaryTerm term="VOQ">VOQ</GlossaryTerm>) absorb them.
      </>
    ),
  },
  '7280R3A': {
    title: 'Why In-Band Telemetry?',
    body: (
      <>
        In-Band Network Telemetry embeds timing and queue-depth metadata into live data packets.
        This gives per-flow, per-hop visibility without dedicated probes — critical for diagnosing{' '}
        <GlossaryTerm term="Microburst">microburst</GlossaryTerm> events in AI storage fabrics.
      </>
    ),
  },
};

const PLATFORM_DECISION_CONTENT: Record<
  string,
  {
    bestFit: string;
    tradeoffs: string[];
    operationalConsequence: string;
    whatLeadsHere: string;
    telemetry: TelemetryWatchpoint[];
    runbooks: RunbookReference[];
  }
> = {
  '7060X': {
    bestFit: 'High-radix fixed fabrics where dense 800G connectivity and low-latency collective posture matter more than deep-buffer absorption.',
    tradeoffs: [
      'Excellent when collective symmetry is the main architecture requirement',
      'Less forgiving when receiver convergence or storage bursts dominate',
      'Rewards disciplined pathing more than it forgives queue mistakes',
    ],
    operationalConsequence: 'The platform works best when the architecture is already clean. If congestion posture is weak, the fabric will show it quickly.',
    whatLeadsHere: 'Choose this when synchronized collectives dominate and the main question is dense non-blocking connectivity rather than deep queue headroom.',
    telemetry: [
      { label: 'Rail balance', signal: 'Slowest rail, path spread, and collective tail latency', whyItMatters: 'These prove whether the fixed high-radix backend is really delivering symmetry.' },
      { label: 'Queue discipline', signal: 'ECN-to-PFC sequence under burst coordination', whyItMatters: 'This tells you whether the platform is being used with the right congestion posture.' },
    ],
    runbooks: [
      { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce', context: 'Use this when the fixed backend is still being stretched by one hot rail or path.' },
      { id: 'ecn-instability', label: 'ECN Mark Rate Instability', context: 'Use this when pathing is acceptable but the feedback loop is still wrong.' },
    ],
  },
  '7800R': {
    bestFit: 'Large-scale modular spines where VOQ fairness, deep buffers, and expansion discipline matter more than a purely fixed-form-factor story.',
    tradeoffs: [
      'Stronger fit for convergent pressure and modular scale growth',
      'Operationally heavier than a fixed spine story',
      'Best when fairness under burst fan-in is architecturally important',
    ],
    operationalConsequence: 'This shifts the decision from simple port density to queue fairness, scale boundaries, and modular operational discipline.',
    whatLeadsHere: 'Choose this when large-scale spine growth, receiver convergence, or modular fairness is the real architecture constraint.',
    telemetry: [
      { label: 'Receiver fairness', signal: 'Destination-facing queue growth stays bounded under fan-in', whyItMatters: 'This proves whether VOQ and deeper buffering are solving the intended problem.' },
      { label: 'Growth posture', signal: 'Expansion or modular growth does not create new hot boundaries', whyItMatters: 'A modular spine is only valuable if it scales cleanly.' },
    ],
    runbooks: [
      { id: 'incast-collapse', label: 'Throughput Collapse During Incast', context: 'Use this when deep-buffer and VOQ assumptions are not actually protecting convergent workloads.' },
      { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce', context: 'Use this when scale is large but one path or linecard domain still stretches completion.' },
    ],
  },
  '7700R': {
    bestFit: 'Very large environments where single-hop simplification and distributed scale are more valuable than preserving a conventional staged topology.',
    tradeoffs: [
      'Powerful scale simplification story at very large size',
      'A different operational model than conventional Clos growth',
      'Best when scale really justifies the topology shift',
    ],
    operationalConsequence: 'This changes the topology conversation itself. The main risk is adopting the distributed model before the scale and workload assumptions truly require it.',
    whatLeadsHere: 'Choose this when the architecture problem is now topology simplification at massive scale, not just adding more stages to a smaller fabric.',
    telemetry: [
      { label: 'Global consistency', signal: 'Cluster-wide tail behavior stays bounded instead of moving the bottleneck elsewhere', whyItMatters: 'The single-hop story only matters if it removes rather than relocates the problem.' },
      { label: 'Failure-domain behavior', signal: 'Large-scale disruption remains bounded during fault or maintenance events', whyItMatters: 'Topology simplification must still preserve predictable resilience.' },
    ],
    runbooks: [
      { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce', context: 'Use this when distributed scale still leaves a global hot path or straggler domain.' },
      { id: 'ecn-instability', label: 'ECN Mark Rate Instability', context: 'Use this when topology is right but the control loop is still wrong.' },
    ],
  },
  '7280R3': {
    bestFit: 'Storage-heavy or convergent environments where deep buffering and VOQ matter more than pure radix density.',
    tradeoffs: [
      'Excellent for storage bursts and receiver convergence',
      'Not the default answer for every collective-heavy backend',
      'Deep buffers help only when the workload really needs them',
    ],
    operationalConsequence: 'The main value is surviving storage and microburst behavior. The main risk is using deep buffers as a substitute for disciplined architecture everywhere else.',
    whatLeadsHere: 'Choose this when checkpoint, storage, or convergent fan-in is the dominant operational risk.',
    telemetry: [
      { label: 'Burst absorption', signal: 'Checkpoint and ingest pressure stay bounded instead of spreading pause or HOL blocking', whyItMatters: 'This validates the reason for choosing a deeper-buffer platform.' },
      { label: 'Queue fairness', signal: 'Convergent receivers remain stable under burst fan-in', whyItMatters: 'This shows whether the platform is protecting the right boundary.' },
    ],
    runbooks: [
      { id: 'incast-collapse', label: 'Throughput Collapse During Incast', context: 'Use this when storage or fan-in pressure still collapses throughput.' },
      { id: 'pfc-storm', label: 'PFC Storm / Head-of-Line Blocking', context: 'Use this when deep buffers still allow pause or HOL spread.' },
    ],
  },
  '7280R3A': {
    bestFit: 'Microburst-sensitive environments where in-band visibility is part of the architecture requirement, not just a nice extra.',
    tradeoffs: [
      'Better observability into burst and queue behavior',
      'Still requires disciplined interpretation of the telemetry',
      'Best when diagnosis speed is part of the value proposition',
    ],
    operationalConsequence: 'The platform helps only if the team turns that visibility into faster and better tuning decisions rather than collecting more counters.',
    whatLeadsHere: 'Choose this when the architecture question includes how to observe burst behavior clearly enough to keep up with tuning and incident response.',
    telemetry: [
      { label: 'Burst localization', signal: 'Per-hop queue and timing metadata isolate the hotspot quickly', whyItMatters: 'This proves the observability value is real rather than theoretical.' },
      { label: 'Lifecycle clarity', signal: 'Writeback and recovery paths can be separated cleanly in telemetry', whyItMatters: 'This helps distinguish which workload stage is actually dominating.' },
    ],
    runbooks: [
      { id: 'incast-collapse', label: 'Throughput Collapse During Incast', context: 'Use this when telemetry makes the receiver-convergence problem obvious.' },
      { id: 'ecn-instability', label: 'ECN Mark Rate Instability', context: 'Use this when visibility shows the feedback loop is arriving too late.' },
    ],
  },
};

const PLATFORM_IMPLICATIONS: InfrastructureImplication[] = [
  {
    label: 'What leads you here',
    detail: 'Choose the platform after the workload, traffic geometry, and failure signature are clear. Do not start with a SKU and work backward into architecture.',
  },
  {
    label: 'What to tune first',
    detail: 'Tune pathing, queue boundaries, and failure-domain assumptions before escalating to a bigger or more specialized platform story.',
  },
  {
    label: 'When to hand off',
    detail: 'Once the platform posture is clear, use planner tooling for the quantitative BOM, optics, and exact tier-count decision.',
  },
];

type PlatformConstraint = {
  id: string;
  label: string;
  summary: string;
  leadProductId: string;
  alternativeProductIds: string[];
  decisionSignal: string;
  failureSignature: string;
  latencyConsequence: string;
};

type PlatformLatencyLens = {
  latencyPosture: string;
  latencyStrength: string;
  latencyRisk: string;
  latencyWatchSignal: string;
};

type PlatformTeachingCard = {
  siliconPosture: string;
  bufferingModel: string;
  topologyRole: string;
  failureSignature: string;
  architectureMode: 'radix' | 'modular' | 'single-hop' | 'deep-buffer' | 'telemetry';
};

type PlatformComparison = {
  id: string;
  title: string;
  products: [string, string];
  whenBothFit: string;
  separation: string;
  latencyDifference: string;
  decidingSignal: string;
};

const PLATFORM_CONSTRAINTS: PlatformConstraint[] = [
  {
    id: 'high-radix',
    label: 'High radix',
    summary: 'Use dense fixed platforms when synchronized collectives need symmetry and fewer path penalties.',
    leadProductId: '7060X',
    alternativeProductIds: ['7800R'],
    decisionSignal: 'Collective completion stretches when rail symmetry breaks, not when storage bursts arrive.',
    failureSignature: 'All-reduce tail grows before storage or restart paths become the main issue.',
    latencyConsequence: 'Protects synchronized collective latency by reducing path depth and symmetry penalties.',
  },
  {
    id: 'deep-buffers',
    label: 'Deep buffers',
    summary: 'Use deeper-buffer platforms when convergence and storage bursts dominate the operational pain.',
    leadProductId: '7280R3',
    alternativeProductIds: ['7280R3A'],
    decisionSignal: 'Checkpoint, ingest, or convergent receiver pressure spreads pause and queue growth faster than the fabric can absorb it.',
    failureSignature: 'Burst windows create queue spikes, HOL risk, or checkpoint slowdown before collective symmetry is the main concern.',
    latencyConsequence: 'Protects burst-time latency stability by absorbing convergence and storage pressure.',
  },
  {
    id: 'modular-fairness',
    label: 'Modular fairness',
    summary: 'Use modular VOQ spines when fairness under fan-in and clean scale growth matter more than a fixed-form-factor story.',
    leadProductId: '7800R',
    alternativeProductIds: ['7060X', '7280R3'],
    decisionSignal: 'Expansion boundaries and destination fairness are becoming the limiting factor, not simple port count.',
    failureSignature: 'Large-scale convergence or spine growth is creating hot domains and latency unfairness.',
    latencyConsequence: 'Protects latency fairness under large fan-in and expansion.',
  },
  {
    id: 'single-hop-scale',
    label: 'Single-hop scale',
    summary: 'Use distributed single-hop fabrics when the architecture problem is now topology simplification at very large scale.',
    leadProductId: '7700R',
    alternativeProductIds: ['7800R'],
    decisionSignal: 'The scale penalty is now stage count, blast radius, and global tail consistency across a very large fabric.',
    failureSignature: 'Large-scale tail inconsistency persists because the topology itself is now the bottleneck.',
    latencyConsequence: 'Protects end-to-end tail consistency by removing extra traversal stages.',
  },
  {
    id: 'telemetry-first-diagnosis',
    label: 'Telemetry-first diagnosis',
    summary: 'Use telemetry-rich platforms when time-to-isolation is part of the architecture requirement.',
    leadProductId: '7280R3A',
    alternativeProductIds: ['7280R3'],
    decisionSignal: 'Burst behavior is real, but the team is losing time because hotspots cannot be isolated quickly enough.',
    failureSignature: 'Latency excursions are brief and operationally expensive because they are hard to localize.',
    latencyConsequence: 'Protects operational latency by shortening time-to-isolation during burst events.',
  },
];

const PLATFORM_LATENCY_LENS: Record<string, PlatformLatencyLens> = {
  '7060X': {
    latencyPosture: 'Collective tail latency protection',
    latencyStrength: 'Keeps synchronized east-west paths shallow and symmetric when the real goal is low-latency collective completion.',
    latencyRisk: 'Misapplied when burst absorption is the real problem, it will expose queue mistakes quickly instead of forgiving them.',
    latencyWatchSignal: 'Slowest-rail completion time, path spread, and tail jitter during collective phases.',
  },
  '7800R': {
    latencyPosture: 'Fairness under scale',
    latencyStrength: 'Protects latency fairness under large fan-in by preventing one hot receiver or growth boundary from stretching everyone else.',
    latencyRisk: 'Too heavy if the environment only needs dense fixed symmetry and not modular fairness or scale discipline.',
    latencyWatchSignal: 'Destination-facing queue stability, fairness across linecards, and tail spread during fan-in.',
  },
  '7700R': {
    latencyPosture: 'Scale-wide tail consistency',
    latencyStrength: 'Protects end-to-end tail consistency by simplifying the topology and removing extra traversal penalties at very large scale.',
    latencyRisk: 'Over-rotates the architecture if the environment has not actually outgrown conventional staged design.',
    latencyWatchSignal: 'Cluster-wide tail distribution, fault-domain stability, and whether the worst path still stretches completion.',
  },
  '7280R3': {
    latencyPosture: 'Burst-time latency preservation',
    latencyStrength: 'Protects restart and storage windows from turning short convergent bursts into long queueing events.',
    latencyRisk: 'Can become an expensive crutch if the real issue is pathing or collective symmetry rather than burst absorption.',
    latencyWatchSignal: 'Checkpoint latency spikes, convergent queue growth, and pause or HOL spread during burst windows.',
  },
  '7280R3A': {
    latencyPosture: 'Diagnostic visibility into latency events',
    latencyStrength: 'Protects operational response time by making burst-driven latency excursions easier to isolate and explain.',
    latencyRisk: 'Adds observability value, but it will not replace clean queue policy or topology discipline.',
    latencyWatchSignal: 'Per-hop burst localization, INT-derived queue timing, and fast separation of writeback vs recovery events.',
  },
};

const PLATFORM_TEACHING_CARDS: Record<string, PlatformTeachingCard> = {
  '7060X': {
    siliconPosture: 'Tomahawk fixed high-radix posture',
    bufferingModel: 'Shallow fixed-fabric discipline',
    topologyRole: 'AI leaf or spine for dense symmetric fabrics',
    failureSignature: 'Straggler rail or path skew stretches collective completion',
    architectureMode: 'radix',
  },
  '7800R': {
    siliconPosture: 'Jericho modular VOQ posture',
    bufferingModel: 'Cell-based fabric with fairness-first queueing',
    topologyRole: 'Modular AI spine for fairness and staged scale',
    failureSignature: 'Fan-in unfairness or growth boundary creates hot destinations',
    architectureMode: 'modular',
  },
  '7700R': {
    siliconPosture: 'Distributed single-hop posture',
    bufferingModel: 'Fabric simplification over staged growth',
    topologyRole: 'Distributed scale fabric for ultra-large clusters',
    failureSignature: 'Topology depth and scale-wide tail inconsistency remain the limiting factor',
    architectureMode: 'single-hop',
  },
  '7280R3': {
    siliconPosture: 'Jericho deep-buffer posture',
    bufferingModel: 'VOQ with deeper burst absorption',
    topologyRole: 'Storage and convergent boundary leaf',
    failureSignature: 'Checkpoint or ingest bursts spread pause and receiver queue growth',
    architectureMode: 'deep-buffer',
  },
  '7280R3A': {
    siliconPosture: 'Jericho 2C+ telemetry-rich posture',
    bufferingModel: 'VOQ plus observability-driven diagnosis',
    topologyRole: 'AI storage leaf where burst clarity matters',
    failureSignature: 'Brief latency excursions stay costly because hotspots are hard to localize',
    architectureMode: 'telemetry',
  },
};

const PLATFORM_COMPARISONS: PlatformComparison[] = [
  {
    id: '7060X-7800R',
    title: '7060X vs 7800R',
    products: ['7060X', '7800R'],
    whenBothFit: 'Both can appear in AI backends when the team is choosing between dense fixed symmetry and modular fairness at scale.',
    separation: '7060X is the tighter answer when collective symmetry and fixed high-radix density dominate. 7800R is stronger when fan-in fairness and modular growth are the real constraints.',
    latencyDifference: '7060X protects collective tail latency through shorter symmetric paths. 7800R protects latency fairness when convergence and scale create hot receiver domains.',
    decidingSignal: 'If tail stretch comes from rail asymmetry, lean 7060X. If destination fairness and growth boundaries dominate, lean 7800R.',
  },
  {
    id: '7800R-7280R3',
    title: '7800R vs 7280R3',
    products: ['7800R', '7280R3'],
    whenBothFit: 'Both can sound right when a team sees queue pressure and wants more resilience than a shallow fixed fabric can offer.',
    separation: '7800R is the spine-scale fairness answer. 7280R3 is the convergent boundary and storage-burst answer.',
    latencyDifference: '7800R protects latency fairness under scale-wide fan-in. 7280R3 protects burst-time latency during checkpoint, ingest, and receiver convergence events.',
    decidingSignal: 'If the dominant hotspot is at scale boundaries or modular spine growth, lean 7800R. If the dominant hotspot is checkpoint or storage fan-in, lean 7280R3.',
  },
  {
    id: '7800R-7700R',
    title: '7800R vs 7700R',
    products: ['7800R', '7700R'],
    whenBothFit: 'Both fit very large environments where the fixed-fabric story is no longer enough.',
    separation: '7800R keeps the staged topology and improves fairness within it. 7700R changes the topology answer by collapsing the scale problem into a single-hop model.',
    latencyDifference: '7800R protects fairness inside a large staged fabric. 7700R protects scale-wide tail consistency by removing extra traversal stages.',
    decidingSignal: 'If the challenge is still modular growth inside a conventional architecture, lean 7800R. If the topology itself is the scale penalty, lean 7700R.',
  },
  {
    id: '7280R3-7280R3A',
    title: '7280R3 vs 7280R3A',
    products: ['7280R3', '7280R3A'],
    whenBothFit: 'Both fit storage-heavy or convergent environments where deeper buffering is already justified.',
    separation: '7280R3 is the straightforward deep-buffer answer. 7280R3A adds telemetry-rich observability when diagnosis speed becomes part of the value.',
    latencyDifference: '7280R3 protects burst absorption directly. 7280R3A protects operational latency by making burst-driven latency problems visible faster.',
    decidingSignal: 'If the missing capability is burst headroom, lean 7280R3. If the missing capability is fast burst localization and tuning feedback, lean 7280R3A.',
  },
];

const getConstraintForProduct = (productId: string) =>
  PLATFORM_CONSTRAINTS.find(
    (constraint) =>
      constraint.leadProductId === productId || constraint.alternativeProductIds.includes(productId)
  );

const deriveRecommendedConstraintId = (
  workloadProfile?: string,
  dataStage?: string,
  trafficPattern?: string
) => {
  if (workloadProfile === 'realtime-inference') return 'high-radix';
  if (workloadProfile === 'pretraining') return 'high-radix';
  if (workloadProfile === 'scientific-hpc') return 'deep-buffers';
  if (trafficPattern === 'checkpoint-burst' || dataStage === 'checkpoint' || dataStage === 'restore') {
    return 'deep-buffers';
  }
  if (trafficPattern === 'all-reduce' || trafficPattern === 'all-to-all') return 'modular-fairness';
  return 'modular-fairness';
};

const buildPlatformCheck = (
  productId: string,
  alternativeId: string | undefined,
  latencyLens: PlatformLatencyLens
): KnowledgeCheck => {
  const alternativeLabel = alternativeId ?? 'a nearby alternative';
  const prompts: Record<string, KnowledgeCheck> = {
    '7060X': {
      id: 'hardware-check-7060x',
      prompt: 'Why choose 7060X over the nearby modular alternative?',
      correctOptionId: 'collective-symmetry',
      options: [
        { id: 'collective-symmetry', label: 'Collective symmetry is the main latency problem', rationale: `Correct. 7060X is the cleaner answer when collective tail latency depends on short symmetric paths more than modular fairness.` },
        { id: 'checkpoint-bursts', label: 'Checkpoint bursts dominate and need deep absorption', rationale: `That points more toward ${alternativeLabel} or a deep-buffer family. 7060X is less forgiving when burst absorption is the real issue.` },
        { id: 'blind-telemetry', label: 'The main issue is that bursts are hard to localize', rationale: 'That is an observability problem first, not a fixed high-radix reason by itself.' },
      ],
    },
    '7800R': {
      id: 'hardware-check-7800r',
      prompt: 'What should improve first if 7800R is the right choice?',
      correctOptionId: 'fairness',
      options: [
        { id: 'fairness', label: 'Receiver fairness and tail spread under fan-in', rationale: 'Correct. 7800R should reduce unfairness at convergent or modular boundaries, not just raise a spec-sheet number.' },
        { id: 'single-request', label: 'Single-request serving latency only', rationale: 'That is not the main reason to choose a modular VOQ spine.' },
        { id: 'checkpoint-only', label: 'Checkpoint bursts in isolation', rationale: 'That points more directly toward a deep-buffer boundary platform than a modular spine story.' },
      ],
    },
    '7700R': {
      id: 'hardware-check-7700r',
      prompt: 'Which signal would falsify a 7700R-centered platform story?',
      correctOptionId: 'topology-not-bottleneck',
      options: [
        { id: 'topology-not-bottleneck', label: 'The worst tail path is still caused by a local hot receiver, not topology depth', rationale: 'Correct. If topology simplification does not attack the real bottleneck, the single-hop story is premature.' },
        { id: 'scale-high', label: 'The cluster is very large', rationale: 'Large scale alone does not prove the topology shift is necessary.' },
        { id: 'symmetry-good', label: 'Collective symmetry already looks healthy', rationale: 'That can coexist with a valid 7700R case; it does not falsify it by itself.' },
      ],
    },
    '7280R3': {
      id: 'hardware-check-7280r3',
      prompt: 'What latency behavior should improve if 7280R3 is the right fit?',
      correctOptionId: 'burst-stability',
      options: [
        { id: 'burst-stability', label: 'Checkpoint and convergent burst windows stay bounded', rationale: 'Correct. 7280R3 should protect burst-time latency and keep queue growth from spreading during convergent events.' },
        { id: 'single-hop', label: 'Every path becomes single-hop', rationale: 'That is a topology simplification answer, not a deep-buffer boundary answer.' },
        { id: 'collective-symmetry', label: 'Collective path symmetry becomes the main gain', rationale: 'That is more aligned with a high-radix fabric explanation than deep-buffer protection.' },
      ],
    },
    '7280R3A': {
      id: 'hardware-check-7280r3a',
      prompt: 'Which latency signal best validates 7280R3A?',
      correctOptionId: 'burst-localization',
      options: [
        { id: 'burst-localization', label: latencyLens.latencyWatchSignal, rationale: 'Correct. 7280R3A earns its place when burst-driven latency events can be isolated and separated quickly enough to guide tuning.' },
        { id: 'only-throughput', label: 'A bigger aggregate throughput number alone', rationale: 'That does not prove the observability value of the platform choice.' },
        { id: 'module-count', label: 'More modular expansion headroom', rationale: 'That is a modular scale story, not the main reason to choose 7280R3A.' },
      ],
    },
  };

  return prompts[productId];
};

const HardwareSection: React.FC = () => {
  const { products } = useData();
  const {
    activeWorkloadProfile,
    activeDataMovementStage,
    activeTrafficPattern,
  } = useLearning();
  const [activeProduct, setActiveProduct] = useState(products[0]);
  const [selectedConstraintId, setSelectedConstraintId] = useState(
    deriveRecommendedConstraintId(activeWorkloadProfile, activeDataMovementStage, activeTrafficPattern)
  );
  const [panelVisible, setPanelVisible] = useState(true);
  const [hasManualSelection, setHasManualSelection] = useState(false);

  // Update active product if data changes (e.g. from Admin edit)
  useEffect(() => {
    if (products.length === 0) return;

    setActiveProduct((currentActiveProduct) => {
      if (!currentActiveProduct) {
        return products[0];
      }

      const matchingProduct = products.find((product) => product.id === currentActiveProduct.id);
      return matchingProduct || products[0];
    });
  }, [products]);

  useEffect(() => {
    if (hasManualSelection || products.length === 0) return;

    const recommendedConstraintId = deriveRecommendedConstraintId(
      activeWorkloadProfile,
      activeDataMovementStage,
      activeTrafficPattern
    );
    const recommendedConstraint = PLATFORM_CONSTRAINTS.find(
      (constraint) => constraint.id === recommendedConstraintId
    );
    const recommendedProduct = products.find(
      (product) => product.id === recommendedConstraint?.leadProductId
    );

    if (recommendedConstraint) {
      setSelectedConstraintId(recommendedConstraint.id);
    }
    if (recommendedProduct) {
      setActiveProduct(recommendedProduct);
    }
  }, [
    activeWorkloadProfile,
    activeDataMovementStage,
    activeTrafficPattern,
    hasManualSelection,
    products,
  ]);

  // Fade the spec sheet when switching products
  useEffect(() => {
    setPanelVisible(false);
    const t = setTimeout(() => setPanelVisible(true), 50);
    return () => clearTimeout(t);
  }, [activeProduct?.id]);

  if (!activeProduct) return null;

  const ProductIcon = ICON_MAP[activeProduct.iconKey] || Server;
  const tip = PRODUCT_TIPS[activeProduct.id];
  const platformDecision = PLATFORM_DECISION_CONTENT[activeProduct.id] || PLATFORM_DECISION_CONTENT['7060X'];
  const latencyLens = PLATFORM_LATENCY_LENS[activeProduct.id];
  const teachingCard = PLATFORM_TEACHING_CARDS[activeProduct.id];
  const selectedConstraint =
    PLATFORM_CONSTRAINTS.find((constraint) => constraint.id === selectedConstraintId) ||
    getConstraintForProduct(activeProduct.id) ||
    PLATFORM_CONSTRAINTS[0];
  const activeComparison =
    PLATFORM_COMPARISONS.find(
      (comparison) =>
        comparison.products.includes(activeProduct.id) &&
        selectedConstraint.alternativeProductIds.some((id) => comparison.products.includes(id))
    ) ||
    PLATFORM_COMPARISONS.find((comparison) => comparison.products.includes(activeProduct.id)) ||
    PLATFORM_COMPARISONS[0];
  const nearbyAlternativeId = activeComparison.products.find((id) => id !== activeProduct.id);
  const nearbyAlternative = products.find((product) => product.id === nearbyAlternativeId);
  const activeCheck = buildPlatformCheck(activeProduct.id, nearbyAlternativeId, latencyLens);
  const contextRecommendation =
    activeWorkloadProfile || activeDataMovementStage || activeTrafficPattern
      ? {
          title: `${selectedConstraint.label} is the likely next platform question`,
          detail: `${selectedConstraint.summary} ${selectedConstraint.latencyConsequence}`,
        }
      : null;

  const heroChips = [
    { label: 'Silicon posture', value: teachingCard.siliconPosture },
    { label: 'Buffering model', value: teachingCard.bufferingModel },
    { label: 'Topology role', value: teachingCard.topologyRole },
    { label: 'Failure signature', value: teachingCard.failureSignature },
    { label: 'Latency posture', value: latencyLens.latencyPosture },
  ];

  const handleConstraintSelect = (constraint: PlatformConstraint) => {
    setHasManualSelection(true);
    setSelectedConstraintId(constraint.id);
    const nextProduct = products.find((product) => product.id === constraint.leadProductId);
    if (nextProduct) {
      setActiveProduct(nextProduct);
    }
  };

  const handleProductSelect = (productId: string) => {
    const nextProduct = products.find((product) => product.id === productId);
    if (!nextProduct) return;
    setHasManualSelection(true);
    setActiveProduct(nextProduct);
    const inferredConstraint = getConstraintForProduct(productId);
    if (inferredConstraint) {
      setSelectedConstraintId(inferredConstraint.id);
    }
  };

  const visualSteps =
    teachingCard.architectureMode === 'radix'
      ? ['GPU rails stay aligned', 'Fixed high-radix paths stay short', 'Collective tail stays bounded']
      : teachingCard.architectureMode === 'modular'
        ? ['Fan-in reaches modular spine', 'VOQ fairness isolates hot destinations', 'Tail spread stays bounded across growth']
        : teachingCard.architectureMode === 'single-hop'
          ? ['Topology stages collapse', 'Distributed fabric removes extra traversal', 'Scale-wide tail remains consistent']
          : teachingCard.architectureMode === 'deep-buffer'
            ? ['Checkpoint or ingest bursts arrive', 'Deep buffering absorbs convergence', 'Burst-time latency stays contained']
            : ['Burst event appears briefly', 'INT or per-hop visibility localizes it', 'Operational response time drops'];

  return (
    <section id="hardware" className="py-32 bg-[#0F1117] border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="mb-12">
          <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4">
            Domain · Platform Considerations
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Platform Considerations
          </h2>
          <p className="text-slate-400 max-w-2xl text-lg">
            Platform choice follows workload behavior. This module explains when radix, deep buffers, VOQ, modular scale, and observability become the next real architecture question.
          </p>
        </div>

        <div className="mb-10 grid gap-4 md:grid-cols-5">
          {[
            'Start with the constraint',
            'See which platform family answers it',
            'Check the latency posture',
            'Validate with telemetry',
            'Escalate to planning',
          ].map((item, index) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-[#161b22] p-4">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-blue-300">
                Step {index + 1}
              </div>
              <p className="text-sm leading-relaxed text-slate-200">{item}</p>
            </div>
          ))}
        </div>

        {contextRecommendation ? (
          <div className="mb-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/8 p-5">
            <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">
              Context Recommendation
            </div>
            <div className="text-sm font-semibold text-white">{contextRecommendation.title}</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{contextRecommendation.detail}</p>
          </div>
        ) : null}

        <div className="mb-8 rounded-3xl border border-white/10 bg-[#161b22] p-6">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">
            Constraint chooser
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {PLATFORM_CONSTRAINTS.map((constraint) => {
              const isActive = selectedConstraint.id === constraint.id;
              return (
                <button
                  key={constraint.id}
                  type="button"
                  onClick={() => handleConstraintSelect(constraint)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? 'border-blue-500/40 bg-blue-950/25 text-white'
                      : 'border-white/10 bg-[#0d1117] text-slate-300 hover:border-white/20'
                  }`}
                >
                  <div className="mb-2 text-sm font-semibold">{constraint.label}</div>
                  <p className="mb-3 text-sm leading-relaxed text-slate-400">{constraint.summary}</p>
                  <div className="text-[11px] font-mono uppercase tracking-[0.16em] text-cyan-300">
                    Latency consequence
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {constraint.latencyConsequence}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-8 xl:flex-row">
          <div className="xl:w-80 shrink-0">
            <div className="rounded-3xl border border-white/10 bg-[#161b22] p-5">
              <div className="mb-3 text-xs font-mono uppercase tracking-[0.22em] text-slate-500">
                Platform families
              </div>
              <div className="space-y-2">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product.id)}
                    className={`relative w-full rounded-2xl border p-4 text-left transition-all ${
                      activeProduct.id === product.id
                        ? 'border-blue-500/50 bg-blue-950/25 text-white'
                        : 'border-white/10 bg-[#0d1117] text-slate-300 hover:border-white/20'
                    }`}
                    aria-pressed={activeProduct.id === product.id}
                  >
                    {activeProduct.id === product.id ? (
                      <div className="absolute inset-y-0 left-0 w-1 rounded-l-2xl bg-blue-500" />
                    ) : null}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-bold">{product.series}</span>
                      {activeProduct.id === product.id ? <ChevronRight size={14} className="text-blue-300" /> : null}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{product.role}</div>
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#0d1117] p-4">
                <div className="mb-2 flex items-center gap-2 text-slate-300">
                  <Info size={14} />
                  <span className="text-xs font-bold uppercase">{tip ? tip.title : 'Platform note'}</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-400">{tip ? tip.body : activeProduct.role}</p>
              </div>
            </div>
          </div>

          <div
            className={`flex-1 rounded-3xl border border-white/10 bg-[#161b22] p-6 transition-opacity duration-200 ${panelVisible ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="mb-6 flex flex-col gap-4 border-b border-white/5 pb-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded text-blue-400">
                    <ProductIcon size={24} />
                  </div>
                  <h3 className="text-3xl font-bold text-white">{activeProduct.series}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-blue-500 font-mono text-sm">{activeProduct.role}</div>
                  {activeProduct.scale && (
                    <>
                      <span className="text-slate-700">·</span>
                      <span className="text-slate-500 font-mono text-xs">
                        {activeProduct.scale}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="max-w-xl">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                  Why this platform
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  {selectedConstraint.summary} {platformDecision.whatLeadsHere}
                </p>
              </div>
            </div>

            <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {heroChips.map((chip) => (
                <div key={chip.label} className="rounded-2xl border border-white/10 bg-[#0d1117] p-4">
                  <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                    {chip.label}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-200">{chip.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">
                  What latency behavior this protects
                </div>
                <div className="mb-4 text-lg font-semibold text-white">{latencyLens.latencyPosture}</div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-200">
                      <Gauge size={15} />
                      Latency strength
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">{latencyLens.latencyStrength}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-200">
                      <TimerReset size={15} />
                      Risk if misapplied
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">{latencyLens.latencyRisk}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-500/8 p-4">
                  <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">
                    Best latency signal to watch
                  </div>
                  <p className="text-sm leading-relaxed text-slate-200">{latencyLens.latencyWatchSignal}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-blue-300">
                  Architecture and latency consequence
                </div>
                <div className="space-y-3">
                  {visualSteps.map((step, index) => (
                    <div key={step} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 text-xs font-bold text-blue-300">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-relaxed text-slate-200">{step}</p>
                      {index < visualSteps.length - 1 ? <MoveRight size={14} className="ml-auto text-slate-600" /> : <Activity size={14} className="ml-auto text-emerald-300" />}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-200">
                    What fails first if you chose wrong
                  </div>
                  <p className="text-sm leading-relaxed text-amber-50">{teachingCard.failureSignature}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-blue-300">
                  Decision decoder
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{platformDecision.bestFit}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{platformDecision.operationalConsequence}</p>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                    What this platform should prove
                  </div>
                  <p className="text-sm leading-relaxed text-slate-200">
                    The chosen platform should reduce the dominant workload risk, not just improve a spec sheet. If it does not change the actual failure signature, the platform story is still incomplete.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-violet-300">
                  Nearby comparison
                </div>
                <div className="mb-2 text-lg font-semibold text-white">{activeComparison.title}</div>
                <p className="text-sm leading-relaxed text-slate-300">{activeComparison.whenBothFit}</p>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">What separates them</div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-300">{activeComparison.separation}</p>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">Latency difference</div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-300">{activeComparison.latencyDifference}</p>
                  </div>
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">What signal decides</div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-200">{activeComparison.decidingSignal}</p>
                  </div>
                </div>
                {nearbyAlternative ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Nearby alternative
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-200">{nearbyAlternative.series}</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mb-6">
              <QuickKnowledgeCheck check={activeCheck} moduleId="hardware" eyebrow="Transfer check" />
            </div>

            <div className="space-y-4">
              <CompactDisclosure
                eyebrow="Datasheet & SKU detail"
                title="Specs, source-backed claims, and configuration variants"
                summary="Keep the exact product detail available, but make it secondary to the architecture and latency decision."
              >
                {activeProduct.specs.map((spec, i) => (
                  <div
                    key={i}
                    className="mb-2 flex items-center gap-2 rounded border border-white/10 bg-[#0d1117] px-3 py-2 text-xs font-mono text-slate-300"
                    data-claim-id={hasSourceMetadata(spec) ? spec.claimId : undefined}
                  >
                    <span>{claimText(spec)}</span>
                    {hasSourceMetadata(spec) && <SourceBadge claim={spec} />}
                  </div>
                ))}
                <div>
                  <h4 className="mb-4 text-xs font-mono uppercase tracking-wider text-slate-500">
                    Description
                  </h4>
                  <div
                    className="flex flex-wrap items-start gap-2 mb-4"
                    data-claim-id={
                      hasSourceMetadata(activeProduct.desc) ? activeProduct.desc.claimId : undefined
                    }
                  >
                    <DescriptionRenderer text={claimText(activeProduct.desc)} />
                    {hasSourceMetadata(activeProduct.desc) && (
                      <SourceBadge claim={activeProduct.desc} />
                    )}
                  </div>

                  {activeProduct.datasheetUrl && (
                    <a
                      href={activeProduct.datasheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-950/20 border border-blue-500/20 rounded hover:bg-blue-900/30 hover:border-blue-500/40 transition-colors text-blue-400 text-xs font-bold font-mono uppercase tracking-wide group"
                    >
                      <ExternalLink
                        size={14}
                        className="group-hover:scale-110 transition-transform"
                      />{' '}
                      View Datasheet
                    </a>
                  )}
                </div>

                {activeProduct.keyFeatures && activeProduct.keyFeatures.length > 0 && (
                  <div>
                    <h4 className="mb-4 text-xs font-mono uppercase tracking-wider text-slate-500">
                      Key Features
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {activeProduct.keyFeatures.map((feature, i) => {
                        const FeatureIcon = feature.iconKey ? ICON_MAP[feature.iconKey] : null;
                        return (
                          <div
                            key={i}
                            className="bg-[#0d1117] border border-white/5 border-t-2 border-t-blue-500/30 rounded-lg p-3"
                          >
                            {FeatureIcon && (
                              <FeatureIcon size={14} className="text-blue-400 mb-2" />
                            )}
                            <div className="text-xs text-slate-500 font-mono mb-1">
                              {feature.label}
                            </div>
                            <div className="text-sm font-bold text-white font-mono">
                              {claimText(feature.value)}
                            </div>
                            <div className="text-xs text-slate-600 mt-1 leading-tight">
                              {claimText(feature.subtext)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeProduct.variants && (
                  <div>
                    <h4 className="mb-4 text-xs font-mono uppercase tracking-wider text-slate-500">
                      Configuration Variants
                    </h4>
                    <div className="space-y-2">
                      {activeProduct.variants.map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-[#0d1117] border border-white/5 rounded hover:border-blue-500/30 transition-colors"
                        >
                          <span className="text-blue-100 font-mono text-xs font-bold">
                            {v.name}
                          </span>
                          <div className="flex gap-4 text-xs text-slate-500 font-mono">
                            <span>{v.chip}</span>
                            <span className="w-px h-4 bg-slate-800"></span>
                            <span
                              data-claim-id={
                                hasSourceMetadata(v.ports) ? v.ports.claimId : undefined
                              }
                            >
                              {claimText(v.ports)}
                            </span>
                            <span className="w-px h-4 bg-slate-800"></span>
                            <span className="text-slate-600">{v.formFactor}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CompactDisclosure>

              <CompactDisclosure
                eyebrow="Why this matters"
                title="Tradeoffs, planner handoff, and platform detail"
                summary="Keep the operational and planning detail available, but secondary to the main decision frame."
              >
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-300">
                      Tradeoffs
                    </div>
                    <ul className="space-y-2">
                      {platformDecision.tradeoffs.map((item) => (
                        <li key={item} className="flex gap-2 text-sm text-slate-300">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-blue-300">
                      {PLANNER_HANDOFF_LABEL}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">{PLANNER_HANDOFF_STANDARD_TEXT}</p>
                  </div>
                </div>
              </CompactDisclosure>

              <CompactDisclosure
                eyebrow="Apply this"
                title="Telemetry, runbooks, and infrastructure implications"
                summary="Validate the platform choice with the right signal before escalating to a bigger product story."
              >
                <div className="space-y-6">
                  <TelemetryWatchPanel
                    title="Platform validation telemetry"
                    intro="These watchpoints follow the active platform because different platform choices are supposed to solve different architecture problems."
                    items={platformDecision.telemetry}
                  />
                  <RunbookLinksPanel
                    title="If the platform story turns into an incident"
                    intro="These are the first operational paths to open when the selected platform still is not behaving as intended."
                    items={platformDecision.runbooks}
                  />
                  <InfrastructureImplicationsPanel items={PLATFORM_IMPLICATIONS} />
                </div>
              </CompactDisclosure>
            </div>
          </div>
        </div>

        <SoWhatCallout body="Do not choose a platform because one series sounds stronger in isolation. Choose it because the workload and failure signature prove that radix, deep buffering, modularity, or observability are the next real architecture constraint." />
      </div>
    </section>
  );
};

export default HardwareSection;
