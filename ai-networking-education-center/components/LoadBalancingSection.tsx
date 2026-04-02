import React, { useMemo, useState } from 'react';
import {
  GitMerge,
  Activity,
  Network,
  CheckCircle2,
  AlertCircle,
  Boxes,
  Server,
  ArrowRightLeft,
} from 'lucide-react';
import GlossaryTerm from './GlossaryTerm';
import InfrastructureImplicationsPanel from './InfrastructureImplicationsPanel';
import SoWhatCallout from './SoWhatCallout';
import {
  COMMUNICATION_PATTERNS,
  LB_MECHANISMS,
  LB_DECISION_TABLE,
  COMMUNICATION_MODULE_IMPLICATIONS,
} from '../constants/loadBalancing';
import type { Suitability } from '../constants/loadBalancing';

const ICON_COMPONENTS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  GitMerge,
  Activity,
  Network,
  Boxes,
  Server,
};

function suitabilityClasses(s: Suitability): string {
  if (s === 'excellent') return 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400';
  if (s === 'good') return 'border border-amber-500/30 bg-amber-500/15 text-amber-400';
  return 'border border-red-500/30 bg-red-500/15 text-red-400';
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
  const [activePatternId, setActivePatternId] = useState(COMMUNICATION_PATTERNS[0]?.id ?? 'all-reduce');
  const activePattern = useMemo(
    () => COMMUNICATION_PATTERNS.find((pattern) => pattern.id === activePatternId) || COMMUNICATION_PATTERNS[0],
    [activePatternId]
  );

  return (
    <section id="load-balancing" className="border-t border-slate-900 bg-slate-950 py-24">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-blue-500">
            Domain · Communication Patterns
          </div>
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Communication Patterns</h2>
          <p className="mx-auto max-w-3xl text-slate-400">
            Do not start with the load-balancing feature. Start with the communication pattern that is
            creating the stress signature, then choose the pathing and congestion posture that matches
            it.
          </p>
        </div>

        <div className="mb-12">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-blue-500">
            Pattern Signatures
          </div>
          <h3 className="mb-8 text-2xl font-bold text-white">Identify the traffic behavior before selecting the mechanism</h3>
        </div>

        <div className="mb-20">
          <div className="mb-6 grid gap-3 md:grid-cols-4">
            {COMMUNICATION_PATTERNS.map((pattern) => {
              const IconComp = ICON_COMPONENTS[pattern.iconKey] || GitMerge;
              const isActive = activePattern?.id === pattern.id;

              return (
                <button
                  key={pattern.id}
                  onClick={() => setActivePatternId(pattern.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? 'border-blue-500/30 bg-blue-500/10'
                      : 'border-slate-800 bg-slate-900 hover:border-white/15'
                  }`}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className={`rounded-lg p-2 ${isActive ? 'bg-blue-900/30 text-blue-400' : 'bg-white/5 text-slate-400'}`}>
                      <IconComp size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{pattern.title}</div>
                      <div className={`text-[11px] font-mono uppercase tracking-[0.18em] ${isActive ? 'text-blue-300' : 'text-slate-500'}`}>
                        {pattern.subtitle}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-400">{pattern.triggerCondition}</p>
                </button>
              );
            })}
          </div>

          {activePattern && (
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.95fr]">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">
                      Guided Pattern View
                    </div>
                    <h3 className="text-2xl font-bold text-white">{activePattern.title}</h3>
                  </div>
                  <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.18em] text-blue-300">
                    {activePattern.subtitle}
                  </div>
                </div>

                <div className="mb-6 rounded-2xl border border-white/5 bg-[#0d1117] p-6">
                  <PatternVisual patternId={activePattern.id} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <SignalCard label="What the traffic is doing" value={activePattern.triggerCondition} />
                  <SignalCard label="Network stress signature" value={activePattern.stressSignature} />
                  <SignalCard label="Required design posture" value={activePattern.designPosture} />
                  <SignalCard label="Operational risk" value={activePattern.operationalRisk} warning />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
                <div className="mb-4 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">
                  Guided Interpretation
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
                    <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      First thing to notice
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      Start with the traffic geometry. The right question is whether the pattern is
                      symmetric, convergent, skewed, or storage-coupled, because each one breaks the
                      fabric in a different way.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
                    <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Linked Runbooks
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activePattern.runbooks.map((runbook) => (
                        <span
                          key={`${activePattern.id}-${runbook.id}`}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                        >
                          {runbook.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
                    <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Where this leads next
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Transport & Congestion', 'Data Movement', 'Mechanism Selection'].map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      Once the pattern is clear, move to congestion control and pathing choices.
                      That is when <GlossaryTerm term="ECMP">ECMP</GlossaryTerm>, <GlossaryTerm term="DLB">DLB</GlossaryTerm>, and <GlossaryTerm term="CLB">CLB</GlossaryTerm> become meaningful decisions instead of feature names.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-12">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-blue-500">
            Mechanism Selection
          </div>
          <h3 className="mb-8 text-2xl font-bold text-white">Choose the control loop after the traffic pattern is clear</h3>
        </div>

        <div className="mb-12 grid gap-6 lg:grid-cols-3">
          {LB_MECHANISMS.map((mech) => {
            const IconComp = ICON_COMPONENTS[mech.iconKey] || GitMerge;
            return (
              <div
                key={mech.id}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-7 transition-colors hover:border-blue-500/30"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="shrink-0 rounded-lg bg-blue-900/20 p-3 text-blue-400">
                    <IconComp size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      <GlossaryTerm term={mech.title}>{mech.title}</GlossaryTerm>
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
                      {mech.subtitle}
                    </p>
                  </div>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-slate-400">{mech.description}</p>

                <div className="mb-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                    Strengths
                  </div>
                  <ul className="space-y-2">
                    {mech.strengths.map((strength) => (
                      <li key={strength} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-red-400">
                    Limitations
                  </div>
                  <ul className="space-y-2">
                    {mech.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-start gap-2 text-sm text-slate-300">
                        <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-800 pt-4">
                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-slate-400">Tier:</span> {mech.tier}
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-slate-400">Awareness:</span> {mech.awareness}
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${suitabilityClasses(mech.suitability)}`}>
                    {mech.suitabilityLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-20 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 px-6 py-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Mechanism Selection Guide</h3>
            <p className="mt-1 text-xs text-slate-500">
              Use the communication pattern to decide whether baseline hashing is enough or whether queue-aware
              or collective-aware behavior is required.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950">
                  <th className="px-6 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">
                    Mechanism
                  </th>
                  <th className="border-l border-slate-800 px-6 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">
                    Tier
                  </th>
                  <th className="border-l border-slate-800 px-6 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">
                    Awareness
                  </th>
                  <th className="border-l border-slate-800 px-6 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">
                    AI Suitability
                  </th>
                  <th className="border-l border-slate-800 px-6 py-3 text-xs font-mono uppercase tracking-wider text-slate-500">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {LB_DECISION_TABLE.map((row) => (
                  <tr
                    key={row.mechanism}
                    className="border-b border-slate-800 transition-colors last:border-0 hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-white">
                      {DECISION_ROW_TERMS[row.mechanism] ? (
                        <GlossaryTerm term={row.mechanism}>{row.mechanism}</GlossaryTerm>
                      ) : (
                        row.mechanism
                      )}
                    </td>
                    <td className="border-l border-slate-800 px-6 py-4 text-sm text-slate-400">{row.tier}</td>
                    <td className="border-l border-slate-800 px-6 py-4 text-sm text-slate-400">{row.awareness}</td>
                    <td className="border-l border-slate-800 px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${suitabilityClasses(row.aiSuitability)}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${suitabilityDot(row.aiSuitability)}`} />
                        {row.aiSuitabilityLabel}
                      </span>
                    </td>
                    <td className="border-l border-slate-800 px-6 py-4 text-sm text-slate-400">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-20">
          <InfrastructureImplicationsPanel items={COMMUNICATION_MODULE_IMPLICATIONS} />
        </div>

        <SoWhatCallout body="Do not tune the fabric because you have ECMP, DLB, or CLB available. Tune it because you know whether the workload is creating synchronized collectives, broad fan-out, receiver convergence, or skew-sensitive expert dispatch, and the control loop matches that behavior." />
      </div>
    </section>
  );
};

export default LoadBalancingSection;

const SignalCard: React.FC<{ label: string; value: string; warning?: boolean }> = ({ label, value, warning = false }) => (
  <div className={`rounded-xl border p-4 ${warning ? 'border-amber-500/20 bg-amber-500/10' : 'border-white/5 bg-[#111827]'}`}>
    <div className={`mb-2 text-[11px] font-mono uppercase tracking-[0.18em] ${warning ? 'text-amber-300' : 'text-slate-500'}`}>
      {label}
    </div>
    <p className={`text-sm leading-relaxed ${warning ? 'text-slate-200' : 'text-slate-300'}`}>{value}</p>
  </div>
);

const PatternVisual: React.FC<{ patternId: string }> = ({ patternId }) => {
  switch (patternId) {
    case 'all-reduce':
      return <AllReducePatternVisual />;
    case 'all-to-all':
      return <AllToAllPatternVisual />;
    case 'parameter-server':
      return <ParameterServerPatternVisual />;
    case 'moe-dispatch':
      return <MoeDispatchPatternVisual />;
    default:
      return <AllReducePatternVisual />;
  }
};

const AllReducePatternVisual: React.FC = () => (
  <div className="relative h-64">
    <div className="mb-4 text-xs font-mono uppercase tracking-[0.18em] text-blue-400">
      synchronized collective
    </div>
    <div className="relative mx-auto h-44 max-w-md">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`absolute h-4 w-4 rounded-full ${
            i === 4 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.45)]' : 'bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
          }`}
          style={{
            top: `${50 + 36 * Math.sin(i * 1.25)}%`,
            left: `${50 + 36 * Math.cos(i * 1.25)}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      <svg className="absolute inset-0 h-full w-full opacity-50">
        <path d="M66,100 L150,35 L242,60 L245,150 L120,175 Z" stroke="#60a5fa" strokeWidth="1.5" fill="none" />
        <path d="M66,100 L242,60" stroke="#60a5fa" strokeWidth="1.5" className="animate-pulse" />
        <path d="M150,35 L245,150" stroke="#60a5fa" strokeWidth="1.5" className="animate-pulse" />
        <path d="M242,60 L120,175" stroke="#60a5fa" strokeWidth="1.5" className="animate-pulse" />
      </svg>
      <div className="absolute bottom-0 right-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
        one slow rail stretches the whole step
      </div>
    </div>
  </div>
);

const AllToAllPatternVisual: React.FC = () => (
  <div className="relative h-64">
    <div className="mb-4 text-xs font-mono uppercase tracking-[0.18em] text-blue-400">
      broad fan-out and convergence
    </div>
    <div className="grid h-44 grid-cols-2 gap-8">
      <div className="rounded-xl border border-white/5 bg-[#111827] p-4">
        <div className="mb-3 text-xs text-slate-500">senders</div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 rounded bg-blue-500/25" />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-white/5 bg-[#111827] p-4">
        <div className="mb-3 text-xs text-slate-500">receivers</div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 rounded bg-blue-500/25" />
          ))}
        </div>
      </div>
      <svg className="absolute inset-0 h-full w-full opacity-55">
        {[
          [30, 72, 286, 54],
          [30, 96, 286, 82],
          [30, 120, 286, 108],
          [46, 150, 286, 138],
          [52, 176, 286, 166],
        ].map((line, i) => (
          <path
            key={i}
            d={`M${line[0]},${line[1]} C145,${line[1] - 16} 185,${line[3] + 10} ${line[2]},${line[3]}`}
            stroke="#60a5fa"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
        ))}
      </svg>
      <div className="absolute bottom-0 right-0 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">
        entropy and headroom matter before average utilization does
      </div>
    </div>
  </div>
);

const ParameterServerPatternVisual: React.FC = () => (
  <div className="relative h-64">
    <div className="mb-4 text-xs font-mono uppercase tracking-[0.18em] text-blue-400">
      converging on a small target set
    </div>
    <div className="grid h-44 grid-cols-[1fr_auto_1fr] items-center gap-6">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-white/5 bg-blue-500/10 p-3 text-center text-xs text-blue-200">
            worker {i + 1}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 text-blue-400">
        <ArrowRightLeft size={18} />
        <ArrowRightLeft size={18} />
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border border-blue-500/30 bg-[#111827] p-4">
          <div className="mb-2 flex items-center gap-2 text-blue-300">
            <Server size={16} />
            <span className="text-sm font-bold">Aggregator A</span>
          </div>
          <div className="h-3 rounded-full bg-blue-500/70" />
        </div>
        <div className="rounded-xl border border-blue-500/30 bg-[#111827] p-4">
          <div className="mb-2 flex items-center gap-2 text-blue-300">
            <Server size={16} />
            <span className="text-sm font-bold">Aggregator B</span>
          </div>
          <div className="h-3 w-2/3 rounded-full bg-blue-500/35" />
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 right-0 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">
      a few receivers can become the real bottleneck
    </div>
  </div>
);

const MoeDispatchPatternVisual: React.FC = () => (
  <div className="relative h-64">
    <div className="mb-4 text-xs font-mono uppercase tracking-[0.18em] text-blue-400">
      skew-sensitive expert routing
    </div>
    <div className="grid h-44 grid-cols-[1fr_auto_1fr] items-center gap-6">
      <div className="space-y-3">
        {['token batch a', 'token batch b', 'token batch c'].map((label) => (
          <div key={label} className="rounded-lg border border-white/5 bg-blue-500/10 p-3 text-sm text-blue-200">
            {label}
          </div>
        ))}
      </div>
      <GitMerge className="text-blue-400" />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-blue-400/40 bg-blue-500/20 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm text-white">
            <Boxes size={14} className="text-blue-300" />
            expert 1
          </div>
          <div className="h-3 rounded-full bg-blue-400/75" />
        </div>
        <div className="rounded-xl border border-white/5 bg-[#111827] p-3">
          <div className="mb-2 flex items-center gap-2 text-sm text-white">
            <Boxes size={14} className="text-slate-400" />
            expert 2
          </div>
          <div className="h-3 w-1/2 rounded-full bg-slate-700" />
        </div>
        <div className="rounded-xl border border-blue-400/40 bg-blue-500/20 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm text-white">
            <Boxes size={14} className="text-blue-300" />
            expert 3
          </div>
          <div className="h-3 rounded-full bg-blue-400/75" />
        </div>
        <div className="rounded-xl border border-white/5 bg-[#111827] p-3">
          <div className="mb-2 flex items-center gap-2 text-sm text-white">
            <Boxes size={14} className="text-slate-400" />
            expert 4
          </div>
          <div className="h-3 w-1/2 rounded-full bg-slate-700" />
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 right-0 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-200">
      average utilization can hide a few overloaded destinations
    </div>
  </div>
);
