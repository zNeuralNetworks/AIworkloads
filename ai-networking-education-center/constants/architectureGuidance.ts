import type {
  ArchitecturePatternReference,
  DecisionSimulatorPrompt,
  InfrastructureImplication,
  TelemetryWatchpoint,
} from '../types';
import { PLANNER_HANDOFF_DESTINATION } from './plannerHandoff';

export const VENDOR_NEUTRAL_ARCHITECTURE_LENS = [
  {
    title: 'Start with workload synchronization',
    detail:
      'Choose the fabric posture based on whether the workload is barrier-driven, receiver-convergent, or storage-coupled. Protocol names come later.',
  },
  {
    title: 'Design for bounded tail behavior',
    detail:
      'Architecture decisions should optimize predictable completion and recovery behavior, not just peak throughput or average link utilization.',
  },
  {
    title: 'Treat observability as part of the design',
    detail:
      'If queue growth, path skew, and endpoint reaction are not measurable, the architecture is not operationally complete.',
  },
];

export const ARCHITECTURE_PATTERN_REFERENCES: ArchitecturePatternReference[] = [
  {
    id: 'deterministic-collective-fabric',
    title: 'Deterministic collective fabric',
    bestFitWorkload: 'Synchronized pre-training and all-reduce-heavy workloads with strict step-time sensitivity.',
    topologyPosture: 'Non-blocking Clos, balanced rails, strong path symmetry, and minimal oversubscription tolerance.',
    strengths: [
      'Best match for collective-heavy east-west traffic',
      'Reduces straggler amplification across synchronized workers',
      'Keeps congestion posture predictable under burst coordination',
    ],
    tradeoffs: [
      'Higher fabric discipline and lower tolerance for uneven pathing',
      'More sensitive to rail imbalance and physical-layer outliers',
    ],
    operationalComplexity: 'High. Requires disciplined telemetry, congestion posture, and rail validation.',
    migrationConstraints: 'Do not inherit legacy oversubscription assumptions from three-tier application networks.',
    telemetryWatchpoints: ['Rail utilization spread', 'Collective tail latency', 'ECN-to-PFC sequence', 'CRC/FCS outliers on worker links'],
    plannerTrigger: 'When the remaining question is radix, plane count, or optics budget rather than behavioral fit.',
  },
  {
    id: 'burst-tolerant-mixed-fabric',
    title: 'Burst-tolerant mixed workflow fabric',
    bestFitWorkload: 'Mixed training, checkpoint, shuffle, and storage-coupled scientific workflows.',
    topologyPosture: 'Balanced east-west fabric with explicit queue isolation and checkpoint-aware traffic-class or path separation.',
    strengths: [
      'Handles lifecycle transitions better than a training-only posture',
      'Improves checkpoint and restore determinism',
      'Reduces storage-driven interference with collective phases',
    ],
    tradeoffs: [
      'Can hide bottlenecks if storage coupling is not instrumented',
      'May need more explicit policy boundaries than a pure training backend',
    ],
    operationalComplexity: 'Medium to high. Success depends on validating stage-specific counters, not only steady-state throughput.',
    migrationConstraints: 'Do not treat storage traffic as a backend afterthought once checkpoint and restore dominate recovery posture.',
    telemetryWatchpoints: ['Checkpoint duration', 'First-batch delay', 'Storage uplink saturation', 'Queue occupancy during shuffle'],
    plannerTrigger: 'When storage isolation, tier count, or path segmentation becomes a quantitative implementation decision.',
  },
  {
    id: 'modular-pod-expansion-fabric',
    title: 'Modular pod expansion fabric',
    bestFitWorkload: 'Uncertain scale trajectories, phased deployment, or budget-staged cluster growth.',
    topologyPosture: 'Pod-oriented design with clear expansion boundaries and a planned path from smaller Clos domains into multi-plane scale.',
    strengths: [
      'Supports phased build-out without pretending future scale does not matter',
      'Makes migration constraints explicit early',
      'Useful when workload behavior is clear but final scale is not',
    ],
    tradeoffs: [
      'Expansion discipline matters; weak boundary planning creates asymmetric growth problems',
      'May postpone some optimization until scale assumptions are validated',
    ],
    operationalComplexity: 'Medium. Easier initial deployment, but expansion decisions must stay tied to workload posture.',
    migrationConstraints: 'Expansion paths must be designed before the first pod is treated as a permanent architecture.',
    telemetryWatchpoints: ['Inter-pod utilization trend', 'Hotspot growth at expansion boundaries', 'Receiver skew during fan-in phases', 'JCT drift across pod additions'],
    plannerTrigger: 'When pod count, inter-pod optics, or super-spine introduction becomes the next gating decision.',
  },
];

export const ARCHITECTURE_TELEMETRY_WATCHPOINTS: TelemetryWatchpoint[] = [
  {
    label: 'Path symmetry',
    signal: 'Persistent rail or uplink imbalance under synchronized load',
    whyItMatters: 'A clean architecture on paper still fails if one path consistently stretches collective completion.',
  },
  {
    label: 'Burst containment',
    signal: 'Queue growth remains local and ECN appears before pause spreads',
    whyItMatters: 'This is the difference between an architecture that absorbs pressure and one that relies on late rescue.',
  },
  {
    label: 'Lifecycle stability',
    signal: 'First-batch delay, checkpoint duration, and restart readiness stay bounded across runs',
    whyItMatters: 'Architecture quality shows up at stage transitions before it shows up in flat bandwidth charts.',
  },
  {
    label: 'Expansion health',
    signal: 'Pod or plane additions do not create new hotspot boundaries or disproportionate tail growth',
    whyItMatters: 'Growth posture is part of architecture quality, not a separate future concern.',
  },
];

export const ARCHITECTURE_DECISION_PROMPTS: DecisionSimulatorPrompt[] = [
  {
    id: 'synchronization',
    title: 'Synchronization profile',
    prompt: 'What kind of coordination pressure dominates the workload?',
    options: [
      { id: 'barrier', label: 'Barrier-driven', description: 'Synchronized collectives and step-time sensitivity dominate.' },
      { id: 'mixed', label: 'Mixed-stage', description: 'Checkpoint, shuffle, and storage transitions matter alongside collectives.' },
      { id: 'uncertain', label: 'Still emerging', description: 'The exact workload mix is not yet stable enough to optimize around one pattern.' },
    ],
  },
  {
    id: 'storageCoupling',
    title: 'Storage coupling',
    prompt: 'How much do checkpoint, restore, or data staging drive the fabric conversation?',
    options: [
      { id: 'low', label: 'Low', description: 'Storage is present but not the main architectural pressure point.' },
      { id: 'high', label: 'High', description: 'Checkpoint, restore, or ingest behavior is a first-class design event.' },
    ],
  },
  {
    id: 'scaleCertainty',
    title: 'Scale certainty',
    prompt: 'How stable is the cluster-scale assumption?',
    options: [
      { id: 'fixed', label: 'Mostly known', description: 'The target cluster size and topology horizon are fairly clear.' },
      { id: 'growing', label: 'Still moving', description: 'Pod count, planes, or overall scale are expected to evolve materially.' },
    ],
  },
  {
    id: 'tailSensitivity',
    title: 'Tail-latency sensitivity',
    prompt: 'How costly are stragglers, variance, or uneven rails?',
    options: [
      { id: 'strict', label: 'Strict', description: 'One slow path or rail materially harms job time or recovery posture.' },
      { id: 'moderate', label: 'Moderate', description: 'Consistency matters, but phased optimization is acceptable.' },
    ],
  },
];

export const ARCHITECTURE_MODULE_IMPLICATIONS: InfrastructureImplication[] = [
  {
    label: 'What fails first',
    detail: 'Rail loss under synchronized collective traffic. Asymmetric topologies show this as step-time variance before any bandwidth metric looks wrong.',
  },
  {
    label: 'What to monitor first',
    detail: 'Path-group utilization symmetry and per-rail queue depth during collective phases. Asymmetry here exposes whether the topology posture matches the workload geometry.',
  },
  {
    label: 'What to tune first',
    detail: 'Tune path redundancy assumptions and failure-domain boundaries before adjusting oversubscription ratios or adding capacity. The topology posture should hold under single-rail loss; fix the path design before changing platform scale.',
  },
  {
    label: 'When to hand off',
    detail: `Once the topology posture is defensible against the active workload profile and failure mode, move to ${PLANNER_HANDOFF_DESTINATION} for quantitative implementation outputs such as radix, lane count, pod scale, and optics.`,
  },
];
