import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { DifficultyLevel, LearningScenario } from '../types';

const ArchitectureSection = lazy(() => import('../components/ArchitectureSection'));
const ConceptsSection = lazy(() => import('../components/ConceptsSection'));
const ProtocolsSection = lazy(() => import('../components/ProtocolsSection'));
const ProtocolDeepDive = lazy(() => import('../components/ProtocolDeepDive'));
const LoadBalancingSection = lazy(() => import('../components/LoadBalancingSection'));
const ComparisonTable = lazy(() => import('../components/ComparisonTable'));
const PerformanceSection = lazy(() => import('../components/PerformanceSection'));
const OperationsPlaybooksSection = lazy(() => import('../components/OperationsPlaybooksSection'));
const HardwareSection = lazy(() => import('../components/HardwareSection'));
const TrainingVsInferenceSection = lazy(() => import('../components/TrainingVsInferenceSection'));
const HPCSection = lazy(() => import('../components/HPCSection'));
const GlossarySection = lazy(() => import('../components/GlossarySection'));

export interface ModuleRegistryItem {
  id: string;
  anchorId: string;
  title: string;
  /** One-line preview shown in "Next section" CTA */
  subtitle?: string;
  estimatedMinutes?: number;
  difficulty?: DifficultyLevel;
  learningObjectives?: string[];
  prerequisiteModuleIds?: string[];
  recommendedNextIds?: string[];
  entryScenarios?: LearningScenario[];
  order: number;
  tocVisible: boolean;
  page: 'main' | 'operations' | 'glossary' | 'deep-dive';
  component: ComponentType | LazyExoticComponent<ComponentType>;
}

export const MODULE_REGISTRY: ModuleRegistryItem[] = [
  {
    id: 'concepts',
    anchorId: 'concepts',
    title: 'Data Movement',
    subtitle: 'RDMA, NVMe-oF, and RoCEv2 primitives that shape system data paths',
    estimatedMinutes: 12,
    difficulty: 'Foundation',
    learningObjectives: [
      'Recognize which lifecycle stage is dominant',
      'Map transport primitives to operational pressure points',
    ],
    prerequisiteModuleIds: ['training-vs-inference'],
    recommendedNextIds: ['protocols', 'load-balancing'],
    entryScenarios: [
      {
        title: 'Checkpoint burst dominates',
        prompt: 'The workload looks healthy until save windows arrive and writeback collides with job-critical traffic.',
        dominantSignal: 'Checkpoint stage dominates the data path',
        networkBehavior: 'Storage-coupled burst handling matters more than nominal steady-state throughput',
        infrastructureDecision: 'Isolate checkpoint posture and validate restart determinism',
      },
      {
        title: 'Job startup feels random',
        prompt: 'Initial job startup and repartitioning create uneven latency before training stabilizes.',
        dominantSignal: 'Shuffle behavior is stressing path balance',
        networkBehavior: 'East-west redistribution becomes the real fabric problem',
        infrastructureDecision: 'Treat shuffle as the congestion rehearsal for the training fabric',
      },
    ],
    order: 2,
    tocVisible: true,
    page: 'main',
    component: ConceptsSection,
  },
  {
    id: 'protocols',
    anchorId: 'protocols',
    title: 'Transport & Congestion',
    subtitle: 'Transport and congestion-control decisions tied to workload characteristics',
    estimatedMinutes: 15,
    difficulty: 'Intermediate',
    learningObjectives: [
      'Read the ECN-to-PFC sequence correctly',
      'Choose the first congestion-control and load-balancing questions to ask',
    ],
    prerequisiteModuleIds: ['concepts'],
    recommendedNextIds: ['comparison', 'performance', 'deep-dive'],
    entryScenarios: [
      {
        title: 'All-reduce straggler',
        prompt: 'A 32-node training cluster shows periodic queue growth and step-time variance.',
        dominantSignal: 'Synchronous collectives magnify path and queue timing errors',
        networkBehavior: 'ECN timing and path distribution matter first',
        infrastructureDecision: 'Tune congestion posture and balancing before adding bandwidth',
      },
      {
        title: 'UET simplification claim',
        prompt: 'A customer asks whether moving to UET removes the need for congestion design discipline.',
        dominantSignal: 'Loss tolerance changes transport behavior, not the need for good fabric design',
        networkBehavior: 'Path distribution and recovery still need explicit posture',
        infrastructureDecision: 'Explain the shift in control model without overselling protocol magic',
      },
    ],
    order: 4,
    tocVisible: true,
    page: 'main',
    component: ProtocolsSection,
  },
  {
    id: 'deep-dive',
    anchorId: 'deep-dive',
    title: 'Transport Control Lab',
    order: 4,
    tocVisible: true,
    page: 'deep-dive',
    component: ProtocolDeepDive,
  },
  {
    id: 'load-balancing',
    anchorId: 'load-balancing',
    title: 'Communication Patterns',
    subtitle: 'Collective traffic behavior and path-distribution strategies',
    order: 3,
    tocVisible: true,
    page: 'main',
    component: LoadBalancingSection,
  },
  {
    id: 'comparison',
    anchorId: 'uec',
    title: 'Transport Tradeoffs',
    subtitle: 'Tradeoff matrix for transport behavior, recovery, and scale assumptions',
    order: 6,
    tocVisible: true,
    page: 'main',
    component: ComparisonTable,
  },
  {
    id: 'performance',
    anchorId: 'performance',
    title: 'Performance Implications',
    subtitle: 'Latency, throughput, and collective communication benchmarks',
    estimatedMinutes: 10,
    difficulty: 'Intermediate',
    order: 7,
    tocVisible: true,
    page: 'main',
    component: PerformanceSection,
  },
  {
    id: 'operations',
    anchorId: 'operations',
    title: 'Operational Runbooks',
    order: 8,
    tocVisible: true,
    page: 'operations',
    component: OperationsPlaybooksSection,
  },
  {
    id: 'hardware',
    anchorId: 'hardware',
    title: 'Platform Considerations',
    subtitle: 'Platform and silicon behavior relevant to scientific workflow infrastructure',
    order: 8,
    tocVisible: true,
    page: 'main',
    component: HardwareSection,
  },
  {
    id: 'training-vs-inference',
    anchorId: 'training-vs-inference',
    title: 'Workload Types',
    subtitle: 'Traffic patterns, latency targets, and design tradeoffs',
    estimatedMinutes: 8,
    difficulty: 'Foundation',
    learningObjectives: [
      'Identify the workload signature before choosing transport language',
      'Use traffic shape to frame the rest of the design conversation',
    ],
    recommendedNextIds: ['concepts', 'protocols'],
    entryScenarios: [
      {
        title: 'Explain the workload first',
        prompt: 'You need to classify the environment before talking about transport or platform specifics.',
        dominantSignal: 'Workload shape determines the pressure points',
        networkBehavior: 'Synchronization profile changes what the network must do well',
        infrastructureDecision: 'Start with behavior, not acronyms',
      },
    ],
    order: 1,
    tocVisible: true,
    page: 'main',
    component: TrainingVsInferenceSection,
  },
  {
    id: 'architecture',
    anchorId: 'etherlink',
    title: 'Architecture Patterns',
    subtitle: 'Reference topology patterns and design constraints by workflow behavior',
    estimatedMinutes: 10,
    difficulty: 'Foundation',
    learningObjectives: [
      'Match workflow shape to topology posture',
      'Know when the fabric problem is architectural versus transport-level',
    ],
    prerequisiteModuleIds: ['protocols', 'load-balancing'],
    recommendedNextIds: ['comparison', 'performance'],
    order: 5,
    tocVisible: true,
    page: 'main',
    component: ArchitectureSection,
  },
  {
    id: 'hpc',
    anchorId: 'hpc',
    title: 'Scientific Workflow Context',
    subtitle: 'Scientific/HPC workflow context and where behavior diverges from AI training',
    order: 9,
    tocVisible: true,
    page: 'main',
    component: HPCSection,
  },
  {
    id: 'glossary',
    anchorId: 'glossary',
    title: 'Glossary',
    order: 12,
    tocVisible: true,
    page: 'glossary',
    component: GlossarySection,
  },
];
