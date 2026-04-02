import React from 'react';
import type { KnowledgeCheck } from '../types';
import { useLearning } from '../contexts/LearningContext';

interface KnowledgeCheckCardProps {
  check: KnowledgeCheck;
  moduleId: string;
}

const KnowledgeCheckCard: React.FC<KnowledgeCheckCardProps> = ({ check, moduleId }) => {
  const { completedChecks, completeCheck } = useLearning();
  const selectedOptionId = completedChecks[check.id];
  const selectedOption = check.options.find((option) => option.id === selectedOptionId);
  const isCorrect = selectedOptionId === check.correctOptionId;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
      <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-amber-400">
        Check Your Understanding
      </div>
      <h3 className="mb-4 text-xl font-bold text-white">{check.prompt}</h3>
      <div className="grid gap-3">
        {check.options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          return (
            <button
              key={option.id}
              onClick={() => completeCheck(check.id, option.id, moduleId)}
              className={`rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? option.id === check.correctOptionId
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-red-500/30 bg-red-500/10'
                  : 'border-white/5 bg-[#0d1117] hover:border-white/15'
              }`}
            >
              <div className="text-sm font-medium text-slate-100">{option.label}</div>
            </button>
          );
        })}
      </div>

      {selectedOption && (
        <div
          className={`mt-4 rounded-xl border p-4 text-sm leading-relaxed ${
            isCorrect
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
              : 'border-amber-500/20 bg-amber-500/10 text-amber-100'
          }`}
        >
          <div className="mb-1 font-semibold">{isCorrect ? 'Correct mental model' : 'Refine the mental model'}</div>
          <p>{selectedOption.rationale}</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeCheckCard;
