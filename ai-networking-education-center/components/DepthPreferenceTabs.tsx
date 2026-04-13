import React from 'react';
import type { LearningDepth } from '../types';

interface DepthPreferenceTabsProps {
  value: LearningDepth;
  onChange: (depth: LearningDepth) => void;
}

const DEPTH_OPTIONS: Array<{ id: LearningDepth; label: string; description: string }> = [
  { id: 'quick', label: 'Quick take', description: 'Plain-language orientation' },
  { id: 'how', label: 'How it works', description: 'Core mental model' },
  { id: 'design', label: 'Design implication', description: 'Infrastructure posture' },
  { id: 'expert', label: 'Expert depth', description: 'Detailed reference mode' },
];

const DepthPreferenceTabs: React.FC<DepthPreferenceTabsProps> = ({ value, onChange }) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#161b22] p-2">
      <div className="mb-3 px-3 pt-2 text-xs font-mono uppercase tracking-[0.22em] text-slate-500">
        Reference Depth
      </div>
      <div className="grid gap-2 md:grid-cols-4">
        {DEPTH_OPTIONS.map((option) => {
          const isActive = option.id === value;
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`rounded-xl border px-4 py-3 text-left transition-all ${
                isActive
                  ? 'border-blue-500/30 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.12)]'
                  : 'border-white/5 bg-[#0d1117] hover:border-white/15'
              }`}
            >
              <div className={`mb-1 text-sm font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                {option.label}
              </div>
              <div className="text-xs leading-relaxed text-slate-500">{option.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DepthPreferenceTabs;
