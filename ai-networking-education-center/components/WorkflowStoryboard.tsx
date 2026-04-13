import React, { useMemo, useState } from 'react';

export interface WorkflowStoryboardFrame {
  id: string;
  phase: string;
  title: string;
  summary: string;
  traffic: string;
  storage: string;
  failure: string;
  nextModule: string;
}

export interface WorkflowStoryboardScenario {
  id: string;
  title: string;
  subtitle: string;
  frames: WorkflowStoryboardFrame[];
}

interface WorkflowStoryboardProps {
  title: string;
  intro: string;
  scenarios: WorkflowStoryboardScenario[];
  defaultScenarioId?: string;
}

const WorkflowStoryboard: React.FC<WorkflowStoryboardProps> = ({
  title,
  intro,
  scenarios,
  defaultScenarioId,
}) => {
  const initialScenarioId = defaultScenarioId || scenarios[0]?.id || '';
  const [activeScenarioId, setActiveScenarioId] = useState(initialScenarioId);
  const [activeFrameId, setActiveFrameId] = useState(
    scenarios.find((scenario) => scenario.id === initialScenarioId)?.frames[0]?.id ||
      scenarios[0]?.frames[0]?.id ||
      ''
  );

  const activeScenario = useMemo(
    () => scenarios.find((scenario) => scenario.id === activeScenarioId) || scenarios[0],
    [scenarios, activeScenarioId]
  );
  const activeFrame =
    activeScenario?.frames.find((frame) => frame.id === activeFrameId) || activeScenario?.frames[0];

  const firstFrameId = activeScenario?.frames[0]?.id || '';

  React.useEffect(() => {
    setActiveFrameId(firstFrameId);
  }, [firstFrameId]);

  if (!activeScenario || !activeFrame) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#161b22] p-6 md:p-8">
      <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-400">
        Workflow Storyboard
      </div>
      <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>
      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-400">{intro}</p>

      <div className="mb-6 flex flex-wrap gap-3">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => setActiveScenarioId(scenario.id)}
            className={`rounded-full border px-4 py-2 text-sm transition-all ${
              scenario.id === activeScenario.id
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
            }`}
          >
            {scenario.title}
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-3 lg:grid-cols-5">
        {activeScenario.frames.map((frame) => (
          <button
            key={frame.id}
            type="button"
            onClick={() => setActiveFrameId(frame.id)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              frame.id === activeFrame.id
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-white/5 bg-[#0d1117] hover:border-white/15'
            }`}
          >
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
              {frame.phase}
            </div>
            <div className="mt-1 text-sm font-semibold text-white">{frame.title}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-6">
          <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
            Active frame
          </div>
          <h4 className="mb-3 text-xl font-bold text-white">{activeFrame.title}</h4>
          <p className="mb-5 text-sm leading-relaxed text-slate-300">{activeFrame.summary}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <StoryboardSignal label="Traffic shape" value={activeFrame.traffic} />
            <StoryboardSignal label="Storage involvement" value={activeFrame.storage} />
            <StoryboardSignal label="What fails first" value={activeFrame.failure} warning />
            <StoryboardSignal label="Where to learn next" value={activeFrame.nextModule} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-6">
          <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
            Scenario lens
          </div>
          <h4 className="mb-3 text-xl font-bold text-white">{activeScenario.title}</h4>
          <p className="text-sm leading-relaxed text-slate-300">{activeScenario.subtitle}</p>
        </div>
      </div>
    </div>
  );
};

const StoryboardSignal: React.FC<{ label: string; value: string; warning?: boolean }> = ({
  label,
  value,
  warning = false,
}) => (
  <div
    className={`rounded-xl border p-4 ${
      warning ? 'border-amber-500/20 bg-amber-500/10' : 'border-white/5 bg-black/20'
    }`}
  >
    <div
      className={`mb-1 text-[10px] font-mono uppercase tracking-[0.18em] ${
        warning ? 'text-amber-200' : 'text-slate-500'
      }`}
    >
      {label}
    </div>
    <p className={`text-sm leading-relaxed ${warning ? 'text-amber-100' : 'text-slate-300'}`}>
      {value}
    </p>
  </div>
);

export default WorkflowStoryboard;
