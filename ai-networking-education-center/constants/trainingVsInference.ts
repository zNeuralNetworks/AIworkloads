import { InfrastructureImplication, TrafficPatternLabItem, WorkloadProfile } from '../types';

export interface WorkloadDecisionRow {
  dimension: string;
  preTraining: string;
  fineTuning: string;
  batchInference: string;
  realTimeInference: string;
}

export interface WorkloadDecisionNote {
  title: string;
  iconKey: string;
  guidance: string;
}

export const TRAFFIC_PATTERN_LAB: TrafficPatternLabItem[] = [
  {
    id: 'all-reduce',
    title: 'All-Reduce',
    summary:
      'Every worker contributes and every worker waits. The network carries synchronized collective exchanges where one slow path can stretch the whole training step.',
    visualType: 'all-reduce',
    dominantDirection: 'east-west',
    synchronizationProfile: 'Highly synchronized barrier-driven exchange across many workers',
    congestionRisk: 'Stragglers, rail imbalance, and incast-like pressure at collective phases',
    topologySensitivity: 'Very high; path symmetry and balanced rails directly affect step time',
    telemetry: 'Collective tail latency, ECN mark stability, slowest-rail counters, and job step variance',
    networkMeaning:
      'This pattern rewards a predictable non-blocking backend more than raw peak link utilization numbers.',
  },
  {
    id: 'all-to-all',
    title: 'All-to-All',
    summary:
      'Many senders talk to many receivers at once, creating dense fan-out and fan-in behavior. It looks like a fabric entropy problem before it looks like a bandwidth problem.',
    visualType: 'all-to-all',
    dominantDirection: 'east-west',
    synchronizationProfile: 'Broad fan-out with dense concurrent exchange',
    congestionRisk: 'Hash collisions, receiver convergence, and widespread queue growth during reshuffles',
    topologySensitivity: 'High; weak path diversity or poor balancing shows up quickly',
    telemetry: 'Leaf queue depth, path utilization spread, incast counters, and burst-time latency spikes',
    networkMeaning:
      'This pattern makes path-distribution quality visible fast, so load-balancing posture matters as much as raw capacity.',
  },
  {
    id: 'parameter-server',
    title: 'Parameter Server',
    summary:
      'Many workers converge on a smaller set of central endpoints. The network stress is not fully symmetric; it is convergence onto a small target set.',
    visualType: 'parameter-server',
    dominantDirection: 'mixed',
    synchronizationProfile: 'Worker fan-in toward central aggregation points with return updates',
    congestionRisk: 'Receiver hotspot formation and oversubscribed target paths',
    topologySensitivity: 'Medium to high; target locality and uplink concentration dominate behavior',
    telemetry: 'Server-facing queue growth, hotspot uplink utilization, request convergence timing, and target-node drops',
    networkMeaning:
      'This pattern teaches that not all AI traffic is mesh-like; concentration points can matter more than full-fabric symmetry.',
  },
  {
    id: 'moe-dispatch',
    title: 'MoE Dispatch',
    summary:
      'Traffic fans out only to selected experts, so the challenge is skew. A few popular experts can become persistent hotspots even when average utilization looks fine.',
    visualType: 'moe-dispatch',
    dominantDirection: 'east-west',
    synchronizationProfile: 'Asymmetric fan-out to selected destinations with skew-sensitive returns',
    congestionRisk: 'Expert hotspotting, queue skew, and unfairness between popular and cold paths',
    topologySensitivity: 'High; locality and skew handling matter more than average bandwidth',
    telemetry: 'Per-path imbalance, expert-target queue depth, flow skew, and long-tail service delay',
    networkMeaning:
      'This pattern shows why average utilization can lie: a few overloaded destinations can define the whole service outcome.',
  },
  {
    id: 'checkpoint-burst',
    title: 'Checkpoint Burst',
    summary:
      'Model state periodically leaves the training path and slams into storage. The network suddenly behaves like a shared storage fabric event, not a clean collective fabric.',
    visualType: 'checkpoint-burst',
    dominantDirection: 'mixed',
    synchronizationProfile: 'Periodic burst writeback from many workers toward storage targets',
    congestionRisk: 'Storage-facing incast, shared-fabric contention, and checkpoint overlap with active training',
    topologySensitivity: 'High on shared fabrics; lower if storage paths are strongly isolated',
    telemetry: 'Checkpoint duration, storage uplink saturation, pause growth near storage leaves, and accelerator idle time',
    networkMeaning:
      'This pattern makes storage coupling visible and teaches that data protection events can dominate real job time.',
  },
];

export const WORKLOAD_PROFILES: WorkloadProfile[] = [
  {
    id: 'pretraining',
    title: 'Pre-Training',
    subtitle: 'Synchronized collective-heavy scale-out',
    iconKey: 'Activity',
    summary:
      'Large synchronized collectives dominate the fabric. Step time is bounded by the slowest rail, so backend predictability matters more than average link utilization.',
    dominantTraffic: 'East-west GPU-to-GPU collectives across a backend fabric',
    burstiness: 'Highly synchronized bursts at every training step barrier',
    latencySensitivity: 'Moderate average latency, high sensitivity to tail jitter and stragglers',
    retransmissionTolerance: 'Low once congestion is sustained; retries amplify step-time variance',
    topologySensitivity: 'Very high; path symmetry and non-blocking posture strongly influence JCT',
    designPosture: 'Multi-plane Clos, lossless backend discipline, strong entropy and congestion control',
    operationalRisk: 'All-reduce stragglers, incast spikes, ECN instability, pause propagation',
  },
  {
    id: 'finetuning',
    title: 'Fine-Tuning',
    subtitle: 'Mixed collective and checkpoint pressure',
    iconKey: 'GitBranch',
    summary:
      'Fine-tuning still inherits synchronized gradient exchange, but checkpoint cadence, smaller job sizes, and shared platform tenancy create more mixed pressure patterns.',
    dominantTraffic: 'Mixed east-west collectives with periodic checkpoint and dataset movement',
    burstiness: 'Step bursts plus storage-driven writeback spikes',
    latencySensitivity: 'Sensitive to tail spikes during checkpoint windows and restart paths',
    retransmissionTolerance: 'Low to moderate depending on job size and restart frequency',
    topologySensitivity: 'High for shared fabrics where storage and training compete',
    designPosture: 'Backend isolation for checkpoint phases and explicit storage QoS boundaries',
    operationalRisk: 'Checkpoint incast, restore storms, noisy-neighbor contention on shared fabrics',
  },
  {
    id: 'batch-inference',
    title: 'Batch Inference',
    subtitle: 'Throughput-oriented fan-out and aggregation',
    iconKey: 'Boxes',
    summary:
      'Batch inference is usually throughput-first rather than single-request latency-first. It creates fan-out and aggregation pressure that can tolerate some queueing, but large skew still collapses throughput.',
    dominantTraffic: 'Fan-out / fan-in request distribution with model shard aggregation',
    burstiness: 'Bursty at job boundaries and queue-drain moments',
    latencySensitivity: 'Moderate; throughput stability matters more than single-flow tail latency',
    retransmissionTolerance: 'Moderate if buffers remain bounded and backlogs are visible',
    topologySensitivity: 'Medium; oversubscription can be acceptable if storage and cache paths are bounded',
    designPosture: 'Shallow but wide request fabric with explicit cache and storage path awareness',
    operationalRisk: 'Receiver-side aggregation hotspots, cache misses, skewed shard utilization',
  },
  {
    id: 'realtime-inference',
    title: 'Real-Time Inference',
    subtitle: 'Tail-latency and jitter constrained serving',
    iconKey: 'Timer',
    summary:
      'Real-time inference optimizes for predictable tail latency. The network is part of the response-time budget, so shallow queueing and fast feedback loops matter more than peak bulk throughput.',
    dominantTraffic: 'North-south request ingress with short east-west hops to model shards or KV-cache tiers',
    burstiness: 'Microbursts during request spikes and autoscaling transitions',
    latencySensitivity: 'Very high; P99 and jitter dominate the user experience',
    retransmissionTolerance: 'Low for user-facing paths; retries directly consume latency budget',
    topologySensitivity: 'High for cache-disaggregated designs, lower for tightly local serving pods',
    designPosture: 'Shallow low-latency fabric, aggressive telemetry, bounded queue occupancy',
    operationalRisk: 'P99 regressions, request fan-in hotspots, queue microbursts, cache-path imbalance',
  },
  {
    id: 'scientific-hpc',
    title: 'Scientific Workflow / HPC',
    subtitle: 'Barrier-driven workflows with restart and storage pressure',
    iconKey: 'Microscope',
    summary:
      'Scientific workflows often mix MPI-style synchronization, checkpoint/restart, and long-running storage phases. They are not identical to AI training even when they share Ethernet fabrics.',
    dominantTraffic: 'Alternating compute barriers, collective exchange, and checkpoint / restart flows',
    burstiness: 'Phase-dependent; calm periods interrupted by barrier and storage bursts',
    latencySensitivity: 'High at synchronization barriers, moderate during bulk movement phases',
    retransmissionTolerance: 'Varies by phase, but restart windows are operationally expensive',
    topologySensitivity: 'High where restart traffic shares the same constrained fabric as collectives',
    designPosture: 'Separate phase behavior explicitly and monitor restart-path bottlenecks independently',
    operationalRisk: 'Checkpoint collapse, restart saturation, long-tail barrier stalls, storage contention',
  },
];

export const WORKLOAD_DECISION_TABLE: WorkloadDecisionRow[] = [
  {
    dimension: 'Dominant Traffic Direction',
    preTraining: 'Backend east-west collectives dominate',
    fineTuning: 'Collectives plus periodic storage movement',
    batchInference: 'Fan-out / fan-in across shard tiers',
    realTimeInference: 'North-south request path with short east-west service hops',
  },
  {
    dimension: 'Burstiness Signature',
    preTraining: 'Synchronized step bursts',
    fineTuning: 'Step bursts plus checkpoint spikes',
    batchInference: 'Queue-drain and shard-aggregation bursts',
    realTimeInference: 'Microbursts during request spikes',
  },
  {
    dimension: 'Latency / Jitter Sensitivity',
    preTraining: 'Step-time and straggler sensitivity',
    fineTuning: 'Sensitive during save and restore windows',
    batchInference: 'Moderate; throughput is primary',
    realTimeInference: 'Very high; P99 dominates',
  },
  {
    dimension: 'Retransmission Tolerance',
    preTraining: 'Low under sustained congestion',
    fineTuning: 'Low to moderate',
    batchInference: 'Moderate if queues stay bounded',
    realTimeInference: 'Very low on serving path',
  },
  {
    dimension: 'Topology Implication',
    preTraining: 'Non-blocking, path-symmetric backend',
    fineTuning: 'Checkpoint-aware shared-fabric boundaries',
    batchInference: 'Shallow wide fabric with bounded oversubscription',
    realTimeInference: 'Low-latency serving fabric with fast telemetry loop',
  },
];

export const WORKLOAD_DECISION_NOTES: WorkloadDecisionNote[] = [
  {
    title: 'What Fails First',
    iconKey: 'AlertTriangle',
    guidance:
      'The first failure is rarely average throughput. It is usually a straggler rail, hotspot receiver, cache hop imbalance, or checkpoint collision that expands tail latency or job completion time.',
  },
  {
    title: 'What To Monitor First',
    iconKey: 'BarChart2',
    guidance:
      'Start with tail latency, ECN mark stability, retransmit behavior, queue occupancy trend, and any phase-specific storage burst counters before tuning policy.',
  },
  {
    title: 'What To Tune First',
    iconKey: 'SlidersHorizontal',
    guidance:
      'Tune path distribution, queue thresholds, traffic-class isolation, and storage interaction boundaries before escalating to hardware or capacity changes.',
  },
  {
    title: 'When To Hand Off',
    iconKey: 'ArrowRightLeft',
    guidance:
      'Escalate to capacity or sizing tools when the workload posture is clear but the remaining question is quantitative: radix, uplink count, optics, oversubscription, or pod scale.',
  },
];

export const WORKLOAD_MODULE_IMPLICATIONS: InfrastructureImplication[] = [
  {
    label: 'What fails first',
    detail:
      'Misclassifying the workload profile leads to the wrong congestion posture, which shows up first as step-time stragglers, P99 serving regressions, or restart-path collapse.',
  },
  {
    label: 'What to monitor first',
    detail:
      'Match telemetry to the workload phase: collective tail latency for pre-training, checkpoint and restore counters for fine-tuning and scientific workflows, and P99 queue behavior for serving.',
  },
  {
    label: 'What to tune first',
    detail:
      'Tune path symmetry, traffic-class isolation, and storage interaction boundaries before changing hardware assumptions.',
  },
  {
    label: 'When to hand off',
    detail:
      'Once the workload profile and failure mode are identified, hand off to AI Cluster Planner or other sizing tools for capacity-specific topology and platform decisions.',
  },
];
