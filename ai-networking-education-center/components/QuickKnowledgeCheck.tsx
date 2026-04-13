import React from 'react';
import type { KnowledgeCheck } from '../types';
import { useLearning } from '../contexts/LearningContext';

interface QuickKnowledgeCheckProps {
  check: KnowledgeCheck;
  moduleId: string;
  eyebrow?: string;
}

const QuickKnowledgeCheck: React.FC<QuickKnowledgeCheckProps> = ({
  check,
  moduleId,
  eyebrow = 'Checkpoint',
}) => {
  const { completedChecks, completeCheck } = useLearning();
  const selectedOptionId = completedChecks[check.id];
  const selectedOption = check.options.find((option) => option.id === selectedOptionId);
  const isCorrect = selectedOptionId === check.correctOptionId;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#161b22] p-5">
      <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-amber-300">{eyebrow}</div>
      <h3 className="mb-4 text-lg font-bold text-white">{check.prompt}</h3>
      <div className="flex flex-wrap gap-2">
        {check.options.map((option) => {
          const isSelected = selectedOptionId === option.id;
          return (
            <button
              key={option.id}
              onClick={() => completeCheck(check.id, option.id, moduleId)}
              className={`rounded-full border px-3 py-2 text-left text-sm transition-all ${
                isSelected
                  ? option.id === check.correctOptionId
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-red-500/30 bg-red-500/10 text-red-100'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {selectedOption && (
        <p className={`mt-4 text-sm leading-relaxed ${isCorrect ? 'text-emerald-200' : 'text-amber-100'}`}>
          {selectedOption.rationale}
        </p>
      )}
    </div>
  );
};

export default QuickKnowledgeCheck;
