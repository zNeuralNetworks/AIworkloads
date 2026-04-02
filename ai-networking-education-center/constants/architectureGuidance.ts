import type { ArchitecturePatternReference, TelemetryWatchpoint } from '../types';

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
