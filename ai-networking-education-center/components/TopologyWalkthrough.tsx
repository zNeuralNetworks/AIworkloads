import React, { useMemo, useState } from 'react';
import CompactDisclosure from './CompactDisclosure';

export interface TopologyWalkthroughFailureMode {
  id: string;
  label: string;
  detail: string;
}

export interface TopologyWalkthroughItem {
  id: string;
  title: string;
  subtitle: string;
  fit: string;
  posture: string;
  inspect: string;
  visualTone?: 'blue' | 'violet' | 'emerald';
  failureModes: TopologyWalkthroughFailureMode[];
}

interface TopologyWalkthroughProps {
  title: string;
  intro: string;
  items: TopologyWalkthroughItem[];
  activeItemId: string;
  summary: string;
  onSelectItem?: (itemId: string) => void;
}

const TopologyWalkthrough: React.FC<TopologyWalkthroughProps> = ({
  title,
  intro,
  items,
  activeItemId,
  summary,
  onSelectItem,
}) => {
  const activeItem = useMemo(
    () => items.find((item) => item.id === activeItemId) || items[0],
    [items, activeItemId]
  );
  const [activeFailureId, setActiveFailureId] = useState(activeItem?.failureModes[0]?.id || '');

  const firstFailureId = activeItem?.failureModes[0]?.id || '';

  React.useEffect(() => {
    setActiveFailureId(firstFailureId);
  }, [firstFailureId]);

  const activeFailure =
    activeItem?.failureModes.find((failure) => failure.id === activeFailureId) ||
    activeItem?.failureModes[0];

  if (!activeItem) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#161b22] p-6 md:p-8">
      <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">
        Topology Walkthrough
      </div>
      <h3 className="mb-2 text-2xl font-bold text-white">{title}</h3>
      <p className="mb-4 max-w-3xl text-sm leading-relaxed text-slate-300">{summary}</p>

      <div className="mb-6 grid gap-3 lg:grid-cols-3">
        {items.map((item) => {
          const active = item.id === activeItem.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectItem?.(item.id)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                active
                  ? 'border-blue-500/30 bg-blue-500/10'
                  : 'border-white/5 bg-[#0d1117] hover:border-white/15'
              }`}
            >
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                {item.subtitle}
              </div>
              <div className="mt-1 text-lg font-bold text-white">{item.title}</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.fit}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                Active posture
              </div>
              <h4 className="mt-1 text-xl font-bold text-white">{activeItem.title}</h4>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-300">
              {activeItem.subtitle}
            </span>
          </div>

          <TopologyVisual tone={activeItem.visualTone || 'blue'} />

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <SignalBlock label="Best fit" value={activeItem.fit} />
            <SignalBlock label="Topology posture" value={activeItem.posture} />
            <SignalBlock label="Inspect first" value={activeItem.inspect} />
            <CompactDisclosure
              eyebrow="Failure mode"
              title="Why this pattern can fail"
              summary={activeFailure?.label || 'Select a failure mode'}
            >
              <SignalBlock
                label="Failure readout"
                value={activeFailure?.detail || 'Select a failure mode to see what breaks first.'}
                warning
              />
            </CompactDisclosure>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-6">
          <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
            What breaks first?
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {activeItem.failureModes.map((failure) => (
              <button
                key={failure.id}
                type="button"
                onClick={() => setActiveFailureId(failure.id)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                  failure.id === activeFailure?.id
                    ? 'border-red-500/30 bg-red-500/10 text-red-200'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                }`}
              >
                {failure.label}
              </button>
            ))}
          </div>

          <CompactDisclosure
            eyebrow="Show reasoning"
            title="Open the active failure analysis"
            summary={activeFailure?.detail || 'Select a failure mode to see what breaks first.'}
          >
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-red-200">
                Active failure
              </div>
              <p className="text-sm leading-relaxed text-red-100">{activeFailure?.detail}</p>
            </div>
          </CompactDisclosure>
        </div>
      </div>

      <div className="mt-6">
        <CompactDisclosure
          eyebrow="How to read this"
          title="Why this walkthrough exists"
          summary={intro}
        >
          <p className="text-sm leading-relaxed text-slate-300">
            Use this walkthrough to identify the best-fit posture first. Only after that should you open deeper reasoning or trait-based confirmation.
          </p>
        </CompactDisclosure>
      </div>
    </div>
  );
};

const SignalBlock: React.FC<{ label: string; value: string; warning?: boolean }> = ({
  label,
  value,
  warning = false,
}) => (
  <div
    className={`rounded-xl border p-4 ${
      warning ? 'border-red-500/20 bg-red-500/5' : 'border-white/5 bg-black/20'
    }`}
  >
    <div
      className={`mb-1 text-[10px] font-mono uppercase tracking-[0.18em] ${
        warning ? 'text-red-200' : 'text-slate-500'
      }`}
    >
      {label}
    </div>
    <p className={`text-sm leading-relaxed ${warning ? 'text-red-100' : 'text-slate-300'}`}>
      {value}
    </p>
  </div>
);

const TopologyVisual: React.FC<{ tone: 'blue' | 'violet' | 'emerald' }> = ({ tone }) => {
  const railClasses =
    tone === 'violet'
      ? 'bg-violet-400/60'
      : tone === 'emerald'
        ? 'bg-emerald-400/60'
        : 'bg-blue-400/60';

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="grid h-36 grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-white/10 bg-[#0b1020] p-4">
            <div className={`mb-3 h-2 rounded-full ${railClasses}`} />
            <div className={`mb-2 h-2 rounded-full ${railClasses} opacity-75`} />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((__, nodeIndex) => (
                <div key={nodeIndex} className="h-5 rounded bg-white/10" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopologyWalkthrough;
