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

export interface LearningState {
  visitedModules: string[];
  practicedModules: string[];
  masteredModules: string[];
  completedChecks: Record<string, string>;
  bookmarkedConcepts: string[];
  selectedDepthPreference: LearningDepth;
  selfRatedConfidence: Record<string, number>;
}
