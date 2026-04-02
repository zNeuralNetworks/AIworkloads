
import { LucideIcon } from 'lucide-react';
import type { DifficultyLevel, LearningScenario } from './learning';

/** Navigation item in the dock/sidebar */
export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

/** Site-wide hero / meta configuration */
export interface AppConfig {
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroLabel: string;
}

/** Bento-grid card on the home dashboard */
export interface HomeModule {
  id: string;
  title: string;
  subtitle: string;
  /** String key resolved at runtime via ICON_MAP */
  iconKey: string;
  progress: number;
  href: string;
  color: string;
  colSpan?: number;
  estimatedMinutes?: number;
  difficulty?: DifficultyLevel;
  whyItMatters?: string;
  explainOutcome?: string;
  learningObjectives?: string[];
  prerequisiteModuleIds?: string[];
  recommendedNextIds?: string[];
  entryScenarios?: LearningScenario[];
}
