
import React from 'react';
import { GitMerge, Activity, Network, CheckCircle2, AlertCircle } from 'lucide-react';
import GlossaryTerm from './GlossaryTerm';
import { LB_MECHANISMS, LB_DECISION_TABLE } from '../constants/loadBalancing';
import type { Suitability } from '../constants/loadBalancing';

const ICON_COMPONENTS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  GitMerge,
  Activity,
  Network,
};

function suitabilityClasses(s: Suitability): string {
  if (s === 'excellent') return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
  if (s === 'good') return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
  return 'bg-red-500/15 text-red-400 border border-red-500/30';
}

function suitabilityDot(s: Suitability): string {
  if (s === 'excellent') return 'bg-emerald-400';
  if (s === 'good') return 'bg-amber-400';
  return 'bg-red-400';
}

const DECISION_ROW_TERMS: Record<string, boolean> = {
  ECMP: true,
  DLB: true,
  CLB: true,
  'Packet Spraying': true,
};

const LoadBalancingSection: React.FC = () => {
  return (
    <section id="load-balancing" className="py-24 bg-slate-950 border-t border-slate-900">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-orange-500 font-mono text-xs uppercase tracking-widest mb-4">Domain · Communication Patterns</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Communication Patterns</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            How collective communication patterns drive pathing behavior, imbalance risk, and congestion response.
          </p>
        </div>

        {/* Three mechanism cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {LB_MECHANISMS.map((mech) => {
            const IconComp = ICON_COMPONENTS[mech.iconKey] || GitMerge;
            return (
              <div
                key={mech.id}
                className="bg-slate-900 rounded-2xl p-7 border border-slate-800 flex flex-col hover:border-orange-500/30 transition-colors"
              >
                {/* Card header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-900/20 rounded-lg text-orange-400 shrink-0">
                    <IconComp size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      <GlossaryTerm term={mech.title}>{mech.title}</GlossaryTerm>
                    </h3>
                    <p className="text-orange-400 text-xs font-semibold uppercase tracking-wider">
                      {mech.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{mech.description}</p>

                {/* Strengths */}
                <div className="mb-4">
                  <div className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-2">
                    Strengths
                  </div>
                  <ul className="space-y-2">
                    {mech.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limitations */}
                <div className="mb-6">
                  <div className="text-xs text-red-400 font-semibold uppercase tracking-widest mb-2">
                    Limitations
                  </div>
                  <ul className="space-y-2">
                    {mech.limitations.map((l, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">
                    <span className="text-slate-400 font-medium">Tier:</span> {mech.tier}
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="text-slate-400 font-medium">Awareness:</span> {mech.awareness}
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${suitabilityClasses(mech.suitability)}`}
                  >
                    {mech.suitabilityLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Decision table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">
              Mechanism Selection Guide
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Which load balancing approach for which layer — and when{' '}
              <GlossaryTerm term="Incast">incast</GlossaryTerm> risk is highest.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="px-6 py-3 text-slate-500 font-mono text-xs uppercase tracking-wider">
                    Mechanism
                  </th>
                  <th className="px-6 py-3 text-slate-500 font-mono text-xs uppercase tracking-wider border-l border-slate-800">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-slate-500 font-mono text-xs uppercase tracking-wider border-l border-slate-800">
                    Awareness
                  </th>
                  <th className="px-6 py-3 text-slate-500 font-mono text-xs uppercase tracking-wider border-l border-slate-800">
                    AI Suitability
                  </th>
                  <th className="px-6 py-3 text-slate-500 font-mono text-xs uppercase tracking-wider border-l border-slate-800">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {LB_DECISION_TABLE.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-800 last:border-0 hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-white font-semibold text-sm">
                      {DECISION_ROW_TERMS[row.mechanism] ? (
                        <GlossaryTerm term={row.mechanism}>{row.mechanism}</GlossaryTerm>
                      ) : (
                        row.mechanism
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm border-l border-slate-800">
                      {row.tier}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm border-l border-slate-800">
                      {row.awareness}
                    </td>
                    <td className="px-6 py-4 border-l border-slate-800">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${suitabilityClasses(row.aiSuitability)}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${suitabilityDot(row.aiSuitability)}`}
                        />
                        {row.aiSuitabilityLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm border-l border-slate-800">
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoadBalancingSection;
