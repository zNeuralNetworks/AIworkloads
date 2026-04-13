import React, { useMemo, useState } from 'react';
import {
  GitMerge,
  Activity,
  Network,
  CheckCircle2,
  AlertCircle,
  Boxes,
  Server,
} from 'lucide-react';
import GlossaryTerm from './GlossaryTerm';
import CompactDisclosure from './CompactDisclosure';
import InfrastructureImplicationsPanel from './InfrastructureImplicationsPanel';
import RunbookLinksPanel from './RunbookLinksPanel';
import SoWhatCallout from './SoWhatCallout';
import TelemetryWatchPanel from './TelemetryWatchPanel';
import PatternDecoder from './PatternDecoder';
import TrafficPatternLab from './TrafficPatternLab';
import {
  COMMUNICATION_PATTERNS,
  LB_MECHANISMS,
  LB_DECISION_TABLE,
  COMMUNICATION_MODULE_IMPLICATIONS,
} from '../constants/loadBalancing';
import { PLANNER_HANDOFF_LABEL, PLANNER_HANDOFF_SHORT_TEXT } from '../constants';
import type { Suitability } from '../constants/loadBalancing';
import type { RunbookReference, TelemetryWatchpoint } from '../types';
import { useLearning } from '../contexts/LearningContext';

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

const COMMUNICATION_TELEMETRY: TelemetryWatchpoint[] = [
  {
    label: 'Rail imbalance',
    signal: 'One or a few paths stay hotter than peers during collective phases',
    whyItMatters: 'This is often the first sign that hashing or path distribution is mismatched to the communication pattern.',
  },
  {
    label: 'Receiver convergence',
    signal: 'Destination queues build sharply while the wider fabric still looks only moderately utilized',
    whyItMatters: 'Incast and expert skew failures are receiver problems first, not generic utilization problems.',
  },
  {
    label: 'Queue volatility',
    signal: 'Rapid queue oscillation or ECN instability during all-to-all or MoE exchange',
    whyItMatters: 'Fast volatility tells you the pattern is outrunning the control loop under burst coordination.',
  },
  {
    label: 'Pattern-specific skew',
    signal: 'One receiver set, expert group, or aggregator tier consistently lags the rest',
    whyItMatters: 'Main-flow path tuning should follow the skew source rather than assume a fabric-wide bottleneck.',
  },
];

const COMMUNICATION_RUNBOOKS: RunbookReference[] = [
  {
    id: 'allreduce-tail-latency',
    label: 'High Tail Latency During All-Reduce',
    context: 'Use this when synchronized collective traffic is being stretched by a hot path or degraded rail.',
  },
  {
    id: 'incast-collapse',
    label: 'Throughput Collapse During Incast',
    context: 'Use this when many senders converge on a small receiver set and throughput collapses under burst fan-in.',
  },
  {
    id: 'ecn-instability',
    label: 'ECN Mark Rate Instability',
    context: 'Use this when pattern-specific bursts outrun the expected early-feedback behavior.',
  },
];

const LoadBalancingSection: React.FC = () => {
  const { activeTrafficPattern, setActiveTrafficPattern, toggleMastered, masteredModules } = useLearning();
  const isMastered = masteredModules.includes('load-balancing');
  const [activePatternId, setActivePatternId] = useState(activeTrafficPattern || COMMUNICATION_PATTERNS[0]?.id || 'all-reduce');
  const activePattern = useMemo(
    () => COMMUNICATION_PATTERNS.find((pattern) => pattern.id === activePatternId) || COMMUNICATION_PATTERNS[0],
    [activePatternId]
  );

  React.useEffect(() => {
    if (!activePattern) return;
    setActiveTrafficPattern(activePattern.id);
  }, [activePattern, setActiveTrafficPattern]);

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

        <div className="mb-12 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">Why This Matters</div>
            <h3 className="mb-3 text-2xl font-bold text-white">The pattern determines the mechanism</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Load-balancing failures are almost always communication-pattern mismatches, not feature gaps. Identifying whether the workload creates synchronized collectives, broad fan-out, receiver convergence, or expert dispatch resolves most mechanism choices before hardware is specified.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">Decision model</div>
            <h3 className="mb-3 text-xl font-bold text-white">Pattern → mechanism → posture</h3>
            <ol className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-2"><span className="shrink-0 font-mono text-blue-400">1.</span>Identify the dominant communication pattern from the traffic shape</li>
              <li className="flex gap-2"><span className="shrink-0 font-mono text-blue-400">2.</span>Choose the load-balancing mechanism that matches the pattern's timing and scope</li>
              <li className="flex gap-2"><span className="shrink-0 font-mono text-blue-400">3.</span>Set the congestion posture to complement the selected control loop</li>
            </ol>
          </div>
        </div>

        <div className="mb-12">
          {activeTrafficPattern && (
            <div className="mb-6 rounded-2xl border border-blue-500/15 bg-blue-500/10 p-4 text-sm text-blue-100">
              The active traffic pattern is carried forward from the earlier reference flow. Change it here if the workload geometry is different from the initial profile.
            </div>
          )}
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-blue-500">
            Pattern Signatures
          </div>
          <h3 className="mb-8 text-2xl font-bold text-white">Identify the traffic behavior before selecting the mechanism</h3>
        </div>

        <div className="mb-20">
          <div className="mb-8">
            <TrafficPatternLab
              activePatternId={activePatternId}
              onPatternChange={setActivePatternId}
            />
          </div>

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
            <PatternDecoder
              title="Turn the geometry into a diagnosis"
              intro="The lab above shows the traffic shape. This decoder converts that picture into the next useful engineering questions before comparing ECMP, DLB, CLB, or spraying."
              shape={activePattern.triggerCondition}
              concentration={activePattern.stressSignature}
              posture={activePattern.designPosture}
              failure={activePattern.operationalRisk}
            />
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

        <div className="mb-20">
          <TelemetryWatchPanel
            title="Pattern validation telemetry"
            intro="These watchpoints help prove whether the communication pattern diagnosis is correct before mechanism selection turns into trial-and-error tuning."
            items={COMMUNICATION_TELEMETRY}
          />
        </div>

        <div className="mb-20">
          <RunbookLinksPanel
            title="If the pattern turns into a production problem"
            intro="These operational bridges connect communication-pattern diagnosis to the first incident workflows worth opening."
            items={COMMUNICATION_RUNBOOKS}
          />
        </div>

        <SoWhatCallout body="Do not tune the fabric because you have ECMP, DLB, or CLB available. Tune it because you know whether the workload is creating synchronized collectives, broad fan-out, receiver convergence, or skew-sensitive expert dispatch, and the control loop matches that behavior." />

        <div className="mt-12 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-300">Transfer Prompt</div>
            <h3 className="mb-3 text-2xl font-bold text-white">Next decision</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              Once the dominant communication pattern is identified and the control loop is chosen, move to the Operations Playbooks to validate the congestion posture under failure, or to Architecture to confirm topology alignment.
            </p>
            <button
              onClick={() => toggleMastered('load-balancing')}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                isMastered
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20'
              }`}
            >
              {isMastered ? 'Pattern lens reviewed' : 'Mark pattern lens reviewed'}
            </button>
          </div>

          <CompactDisclosure
            eyebrow={PLANNER_HANDOFF_LABEL}
            title="Open planner handoff guidance"
            summary="Move to quantitative planning once the dominant communication pattern is clear."
          >
            <p className="text-sm leading-relaxed text-slate-300">
              Validate the communication pattern and mechanism choice here first, then move to quantitative planning.{' '}
              {PLANNER_HANDOFF_SHORT_TEXT}
            </p>
          </CompactDisclosure>
        </div>
      </div>
    </section>
  );
};

export default LoadBalancingSection;
