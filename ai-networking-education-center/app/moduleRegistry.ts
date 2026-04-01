import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

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
  order: number;
  tocVisible: boolean;
  page: 'main' | 'operations' | 'glossary' | 'deep-dive';
  component: ComponentType | LazyExoticComponent<ComponentType>;
}

export const MODULE_REGISTRY: ModuleRegistryItem[] = [
  {
    id: 'architecture',
    anchorId: 'etherlink',
    title: 'Architecture Patterns',
    subtitle: 'Reference topology patterns and design constraints by workflow behavior',
    order: 1,
    tocVisible: true,
    page: 'main',
    component: ArchitectureSection,
  },
  {
    id: 'concepts',
    anchorId: 'concepts',
    title: 'Data Movement',
    subtitle: 'RDMA, NVMe-oF, and RoCEv2 primitives that shape system data paths',
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
    order: 3,
    tocVisible: true,
    page: 'main',
    component: ProtocolsSection,
  },
  {
    id: 'deep-dive',
    anchorId: 'deep-dive',
    title: 'Deep Dive',
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
    order: 5,
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
    order: 9,
    tocVisible: true,
    page: 'main',
    component: HardwareSection,
  },
  {
    id: 'training-vs-inference',
    anchorId: 'training-vs-inference',
    title: 'Workload Types',
    subtitle: 'Traffic patterns, latency targets, and design tradeoffs',
    order: 10,
    tocVisible: true,
    page: 'main',
    component: TrainingVsInferenceSection,
  },
  {
    id: 'hpc',
    anchorId: 'hpc',
    title: 'Scientific Workflow Context',
    subtitle: 'Scientific/HPC workflow context and where behavior diverges from AI training',
    order: 11,
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
