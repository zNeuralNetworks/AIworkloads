import { InfrastructureImplication } from '../types';
import { PLANNER_HANDOFF_DESTINATION } from './plannerHandoff';

export type Suitability = 'poor' | 'good' | 'excellent';

export interface CommunicationPattern {
  id: string;
  title: string;
  subtitle: string;
  iconKey: string;
  triggerCondition: string;
  stressSignature: string;
  designPosture: string;
  operationalRisk: string;
  runbooks: { id: string; label: string }[];
}

export interface LBMechanism {
  id: string;
  title: string;
  subtitle: string;
  iconKey: string;
  description: string;
  strengths: string[];
  limitations: string[];
  tier: string;
  awareness: string;
  suitability: Suitability;
  suitabilityLabel: string;
}

export interface LBDecisionRow {
  mechanism: string;
  tier: string;
  awareness: string;
  aiSuitability: Suitability;
  aiSuitabilityLabel: string;
  notes: string;
}

export const COMMUNICATION_PATTERNS: CommunicationPattern[] = [
  {
    id: 'all-reduce',
    title: 'All-Reduce',
    subtitle: 'Synchronized gradient exchange',
    iconKey: 'GitMerge',
    triggerCondition:
      'Distributed training jobs synchronize model state at each step or micro-batch boundary.',
    stressSignature:
      'Repeated east-west bursts, strong path symmetry sensitivity, and straggler amplification on the slowest rail.',
    designPosture:
      'Non-blocking backend, strong entropy, balanced pathing, and early congestion signaling before pause takes over.',
    operationalRisk:
      'Tail-latency stragglers and rail imbalance expand job completion time far faster than average utilization suggests.',
    runbooks: [
      { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce' },
      { id: 'ecn-instability', label: 'ECN Mark Rate Instability' },
    ],
  },
  {
    id: 'all-to-all',
    title: 'All-to-All',
    subtitle: 'Every participant exchanges with every other participant',
    iconKey: 'Network',
    triggerCondition:
      'Mixture-of-experts, embedding exchange, and distributed shuffle phases redistribute data across many peers at once.',
    stressSignature:
      'High fan-out, burst receiver pressure, and broad queue occupancy growth rather than one obvious hot flow.',
    designPosture:
      'Wide path diversity, careful queue thresholding, and receiver-side headroom sized for burst convergence.',
    operationalRisk:
      'Receiver incast and uneven shard placement create throughput collapse even when the fabric looks underutilized at coarse granularity.',
    runbooks: [
      { id: 'incast-collapse', label: 'Throughput Collapse During Incast' },
      { id: 'ecn-instability', label: 'ECN Mark Rate Instability' },
    ],
  },
  {
    id: 'parameter-server',
    title: 'Parameter Server',
    subtitle: 'Centralized aggregation or update tiers',
    iconKey: 'Server',
    triggerCondition:
      'Clients or workers converge on a bounded aggregation tier that coordinates updates, state, or model partitions.',
    stressSignature:
      'Persistent fan-in toward a smaller receiver set, hotspot receivers, and asymmetric north-south versus east-west pressure.',
    designPosture:
      'Protect receiver tiers, isolate heavy update classes, and instrument hotspot nodes before tuning transport behavior.',
    operationalRisk:
      'A small number of overloaded receivers or cache tiers can become the real bottleneck while the broader fabric appears healthy.',
    runbooks: [{ id: 'incast-collapse', label: 'Throughput Collapse During Incast' }],
  },
  {
    id: 'moe-dispatch',
    title: 'MoE Dispatch',
    subtitle: 'Expert routing with skew-sensitive fan-out',
    iconKey: 'Boxes',
    triggerCondition:
      'Token routing or expert dispatch sends uneven traffic to subsets of participants based on model gating decisions.',
    stressSignature:
      'Receiver skew, bursty expert hotspots, and fast shifts in queue occupancy as the active expert set changes.',
    designPosture:
      'Design for skew, not just average balance. Monitor hotspot receivers, cache-path variance, and queue volatility.',
    operationalRisk:
      'Expert imbalance causes localized congestion and tail amplification long before bulk utilization shows a cluster-wide problem.',
    runbooks: [
      { id: 'incast-collapse', label: 'Throughput Collapse During Incast' },
      { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce' },
    ],
  },
];

export const LB_MECHANISMS: LBMechanism[] = [
  {
    id: 'ecmp',
    title: 'ECMP',
    subtitle: 'Equal-Cost Multi-Path',
    iconKey: 'GitMerge',
    description:
      'The baseline distribution mechanism in Ethernet fabrics. It is simple and universal, but synchronized elephant flows can collide on the same members while adjacent paths stay underused.',
    strengths: [
      'Universal support across platforms',
      'Predictable per-flow path selection',
      'Good enough for smaller fabrics or lower burst coordination',
    ],
    limitations: [
      'Hash collisions create hotspots with synchronized collectives',
      'No visibility into queue depth or actual link stress',
      'Weak fit for highly coordinated GPU cluster flows at scale',
    ],
    tier: 'Leaf + Spine',
    awareness: 'Flow Hash',
    suitability: 'good',
    suitabilityLabel: 'Baseline',
  },
  {
    id: 'dlb',
    title: 'DLB',
    subtitle: 'Dynamic Load Balancing',
    iconKey: 'Activity',
    description:
      'DLB reacts to observed queue and load behavior on ECMP members and steers new traffic away from hotter paths. It improves burst response at the leaf but remains reactive rather than workload-semantic.',
    strengths: [
      'Responds to real queue behavior',
      'Reduces hotspot formation during bursty collectives',
      'Pairs well with CLB at the spine layer',
    ],
    limitations: [
      'Acts after congestion begins',
      'Leaf-scoped rather than end-to-end collective-aware',
      'Platform support is narrower than baseline ECMP',
    ],
    tier: 'Leaf',
    awareness: 'Queue Depth',
    suitability: 'good',
    suitabilityLabel: 'Good',
  },
  {
    id: 'clb',
    title: 'CLB',
    subtitle: 'Cluster Load Balancing',
    iconKey: 'Network',
    description:
      'CLB is collective-aware at the spine and is designed for RoCEv2 collective traffic patterns. It improves uplink distribution when synchronized cluster behavior would defeat simple hashing.',
    strengths: [
      'Aware of collective traffic behavior',
      'Improves spine-level uplink utilization balance',
      'Designed for GPU cluster scale and synchronized communication',
    ],
    limitations: [
      'Spine-only and complementary to leaf behavior',
      'Useful primarily where collective identification is meaningful',
      'Does not eliminate the need for disciplined host and leaf posture',
    ],
    tier: 'Spine',
    awareness: 'Collective-Aware',
    suitability: 'excellent',
    suitabilityLabel: 'Excellent',
  },
];

export const LB_DECISION_TABLE: LBDecisionRow[] = [
  {
    mechanism: 'ECMP',
    tier: 'Leaf + Spine',
    awareness: 'Flow Hash',
    aiSuitability: 'good',
    aiSuitabilityLabel: 'Baseline',
    notes: 'Useful starting point, but collision risk rises quickly with synchronized collectives.',
  },
  {
    mechanism: 'DLB',
    tier: 'Leaf',
    awareness: 'Queue Depth',
    aiSuitability: 'good',
    aiSuitabilityLabel: 'Good',
    notes: 'Improves burst response at the leaf where hotspots first become visible.',
  },
  {
    mechanism: 'CLB',
    tier: 'Spine',
    awareness: 'Collective-Aware',
    aiSuitability: 'excellent',
    aiSuitabilityLabel: 'Excellent',
    notes: 'Best fit when collective semantics materially influence spine uplink balance.',
  },
  {
    mechanism: 'Packet Spraying',
    tier: 'NIC / UET',
    awareness: 'Per-Packet',
    aiSuitability: 'excellent',
    aiSuitabilityLabel: 'Excellent',
    notes: 'Eliminates hash collision, but requires transport tolerance for reordering.',
  },
];

export const COMMUNICATION_MODULE_IMPLICATIONS: InfrastructureImplication[] = [
  {
    label: 'What fails first',
    detail:
      'Communication-pattern mismatch shows up first as hotspots, stragglers, or receiver collapse, not as a neat fabric-wide utilization increase.',
  },
  {
    label: 'What to monitor first',
    detail:
      'Track queue occupancy volatility, ECN stability, retransmits, and path or receiver skew for the specific collective or fan-in pattern in play.',
  },
  {
    label: 'What to tune first',
    detail:
      'Tune path distribution and congestion posture according to the communication pattern before changing platform assumptions or oversubscription targets.',
  },
  {
    label: 'When to hand off',
    detail:
      `Once the dominant communication pattern is clear, move to ${PLANNER_HANDOFF_DESTINATION} for quantitative implementation outputs such as radix, lane count, pod scale, and optics.`,
  },
];
