import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MODULE_REGISTRY } from '../app/moduleRegistry';
import { smoothScrollTo } from '../utils/scroll';
import { useLearning } from '../contexts/LearningContext';

interface Props {
  currentId: string;
}

const NextSectionCTA: React.FC<Props> = ({ currentId }) => {
  const { selectedDepthPreference, masteredModules, practicedModules } = useLearning();
  const mainModules = MODULE_REGISTRY
    .filter(m => m.page === 'main')
    .sort((a, b) => a.order - b.order);

  const currentModule = mainModules.find((module) => module.id === currentId);
  const nextModuleFromRecommendations = currentModule?.recommendedNextIds?.find((id) =>
    mainModules.some((module) => module.id === id)
  );
  const nextModule =
    (nextModuleFromRecommendations &&
      mainModules.find((module) => module.id === nextModuleFromRecommendations)) ||
    (() => {
      const currentIdx = mainModules.findIndex((module) => module.id === currentId);
      return currentIdx >= 0 && currentIdx < mainModules.length - 1
        ? mainModules[currentIdx + 1]
        : null;
    })();

  if (!nextModule) return null;

  const guidanceLabel =
    selectedDepthPreference === 'quick'
      ? 'If this made sense, go here next'
      : selectedDepthPreference === 'expert'
        ? 'If you want the adjacent expert topic'
        : 'Recommended next step';

  const guidanceBody = currentModule?.prerequisiteModuleIds?.includes(nextModule.id)
    ? 'If this still feels fuzzy, review the prerequisite module first.'
    : masteredModules.includes(currentId)
      ? 'You marked this module understood, so this is the strongest adjacent extension.'
      : practicedModules.includes(currentId)
        ? 'You already interacted with this module, so move to the next decision layer.'
        : 'Use this next if you want to keep the learning path moving without losing context.';

  return (
    <div className="bg-[#0F1117] px-6 pb-12">
      <div className="container mx-auto">
        <a
          href={`#${nextModule.anchorId}`}
          onClick={(e) => smoothScrollTo(e, `#${nextModule.anchorId}`)}
          className="group flex items-center justify-between gap-4 bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl px-6 py-4 transition-all"
        >
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">{guidanceLabel}</div>
            <div className="text-white font-semibold text-sm">{nextModule.title}</div>
            {nextModule.subtitle && (
              <div className="text-xs text-slate-500 mt-0.5 truncate">{nextModule.subtitle}</div>
            )}
            <div className="mt-2 text-xs text-slate-400">{guidanceBody}</div>
          </div>
          <ArrowRight
            size={18}
            className="text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0"
          />
        </a>
      </div>
    </div>
  );
};

export default NextSectionCTA;
