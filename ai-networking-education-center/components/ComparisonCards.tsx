import React from 'react';

export interface ComparisonCardItem {
  title: string;
  subtitle?: string;
  summary: string;
  bullets?: string[];
  tone?: 'blue' | 'violet' | 'emerald' | 'amber' | 'red';
}

interface ComparisonCardsProps {
  title: string;
  eyebrow?: string;
  intro?: string;
  items: ComparisonCardItem[];
}

const TONE_STYLES: Record<NonNullable<ComparisonCardItem['tone']>, { chip: string; border: string }> = {
  blue: {
    chip: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    border: 'hover:border-blue-500/30',
  },
  violet: {
    chip: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    border: 'hover:border-violet-500/30',
  },
  emerald: {
    chip: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    border: 'hover:border-emerald-500/30',
  },
  amber: {
    chip: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    border: 'hover:border-amber-500/30',
  },
  red: {
    chip: 'bg-red-500/10 text-red-300 border-red-500/20',
    border: 'hover:border-red-500/30',
  },
};

const ComparisonCards: React.FC<ComparisonCardsProps> = ({
  title,
  eyebrow = 'Quick Compare',
  intro,
  items,
}) => {
  return (
    <div className="rounded-3xl border border-white/5 bg-[#161b22] p-6 md:p-8">
      <div className="mb-6">
        <div className="mb-2 text-xs font-mono uppercase tracking-[0.24em] text-cyan-300">{eyebrow}</div>
        <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>
        {intro && <p className="max-w-3xl text-sm leading-relaxed text-slate-400">{intro}</p>}
      </div>

      <div className={`grid gap-4 ${items.length >= 4 ? 'xl:grid-cols-4 md:grid-cols-2' : items.length === 3 ? 'xl:grid-cols-3 md:grid-cols-2' : 'md:grid-cols-2'}`}>
        {items.map((item) => {
          const tone = item.tone || 'blue';
          const toneStyle = TONE_STYLES[tone];

          return (
            <div
              key={item.title}
              className={`rounded-2xl border border-white/5 bg-[#0d1117] p-5 transition-colors ${toneStyle.border}`}
            >
              <div className={`mb-3 inline-flex rounded-full border px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] ${toneStyle.chip}`}>
                {item.title}
              </div>
              {item.subtitle && <div className="mb-2 text-sm font-semibold text-white">{item.subtitle}</div>}
              <p className="mb-4 text-sm leading-relaxed text-slate-300">{item.summary}</p>
              {item.bullets && item.bullets.length > 0 && (
                <ul className="space-y-2">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-2 text-sm leading-relaxed text-slate-400">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonCards;
