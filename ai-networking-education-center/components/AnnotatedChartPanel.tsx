import React from 'react';
import CompactDisclosure from './CompactDisclosure';

interface AnnotatedChartPanelProps {
  eyebrow?: string;
  title: string;
  intro: string;
  proves: string;
  doesntProve: string;
  nextCompare: string;
  summary: string;
  children: React.ReactNode;
}

const AnnotatedChartPanel: React.FC<AnnotatedChartPanelProps> = ({
  eyebrow = 'Evidence Unit',
  title,
  intro,
  proves,
  doesntProve,
  nextCompare,
  summary,
  children,
}) => (
  <div className="rounded-3xl border border-white/10 bg-[#161b22] p-6 md:p-8">
    <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-red-400">{eyebrow}</div>
    <h3 className="mb-2 text-2xl font-bold text-white">{title}</h3>
    <p className="mb-4 max-w-3xl text-sm leading-relaxed text-slate-300">{summary}</p>

    <div className="mb-6 rounded-2xl border border-white/5 bg-[#0d1117] p-4">{children}</div>

    <CompactDisclosure
      eyebrow="Deep explanation"
      title="Open the chart reasoning"
      summary={intro}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <EvidenceCard label="What this proves" value={proves} tone="blue" />
        <EvidenceCard label="What this does not prove" value={doesntProve} tone="amber" />
        <EvidenceCard label="What to compare next" value={nextCompare} tone="emerald" />
      </div>
    </CompactDisclosure>
  </div>
);

const EvidenceCard: React.FC<{
  label: string;
  value: string;
  tone: 'blue' | 'amber' | 'emerald';
}> = ({ label, value, tone }) => {
  const classes =
    tone === 'amber'
      ? 'border-amber-500/20 bg-amber-500/10 text-amber-100'
      : tone === 'emerald'
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
        : 'border-blue-500/20 bg-blue-500/10 text-blue-100';

  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.18em]">{label}</div>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
};

export default AnnotatedChartPanel;
