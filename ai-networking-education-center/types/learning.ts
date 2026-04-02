import type { RunbookReference, TelemetryWatchpoint } from './content';

export type LearningDepth = 'quick' | 'how' | 'design' | 'expert';
export type DifficultyLevel = 'Foundation' | 'Intermediate' | 'Advanced';

export interface LearningScenario {
  title: string;
  prompt: string;
  dominantSignal: string;
  networkBehavior: string;
  infrastructureDecision: string;
}

export interface KnowledgeCheckOption {
  id: string;
  label: string;
  rationale: string;
}

export interface KnowledgeCheck {
  id: string;
  prompt: string;
  correctOptionId: string;
  options: KnowledgeCheckOption[];
}

export interface DecisionSimulatorOption {
  id: string;
  label: string;
  description: string;
}

export interface DecisionSimulatorPrompt {
  id: string;
  title: string;
  prompt: string;
  layout?: 'chips' | 'tiles';
  options: DecisionSimulatorOption[];
}

export interface DecisionSimulatorResult {
  id: string;
  title: string;
  summary: string;
  recommendedPosture: string;
  whyItFits: string;
  whatFailsFirst: string;
  tradeoffs: string[];
  telemetry: TelemetryWatchpoint[];
  nextSteps?: string[];
  runbookLinks?: RunbookReference[];
  plannerTrigger?: string;
  misconception?: string;
  diagramMode?: string;
}

export interface DecisionSimulatorScenario {
  id: string;
  title: string;
  prompt: string;
  prompts: DecisionSimulatorPrompt[];
  results: DecisionSimulatorResult[];
}

export interface LearningState {
  visitedModules: string[];
  practicedModules: string[];
  masteredModules: string[];
  completedChecks: Record<string, string>;
  bookmarkedConcepts: string[];
  selectedDepthPreference: LearningDepth;
  selfRatedConfidence: Record<string, number>;
}
