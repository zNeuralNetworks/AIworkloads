import React from 'react';
import type { RunbookReference } from '../types';

interface RunbookLinksPanelProps {
  title: string;
  eyebrow?: string;
  intro?: string;
  items: RunbookReference[];
}

const RunbookLinksPanel: React.FC<RunbookLinksPanelProps> = ({
  title,
  eyebrow = 'Operational Bridge',
  intro,
  items,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161b22] p-8">
      <div className="mb-6">
        <div className="mb-2 text-xs font-mono uppercase tracking-[0.28em] text-emerald-400">{eyebrow}</div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        {intro && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">{intro}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`/operations#${item.id}`}
            className="rounded-xl border border-white/5 bg-[#0d1117] p-5 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5"
          >
            <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-300">Runbook</div>
            <div className="mb-2 text-sm font-semibold text-white">{item.label}</div>
            <p className="text-sm leading-relaxed text-slate-400">{item.context}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default RunbookLinksPanel;
