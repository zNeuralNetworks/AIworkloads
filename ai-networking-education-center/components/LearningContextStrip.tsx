import React from 'react';
import { ArrowRight, Compass, Route } from 'lucide-react';
import { MODULE_REGISTRY } from '../app/moduleRegistry';
import { useLearning } from '../contexts/LearningContext';
import { useActiveSection } from '../hooks/useActiveSection';
import { smoothScrollTo } from '../utils/scroll';

const PROFILE_LABELS: Record<string, string> = {
  pretraining: 'Pre-Training',
  finetuning: 'Fine-Tuning',
  'batch-inference': 'Batch Inference',
  'realtime-inference': 'Real-Time Inference',
  'scientific-hpc': 'Scientific Workflow / HPC',
};

const STAGE_LABELS: Record<string, string> = {
  ingest: 'Ingest',
  shuffle: 'Shuffle',
  checkpoint: 'Checkpoint',
  restore: 'Restore',
};

const PATTERN_LABELS: Record<string, string> = {
  'all-reduce': 'All-Reduce',
  'all-to-all': 'All-to-All',
  'parameter-server': 'Parameter Server',
  'moe-dispatch': 'MoE Dispatch',
  'checkpoint-burst': 'Checkpoint Burst',
};

const LearningContextStrip: React.FC = () => {
  const { activeWorkloadProfile, activeDataMovementStage, activeTrafficPattern } = useLearning();
  const mainModules = MODULE_REGISTRY
    .filter((module) => module.page === 'main')
    .sort((a, b) => a.order - b.order);
  const activeAnchorId = useActiveSection(mainModules.map((module) => module.anchorId));
  const activeModule = mainModules.find((module) => module.anchorId === activeAnchorId) || mainModules[0];
  const hasLearnerContext = Boolean(activeWorkloadProfile || activeDataMovementStage || activeTrafficPattern);
  const recommendedNextModule = hasLearnerContext
    ? (activeModule?.recommendedNextIds || [])
        .map((id) => mainModules.find((module) => module.id === id))
        .find(Boolean) || null
    : mainModules[0] || null;

  return (
    <section className="border-y border-white/5 bg-[#111827]">
      <div className="container mx-auto px-6 py-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">
              <Compass size={14} />
              Active Architecture Lens
            </div>
            <div className="flex flex-wrap gap-3">
              <ContextChip label="Workload" value={activeWorkloadProfile ? PROFILE_LABELS[activeWorkloadProfile] || activeWorkloadProfile : 'Not chosen yet'} />
              <ContextChip label="Stage" value={activeDataMovementStage ? STAGE_LABELS[activeDataMovementStage] || activeDataMovementStage : 'Not chosen yet'} />
              <ContextChip label="Pattern" value={activeTrafficPattern ? PATTERN_LABELS[activeTrafficPattern] || activeTrafficPattern : 'Not chosen yet'} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-400">
              <Route size={14} />
              Recommended Next Decision
            </div>
            {recommendedNextModule ? (
              <a
                href={`#${recommendedNextModule.anchorId}`}
                onClick={(e) => smoothScrollTo(e, `#${recommendedNextModule.anchorId}`)}
                className="group flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#0d1117] p-4 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
              >
                <div>
                  <div className="mb-1 text-sm font-semibold text-white">{recommendedNextModule.title}</div>
                  {recommendedNextModule.subtitle && (
                    <p className="text-sm leading-relaxed text-slate-400">{recommendedNextModule.subtitle}</p>
                  )}
                </div>
                <ArrowRight size={18} className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </a>
            ) : (
              <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4 text-sm leading-relaxed text-slate-400">
              Start with workload behavior. Once the architecture lens is active, the next decision follows the selected workload, stage, or traffic pattern.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const ContextChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-full border border-white/10 bg-[#0d1117] px-4 py-2">
    <span className="mr-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-200">{value}</span>
  </div>
);

export default LearningContextStrip;
