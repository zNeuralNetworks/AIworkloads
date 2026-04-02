
import { AppConfig, HomeModule } from '../types';

export const DEFAULT_APP_CONFIG: AppConfig = {
  heroLabel: "Architecture Decision Reference",
  heroTitle: "Scientific Workflow",
  heroHighlight: "Architecture",
  heroSubtitle: "An architecture reference layer for understanding how workloads create infrastructure requirements.",
};

export const DEFAULT_HOME_MODULES: HomeModule[] = [
  {
    id: 'mod_1', title: "Architecture Patterns", subtitle: "Reference patterns for mapping workflow behavior to topology and design constraints.",
    iconKey: "Layers", progress: 100, href: "#etherlink", color: "blue"
  },
  {
    id: 'mod_2', title: "Data Movement", subtitle: "RDMA, RoCEv2, and NVMe-oF primitives that govern workflow data paths.",
    iconKey: "Cpu", progress: 45, href: "#concepts", color: "purple",
    estimatedMinutes: 12,
    difficulty: 'Foundation',
    whyItMatters: 'Most teams misdiagnose transport problems because they never mapped the lifecycle stage that is actually under pressure.',
    explainOutcome: 'Explain why ingest, shuffle, checkpoint, and restart drive different network decisions.',
    learningObjectives: [
      'Identify which data-movement stage dominates job behavior',
      'Translate RDMA, RoCEv2, and NVMe-oF into operational implications',
      'Know which signals to monitor before tuning transports',
    ],
    prerequisiteModuleIds: ['training-vs-inference'],
    recommendedNextIds: ['protocols', 'load-balancing'],
    entryScenarios: [
      {
        title: 'Checkpoint-heavy training run',
        prompt: 'The cluster looks healthy until save windows arrive, then job time balloons.',
        dominantSignal: 'Checkpoint bursts dominate the fabric event',
        networkBehavior: 'Storage-coupled east-west pressure and queue contention matter first',
        infrastructureDecision: 'Design checkpoint isolation and restart posture before chasing raw throughput',
      },
    ],
  },
  {
    id: 'mod_3', title: "Transport & Congestion", subtitle: "Transport, flow-control, and congestion tradeoffs across workload profiles.",
    iconKey: "Network", progress: 70, href: "#protocols", color: "indigo",
    estimatedMinutes: 15,
    difficulty: 'Intermediate',
    whyItMatters: 'Protocol names only help after you know which congestion loop and pathing posture the workload forces you to get right.',
    explainOutcome: 'Explain when ECN, PFC, DCQCN, load balancing, and UET design posture matter most.',
    learningObjectives: [
      'Read the ECN to PFC sequence correctly',
      'Differentiate RoCEv2 posture from UET posture',
      'Choose the first telemetry and tuning response for a congestion symptom',
    ],
    prerequisiteModuleIds: ['concepts'],
    recommendedNextIds: ['comparison', 'performance'],
    entryScenarios: [
      {
        title: 'All-reduce bottlenecks',
        prompt: 'A 32-node training cluster shows step-time variance and occasional pause growth.',
        dominantSignal: 'Synchronous collective traffic amplifies queue timing errors',
        networkBehavior: 'Early ECN response and path distribution matter more than just no-drop semantics',
        infrastructureDecision: 'Tune congestion posture and load balancing before assuming more bandwidth fixes it',
      },
    ],
  },
  {
    id: 'mod_4', title: "Performance Implications", subtitle: "Latency, throughput, tail-risk, and job-completion implications.",
    iconKey: "Activity", progress: 30, href: "#performance", color: "red"
  },
  {
    id: 'mod_5', title: "Platform Considerations", subtitle: "Buffering, queueing, silicon behavior, and chassis trade-offs.",
    iconKey: "Server", progress: 15, href: "#hardware", color: "cyan"
  },
  {
    id: 'mod_6', title: "Workload Types", subtitle: "Training, inference, and scientific compute workload signatures.",
    iconKey: "GitMerge", progress: 85, href: "#hpc", color: "emerald",
    estimatedMinutes: 8,
    difficulty: 'Foundation',
    whyItMatters: 'The safest way to explain infrastructure requirements is to begin with workload behavior rather than protocol vocabulary.',
    explainOutcome: 'Explain why training, inference, and scientific workflows produce different congestion and topology priorities.',
    learningObjectives: [
      'Spot the dominant traffic shape',
      'Separate latency-sensitive from throughput-dominant behavior',
      'Use workload shape to frame a customer conversation',
    ],
    recommendedNextIds: ['concepts', 'protocols'],
    entryScenarios: [
      {
        title: 'Customer discovery call',
        prompt: 'You need to quickly classify whether the environment behaves like synchronized training, inference, or checkpoint-heavy scientific compute.',
        dominantSignal: 'Workload type determines traffic shape before platform choices',
        networkBehavior: 'The fabric must match synchronization and tolerance patterns',
        infrastructureDecision: 'Start with workload classification before discussing transports or hardware',
      },
    ],
  },
];
