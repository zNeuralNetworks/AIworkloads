import { Home, Layout, Lightbulb, Network, Microscope, GitCompare, BarChart2, HardDrive, BookOpen, ClipboardList, GitMerge, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
}

export const NAVIGATION: NavItem[] = [
  { id: 'intro', label: 'Overview', icon: Home },
  { id: 'training-vs-inference', label: 'Workload Types', icon: Layers },
  { id: 'load-balancing', label: 'Communication Patterns', icon: GitMerge },
  { id: 'concepts', label: 'Data Movement', icon: Lightbulb },
  { id: 'protocols', label: 'Transport & Congestion', icon: Network },
  { id: 'uec', label: 'Transport Tradeoffs', icon: GitCompare },
  { id: 'performance', label: 'Performance Implications', icon: BarChart2 },
  { id: 'etherlink', label: 'Architecture Patterns', icon: Layout },
  { id: 'operations', label: 'Operational Runbooks', icon: ClipboardList, href: '/operations' },
  { id: 'hardware', label: 'Platform Considerations', icon: HardDrive },
  { id: 'deep-dive', label: 'Deep Dive', icon: Microscope, href: '/deep-dive' },
  { id: 'glossary', label: 'Glossary', icon: BookOpen, href: '/glossary' },
];
