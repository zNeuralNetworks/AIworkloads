import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MODULE_REGISTRY } from '../app/moduleRegistry';
import { smoothScrollTo } from '../utils/scroll';

interface Props {
  currentId: string;
}

const NextSectionCTA: React.FC<Props> = ({ currentId }) => {
  const mainModules = MODULE_REGISTRY
    .filter(m => m.page === 'main')
    .sort((a, b) => a.order - b.order);

  const currentIdx = mainModules.findIndex(m => m.id === currentId);
  const nextModule = currentIdx >= 0 && currentIdx < mainModules.length - 1
    ? mainModules[currentIdx + 1]
    : null;

  if (!nextModule) return null;

  return (
    <div className="bg-[#0F1117] px-6 pb-12">
      <div className="container mx-auto">
        <a
          href={`#${nextModule.anchorId}`}
          onClick={(e) => smoothScrollTo(e, `#${nextModule.anchorId}`)}
          className="group flex items-center justify-between gap-4 bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl px-6 py-4 transition-all"
        >
          <div className="min-w-0">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">Next</div>
            <div className="text-white font-semibold text-sm">{nextModule.title}</div>
            {nextModule.subtitle && (
              <div className="text-xs text-slate-500 mt-0.5 truncate">{nextModule.subtitle}</div>
            )}
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
