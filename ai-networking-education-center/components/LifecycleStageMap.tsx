import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { DataMovementStage } from '../types';

interface LifecycleStageMapProps {
  stages: DataMovementStage[];
  activeStageId: string;
  onStageSelect?: (stageId: string) => void;
}

const LifecycleStageMap: React.FC<LifecycleStageMapProps> = ({
  stages,
  activeStageId,
  onStageSelect,
}) => (
  <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6 md:p-8">
    <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">
      Lifecycle Overview
    </div>
    <h3 className="mb-3 text-2xl font-bold text-white">Select the active lifecycle stage</h3>
    <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-400">
      Pick the stage that is late, bursty, or fragile. Protocol choices come after this selection.
    </p>

    <div className="mb-5 hidden items-center gap-2 xl:flex">
      {stages.map((stage, index) => (
        <React.Fragment key={`${stage.id}-rail`}>
          <button
            type="button"
            onClick={() => onStageSelect?.(stage.id)}
            className={`rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 ${
              stage.id === activeStageId
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-100'
                : 'border-white/5 bg-[#0d1117] text-slate-300 hover:border-white/15'
            }`}
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
              {stage.subtitle}
            </div>
            <div className="mt-1 text-sm font-semibold text-white">{stage.title}</div>
          </button>
          {index < stages.length - 1 && <ArrowRight size={16} className="shrink-0 text-slate-600" />}
        </React.Fragment>
      ))}
    </div>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stages.map((stage) => {
        const isActive = stage.id === activeStageId;
        return (
          <button
            key={stage.id}
            type="button"
            onClick={() => onStageSelect?.(stage.id)}
            className={`rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 ${
              isActive
                ? 'border-blue-500/30 bg-blue-500/10'
                : 'border-white/5 bg-[#0d1117] hover:border-white/15'
            }`}
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                  Stage
                </div>
                <h4 className="mt-1 text-lg font-bold text-white">{stage.title}</h4>
              </div>
              <div
                className={`rounded-full border px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.18em] ${
                  isActive
                    ? 'border-blue-500/20 bg-blue-500/10 text-blue-300'
                    : 'border-white/10 bg-white/5 text-slate-400'
                }`}
              >
                {isActive ? 'Active' : 'Stage'}
              </div>
            </div>

            <div className="space-y-2">
              <StageSignal label="Dominant flow" value={stage.dominantFlow} />
              <StageSignal label="What fails first" value={stage.stressSignature} />
              <StageSignal label="Inspect first" value={stage.primarySignals.split(',')[0]?.trim() || stage.primarySignals} />
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const StageSignal: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-lg border border-white/5 bg-black/20 p-3">
    <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
      {label}
    </div>
    <p className="text-sm leading-relaxed text-slate-300 line-clamp-2">{value}</p>
  </div>
);

export default LifecycleStageMap;
