import React from 'react';
import type { TelemetryWatchpoint } from '../types';

interface TelemetryWatchPanelProps {
  title: string;
  eyebrow?: string;
  intro?: string;
  items: TelemetryWatchpoint[];
}

const TelemetryWatchPanel: React.FC<TelemetryWatchPanelProps> = ({
  title,
  eyebrow = 'Telemetry Watchpoints',
  intro,
  items,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161b22] p-8">
      <div className="mb-6">
        <div className="mb-2 text-xs font-mono uppercase tracking-[0.28em] text-cyan-400">{eyebrow}</div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        {intro && <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">{intro}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
            <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">{item.label}</div>
            <p className="mb-3 text-sm font-medium leading-relaxed text-slate-200">{item.signal}</p>
            <p className="text-sm leading-relaxed text-slate-400">{item.whyItMatters}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TelemetryWatchPanel;
