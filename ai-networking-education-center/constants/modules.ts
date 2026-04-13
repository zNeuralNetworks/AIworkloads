
import { AppConfig, HomeModule } from '../types';

export const DEFAULT_APP_CONFIG: AppConfig = {
  heroLabel: "Architecture Reference",
  heroTitle: "Scientific Workflow",
  heroHighlight: "Architecture",
  heroSubtitle: "Use the decision chain from workload shape to fabric posture, architecture choice, and operational consequence.",
};

export const DEFAULT_HOME_MODULES: HomeModule[] = [
  {
    id: 'mod_1', title: "Workload Types", subtitle: "Start by classifying the workload behavior before discussing fabrics, transports, or platforms.",
    iconKey: "GitMerge", progress: 100, href: "#training-vs-inference", color: "emerald",
    estimatedMinutes: 8,
    difficulty: 'Foundation',
    whyItMatters: 'The safest architectural explanation starts with workload behavior, not protocol vocabulary.',
    explainOutcome: 'Classify the environment by the traffic behavior and failure signature that actually dominate it.',
    learningObjectives: [
      'Spot the dominant workload shape',
      'Predict what fails first when the profile is misclassified',
      'Use workload type to frame the next learning step',
    ],
    recommendedNextIds: ['concepts', 'load-balancing'],
  },
  {
    id: 'mod_2', title: "Data Movement", subtitle: "Find the lifecycle stage that is actually creating infrastructure pressure.",
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
    id: 'mod_3', title: "Communication Patterns", subtitle: "Build intuition for collective, convergent, and skewed traffic geometry.",
    iconKey: "GitMerge", progress: 70, href: "#load-balancing", color: "blue",
    estimatedMinutes: 10,
    difficulty: 'Foundation',
    whyItMatters: 'Traffic geometry is the missing bridge between workload labels and control-loop decisions.',
    explainOutcome: 'Explain why all-reduce, all-to-all, convergence, and checkpoint bursts stress the network differently.',
    learningObjectives: [
      'Recognize the pattern before choosing a mechanism',
      'Predict hotspot shape from traffic geometry',
      'Know which pathing questions come next',
    ],
    recommendedNextIds: ['protocols', 'architecture'],
  },
  {
    id: 'mod_4', title: "Transport & Congestion", subtitle: "Transport, flow-control, and congestion tradeoffs across workload profiles.",
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
    id: 'mod_5', title: "Architecture Patterns", subtitle: "Map workload behavior to topology posture and design constraints.",
    iconKey: "Layers", progress: 80, href: "#etherlink", color: "cyan"
  },
  {
    id: 'mod_6', title: "Performance Implications", subtitle: "Interpret latency, throughput, and tail-risk as evidence of design posture.",
    iconKey: "Activity", progress: 30, href: "#performance", color: "red"
  },
  {
    id: 'mod_7', title: "Platform Considerations", subtitle: "Match buffering, radix, and silicon behavior to the real design constraint.",
    iconKey: "Server", progress: 15, href: "#hardware", color: "cyan"
  },
];
