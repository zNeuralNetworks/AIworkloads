import React from 'react';
import type { InfrastructureImplication } from '../types';

interface InfrastructureImplicationsPanelProps {
  title?: string;
  eyebrow?: string;
  items: InfrastructureImplication[];
}

const InfrastructureImplicationsPanel: React.FC<InfrastructureImplicationsPanelProps> = ({
  title = 'Infrastructure Implications',
  eyebrow = 'Decision Support',
  items,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161b22] p-8">
      <div className="mb-6">
        <div className="mb-2 text-xs font-mono uppercase tracking-[0.28em] text-blue-500">
          {eyebrow}
        </div>
        <h3 className="text-2xl font-bold text-white">{title}</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
              {item.label}
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfrastructureImplicationsPanel;
