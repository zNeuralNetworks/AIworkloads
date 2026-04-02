export interface SourceLinkedValue {
  claimId?: string;
  value: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceRevisionOrDate: string;
  verificationStatus: 'verified' | 'vendor-claim' | 'estimated';
}

/** SKU variant row for a product */
export interface ProductVariant {
  name: string;
  chip: string;
  capacity: string | SourceLinkedValue;
  ports: string | SourceLinkedValue;
  formFactor: string;
}

/** Highlighted feature metric on a product card */
export interface ProductFeature {
  label: string;
  value: string | SourceLinkedValue;
  subtext: string | SourceLinkedValue;
  iconKey?: string;
}

/** Full product/platform data definition */
export interface ProductData {
  id: string;
  series: string;
  role: string;
  iconKey: string;
  desc: string | SourceLinkedValue;
  specs: Array<string | SourceLinkedValue>;
  scale: string;
  variants?: ProductVariant[];
  keyFeatures?: ProductFeature[];
  datasheetUrl?: string;
}

/** Single data point for Recharts bar/line charts */
export interface ChartData {
  name: string | SourceLinkedValue;
  value?: number;
  time?: number;
  efficiency?: number;
  delay?: number;
  fill?: string;
}

/** Core concept card (RDMA / NVMe / RoCEv2) */
export interface ConceptData {
  id: string;
  title: string;
  fullName: string;
  description: string | SourceLinkedValue;
  iconKey: string;
  features: Array<string | SourceLinkedValue>;
}

/** Scale Up / Out / Across architecture card */
export interface ScalingConcept {
  title: string;
  desc: string | SourceLinkedValue;
  details: string | SourceLinkedValue;
  iconKey: string;
}

/** Row in the Legacy vs Modern comparison table */
export interface ComparisonRow {
  feature: string;
  legacy: string;
  pinnacle: string;
}

/** Single mechanism within a protocol (e.g. PFC, ECN) */
export interface ProtocolMechanism {
  name: string;
  desc: string;
  iconKey: string;
}

/** Protocol concept card (RoCEv2 vs UET) */
export interface ProtocolConcept {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  iconKey: string;
  color: string;
  mechanisms: ProtocolMechanism[];
}

/** AI vs HPC checklist card */
export interface HPCItem {
  title: string;
  iconKey: string;
  points: Array<string | SourceLinkedValue>;
}

/** Reusable "what fails / monitor / tune / handoff" style implication item */
export interface InfrastructureImplication {
  label: string;
  detail: string;
}

/** Workload profile used by the Workload Types module */
export interface WorkloadProfile {
  id: string;
  title: string;
  subtitle: string;
  iconKey: string;
  summary: string;
  dominantTraffic: string;
  burstiness: string;
  latencySensitivity: string;
  retransmissionTolerance: string;
  topologySensitivity: string;
  designPosture: string;
  operationalRisk: string;
}

/** Guided traffic-pattern teaching item used by the Workload Types module */
export interface TrafficPatternLabItem {
  id: string;
  title: string;
  summary: string;
  visualType: 'all-reduce' | 'all-to-all' | 'parameter-server' | 'moe-dispatch' | 'checkpoint-burst';
  dominantDirection: 'east-west' | 'north-south' | 'mixed';
  synchronizationProfile: string;
  congestionRisk: string;
  topologySensitivity: string;
  telemetry: string;
  networkMeaning: string;
}

/** Data-movement lifecycle stage used by the Data Movement module */
export interface DataMovementStage {
  id: string;
  title: string;
  subtitle: string;
  iconKey: string;
  visualMode: 'ingest' | 'shuffle' | 'checkpoint' | 'restore';
  notice: string;
  summary: string;
  dominantFlow: string;
  flowSteps: string[];
  stressSignature: string;
  designPosture: string;
  primarySignals: string;
  dependsOn: string[];
}

/** Single telemetry item in an operations runbook */
export interface RunbookTelemetryItem {
  text: string;
  /** True = this is Arista EOS-specific CLI; mark clearly for vendor-neutral readers */
  eosSpecific: boolean;
}

/** Troubleshooting runbook entry for the Operations Playbooks section */
export interface OperationsRunbook {
  id: string;
  title: string;
  severity: string;
  /** One sentence describing the observable failure */
  symptom: string;
  /** 1–2 sentences explaining the mechanism driving the failure */
  rootCause: string;
  /** 3–5 specific counters or CLI commands to inspect */
  inspect: RunbookTelemetryItem[];
  /** Numbered corrective action steps */
  actions: string[];
}

/** Single test within a POC validation phase */
export interface ValidationTest {
  testId: string;
  name: string;
}

/** Phase in the AI Fabric POC Validation Procedure */
export interface ValidationPhase {
  phase: number;
  title: string;
  days: string;
  tests: ValidationTest[];
}

/** Branch in the topology selection decision tree */
export interface TopologyBranch {
  condition: string;
  recommendation: string;
  platforms: string;
}

/** Single step in the RoCEv2 congestion design procedure */
export interface CongestionStep {
  step: number;
  title: string;
  details: string[];
}

/** Individual roadmap improvement item */
export interface FutureItem {
  title: string;
  desc: string;
  iconKey: string;
}

/** Category grouping future improvement items */
export interface FutureCategory {
  category: string;
  color: string;
  iconKey: string;
  items: FutureItem[];
}
