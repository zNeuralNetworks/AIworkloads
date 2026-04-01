
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
    iconKey: "Cpu", progress: 45, href: "#concepts", color: "purple"
  },
  {
    id: 'mod_3', title: "Transport & Congestion", subtitle: "Transport, flow-control, and congestion tradeoffs across workload profiles.",
    iconKey: "Network", progress: 70, href: "#protocols", color: "indigo"
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
    iconKey: "GitMerge", progress: 85, href: "#hpc", color: "emerald"
  },
];
