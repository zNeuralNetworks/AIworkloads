import {
  ConceptData,
  DataMovementStage,
  DecisionSimulatorPrompt,
  InfrastructureImplication,
  ScalingConcept,
  TopologyBranch,
} from '../types';
import { PLANNER_HANDOFF_DESTINATION } from './plannerHandoff';
import { claim } from '../utils/sourceClaims';

const RDMA_SOURCE = {
  sourceUrl: 'https://www.infinibandta.org/about-rdma/',
  sourceTitle: 'InfiniBand Trade Association - About RDMA',
  sourceRevisionOrDate: 'Accessed 2026-03',
  verificationStatus: 'verified' as const,
};

const NVME_SOURCE = {
  sourceUrl: 'https://nvmexpress.org/specifications/',
  sourceTitle: 'NVM Express Specifications',
  sourceRevisionOrDate: '2025',
  verificationStatus: 'verified' as const,
};

const ROCE_SOURCE = {
  sourceUrl: 'https://www.rdmamojo.com/2014/06/17/rocev2/',
  sourceTitle: 'RoCE v2 Overview',
  sourceRevisionOrDate: 'Accessed 2026-03',
  verificationStatus: 'verified' as const,
};

const ARISTA_AI_GUIDE_SOURCE = {
  sourceUrl: 'https://www.arista.com/en/solutions/ai-networking',
  sourceTitle: 'Arista AI Networking Solutions',
  sourceRevisionOrDate: 'Accessed 2026-03',
  verificationStatus: 'vendor-claim' as const,
};

export const SCALING_CONCEPTS: ScalingConcept[] = [
  {
    title: 'Scale Up',
    desc: claim('Inside the Rack', ARISTA_AI_GUIDE_SOURCE),
    details: claim(
      'Massive bandwidth for XPU-to-XPU interconnects (memory sharing) within a single rack.',
      ARISTA_AI_GUIDE_SOURCE
    ),
    iconKey: 'Zap',
  },
  {
    title: 'Scale Out',
    desc: claim('Across the Data Center', ARISTA_AI_GUIDE_SOURCE),
    details: claim(
      'Connecting thousands of compute servers using Leaf/Spine fabrics.',
      ARISTA_AI_GUIDE_SOURCE
    ),
    iconKey: 'Network',
  },
  {
    title: 'Scale Across',
    desc: claim('Between Buildings', ARISTA_AI_GUIDE_SOURCE),
    details: claim(
      'Connecting geographically distributed AI centers (DCI) with encryption.',
      ARISTA_AI_GUIDE_SOURCE
    ),
    iconKey: 'Globe',
  },
];

export const TOPOLOGY_SELECTION: TopologyBranch[] = [
  {
    condition: '≤1,024 GPUs',
    recommendation: '2-tier Clos, dual-plane, fixed switches, DLB on leaf',
    platforms: '7060X leaf + 7060X spine',
  },
  {
    condition: '1,024–4,096 GPUs',
    recommendation: 'Multi-plane, 2-tier Clos, DLB on leaf + CLB on spine',
    platforms: '7060X leaf + 7800R spine',
  },
  {
    condition: '>4,096 GPUs or cross-hall',
    recommendation: '3-tier Clos with super-spine, inter-hall fiber allocation',
    platforms: '7060X leaf + 7800R spine + 7700R DES super-spine',
  },
  {
    condition: 'Uncertain scale / budget-staged',
    recommendation: 'Modular GPU pods, start 2-tier, plan for multi-plane expansion',
    platforms: '7060X leaf + 7800R modular spine',
  },
];

export const CORE_CONCEPTS: ConceptData[] = [
  {
    id: 'rdma',
    title: 'RDMA',
    fullName: 'Remote Direct Memory Access',
    description: claim(
      "A transport behavior that lets a host read or write remote memory without pushing every transfer through the CPU and kernel data path. In AI fabrics, it matters because collective traffic and distributed storage flows are otherwise dominated by software overhead before the network is even the bottleneck.",
      RDMA_SOURCE
    ),
    iconKey: 'Cpu',
    features: [
      claim('Zero-copy data path for host and accelerator workflows', RDMA_SOURCE),
      claim('Kernel bypass reduces software overhead under heavy east-west traffic', RDMA_SOURCE),
      claim('GPUDirect RDMA keeps accelerator memory in the fast path', RDMA_SOURCE),
    ],
  },
  {
    id: 'nvme',
    title: 'NVMe / NVMe-oF',
    fullName: 'Non-Volatile Memory Express',
    description: claim(
      'The storage protocol layer that makes checkpoint, restore, and disaggregated data access operationally feasible at AI cluster scale. Over fabrics, it turns storage traffic into a first-class part of the network design rather than an isolated backend concern.',
      NVME_SOURCE
    ),
    iconKey: 'Database',
    features: [
      claim('Parallel queue model for high fan-in and fan-out storage access', NVME_SOURCE),
      claim('Near-local storage semantics over network fabrics with NVMe-oF', NVME_SOURCE),
      claim('Storage and compute can scale independently without abandoning low-latency access', NVME_SOURCE),
    ],
  },
  {
    id: 'roce_intro',
    title: 'RoCEv2',
    fullName: 'RDMA over Converged Ethernet v2',
    description: claim(
      'The Ethernet transport posture that allows RDMA behavior to span the fabric. It is not just a protocol label: it implies lossless forwarding expectations, ECN discipline, and queue behavior that directly affect shuffle, collective, and restart performance.',
      ROCE_SOURCE
    ),
    iconKey: 'Network',
    features: [
      claim('UDP/IP encapsulation for RDMA semantics on Ethernet', ROCE_SOURCE),
      claim('Requires disciplined lossless behavior to avoid collapse under congestion', ROCE_SOURCE),
      claim('Makes congestion design a fabric requirement, not an afterthought', ROCE_SOURCE),
    ],
  },
];

export const DATA_MOVEMENT_STAGES: DataMovementStage[] = [
  {
    id: 'ingest',
    title: 'Ingest',
    subtitle: 'North-South onboarding into the cluster',
    iconKey: 'ArrowDownToLine',
    visualMode: 'ingest',
    notice:
      'Notice how pressure forms before the training fabric is busy: the edge has to absorb dataset landing, queue it, and stage it in time for the first batch.',
    summary:
      'Raw data, features, and model inputs land from external storage, object services, or upstream pipelines. This is where operators discover whether the cluster can absorb data without stalling the training window before collective traffic even begins.',
    dominantFlow: 'Mostly north-south, with burst fan-in at storage gateways and ingest nodes.',
    flowSteps: ['Source read', 'Ingress absorb', 'Stage for workers'],
    stressSignature:
      'Short ingest windows, uneven queue growth, and storage uplink oversubscription that looks harmless until the first training epoch misses schedule.',
    designPosture:
      'Separate ingest posture from steady-state training posture. Protect storage ingress, absorb bursts, and avoid assuming that a fabric sized for east-west collectives automatically handles dataset landing.',
    primarySignals:
      'Ingress queue depth, storage uplink utilization, first-batch delay, and data-loader idle time on compute nodes.',
    dependsOn: ['nvme'],
  },
  {
    id: 'shuffle',
    title: 'Preprocess / Shuffle',
    subtitle: 'East-West fan-out before the job stabilizes',
    iconKey: 'Shuffle',
    visualMode: 'shuffle',
    notice:
      'Notice that data is no longer simply landing from storage: workers now redistribute shards laterally, so path balance and queue posture start determining startup behavior.',
    summary:
      'Data is normalized, staged, shuffled, and redistributed across workers. This is often the first point where traffic stops looking like conventional storage and starts behaving like a fabric problem.',
    dominantFlow: 'Mixed, but increasingly east-west as workers rebalance shards and stage batches.',
    flowSteps: ['Split work', 'Redistribute shards', 'Converge on balanced batches'],
    stressSignature:
      'Incast, uneven path utilization, and latency spikes during job startup or repartitioning windows.',
    designPosture:
      'Treat shuffle as a congestion rehearsal for the main workload. If path symmetry, queue policy, or ECN behavior are weak here, the collective phase will surface the same weaknesses harder.',
    primarySignals:
      'Leaf queue growth, ECN mark rate volatility, all-to-all startup latency, and retransmission-like slowdown at the application layer.',
    dependsOn: ['rdma', 'roce_intro'],
  },
  {
    id: 'checkpoint',
    title: 'Checkpoint / Writeback',
    subtitle: 'Protecting progress without collapsing the fabric',
    iconKey: 'Save',
    visualMode: 'checkpoint',
    notice:
      'Notice how a durable save becomes both a storage event and a fabric event: many workers drain state at once and can collide with job-critical traffic.',
    summary:
      'Model state, optimizer state, and intermediate outputs must leave accelerator memory and land durably. This is the stage where storage-fabric coupling becomes operationally visible, because protecting progress can contend directly with job-critical traffic.',
    dominantFlow: 'Strong east-west to storage aggregation, then north-south or backend east-west into storage tiers.',
    flowSteps: ['Drain state', 'Aggregate writes', 'Land durably'],
    stressSignature:
      'Large periodic bursts, sustained write pressure, and interference between checkpoint windows and active collective traffic.',
    designPosture:
      'Design checkpoints as fabric events, not a storage footnote. Isolate hot paths, time burst behavior, and validate whether the storage fabric shares failure domains with the training fabric.',
    primarySignals:
      'Checkpoint completion time, storage target saturation, head-of-line blocking near storage leaves, and accelerator idle time during save intervals.',
    dependsOn: ['nvme', 'roce_intro'],
  },
  {
    id: 'restore',
    title: 'Restore / Restart',
    subtitle: 'Recovery path after failure or preemption',
    iconKey: 'RotateCcw',
    visualMode: 'restore',
    notice:
      'Notice how recovery stress reverses the checkpoint path: shared checkpoint targets must fan back out to many workers quickly and predictably under degraded conditions.',
    summary:
      'The recovery path determines whether the environment resumes quickly or turns every failure into a long rehydration event. This stage is operationally decisive because restart storms often happen under already degraded conditions.',
    dominantFlow: 'Burst fan-out from checkpoint targets back into many workers at once.',
    flowSteps: ['Locate checkpoint', 'Fan out reads', 'Rehydrate workers'],
    stressSignature:
      'Concurrent reads, control-plane urgency, and severe sensitivity to hot spots, storage locality, and queue imbalance during recovery.',
    designPosture:
      'Optimize for deterministic restart time, not just raw peak throughput. Recovery is where weak storage placement, weak congestion posture, and hidden shared bottlenecks become obvious.',
    primarySignals:
      'Time-to-first-batch after restore, concurrent read skew, recovery queue depth, and restart success rate under multiple-node failure scenarios.',
    dependsOn: ['nvme', 'rdma', 'roce_intro'],
  },
];

export const DATA_MOVEMENT_DECISION_NOTES = [
  {
    title: 'North-South Is Not the Main Event',
    iconKey: 'ArrowUpDown',
    guidance:
      'Ingest matters, but the decisive architecture question is when data movement becomes east-west and starts competing with collective or restart traffic inside the fabric.',
  },
  {
    title: 'Storage Is Part of the Fabric',
    iconKey: 'HardDrive',
    guidance:
      'Checkpoint and restore behavior should be reviewed with the same rigor as leaf-spine oversubscription or congestion policy, because storage bursts can dominate real job completion time.',
  },
  {
    title: 'Restart Time Is a Product Metric',
    iconKey: 'TimerReset',
    guidance:
      'A fast steady state does not matter much if the cluster cannot recover predictably after failure, maintenance, or preemption windows.',
  },
  {
    title: 'Protocol Names Are Not Enough',
    iconKey: 'GitBranch',
    guidance:
      'Saying RDMA, RoCEv2, or NVMe-oF is incomplete. The useful question is which lifecycle stage depends on them and what queueing or placement behavior they force you to get right.',
  },
];

export const DATA_MOVEMENT_MODULE_IMPLICATIONS: InfrastructureImplication[] = [
  {
    label: 'What Fails First',
    detail:
      'Checkpoint windows, restart storms, and shuffle incast usually expose the architecture before a clean steady-state benchmark does.',
  },
  {
    label: 'What To Monitor First',
    detail:
      'Track first-batch delay, checkpoint duration, storage uplink saturation, ECN volatility, and time-to-first-batch after restart before focusing on aggregate bandwidth numbers.',
  },
  {
    label: 'What To Tune First',
    detail:
      'Tune storage placement, path symmetry, congestion posture, and queue isolation around shuffle and checkpoint events before chasing micro-optimizations in application code.',
  },
  {
    label: 'When To Hand Off',
    detail:
      `Once lifecycle bottlenecks are clear, move to ${PLANNER_HANDOFF_DESTINATION} for quantitative implementation outputs such as topology scale, node and NIC counts, fabric tiers, and optics.`,
  },
];

export const DATA_MOVEMENT_DECISION_PROMPTS: DecisionSimulatorPrompt[] = [
  {
    id: 'stageCondition',
    title: 'Stage condition',
    prompt: 'Which lifecycle stage is creating the infrastructure question right now?',
    layout: 'tiles',
    options: [
      { id: 'ingest', label: 'Ingest readiness', description: 'First batch is late, startup is inconsistent, or staging feels fragile.' },
      { id: 'shuffle', label: 'Shuffle imbalance', description: 'Redistribution creates skew, incast, or unstable startup behavior.' },
      { id: 'checkpoint', label: 'Checkpoint pressure', description: 'Save windows collide with queueing, storage, or job time.' },
      { id: 'restore', label: 'Restart fragility', description: 'Recovery windows stretch out and restart behavior is unpredictable.' },
    ],
  },
  {
    id: 'environmentModifier',
    title: 'Environment modifier',
    prompt: 'Which environment context most changes the design posture?',
    options: [
      { id: 'storage-coupled', label: 'Storage-coupled', description: 'Storage traffic is tightly coupled to the fabric event.' },
      { id: 'synchronized-training', label: 'Synchronized training', description: 'Collective timing pressure is nearby or immediately downstream.' },
      { id: 'mixed-scientific', label: 'Mixed scientific workflow', description: 'Multiple lifecycle phases and workflow modes share the same backend.' },
      { id: 'recovery-heavy', label: 'Recovery-heavy', description: 'Restart and failure recovery posture matter almost as much as steady-state job time.' },
    ],
  },
];
