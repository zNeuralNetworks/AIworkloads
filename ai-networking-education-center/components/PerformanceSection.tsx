import React, { useEffect } from 'react';
import { Activity, AlertTriangle, Zap, TrendingUp } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useLearning } from '../contexts/LearningContext';
import { PERFORMANCE_SECTION_CONTENT } from '../content/performance';
import type { InfrastructureImplication, KnowledgeCheck, RunbookReference, TelemetryWatchpoint } from '../types';
import { MetricStatCard, ChartPanel, HorizontalBarComparisonChart } from '../shared/visualization';
import InfrastructureImplicationsPanel from './InfrastructureImplicationsPanel';
import KnowledgeCheckCard from './KnowledgeCheckCard';
import RunbookLinksPanel from './RunbookLinksPanel';
import SoWhatCallout from './SoWhatCallout';
import SourceBadge from './SourceBadge';
import TelemetryWatchPanel from './TelemetryWatchPanel';
import { claimText, hasSourceMetadata } from '../utils/sourceClaims';

const ICON_BY_KEY = {
  activity: Activity,
  zap: Zap,
  trendingUp: TrendingUp,
} as const;

const PERFORMANCE_TELEMETRY: TelemetryWatchpoint[] = [
  {
    label: 'Throughput efficiency gap',
    signal: 'Efficiency trails the expected control-loop or pathing posture',
    whyItMatters: 'A low-efficiency result usually means the design is losing work to collisions, hot paths, or weak congestion posture before raw capacity is exhausted.',
  },
  {
    label: 'Failover convergence tail',
    signal: 'Link-failure recovery time is long enough to expand job or service disruption',
    whyItMatters: 'Failover results tell you whether the architecture is resilient enough for the workload’s tolerance to interruption.',
  },
  {
    label: 'Buffer behavior',
    signal: 'Buffer usage stays elevated instead of acting as bounded burst absorption',
    whyItMatters: 'This usually indicates the design is relying on prolonged buffering rather than timely pathing and feedback behavior.',
  },
  {
    label: 'JCT consistency',
    signal: 'JCT improvement is unstable run-to-run even when peak metrics look good',
    whyItMatters: 'Stable workload outcomes matter more than occasional benchmark highs.',
  },
];

const PERFORMANCE_RUNBOOKS: RunbookReference[] = [
  {
    id: 'ecn-instability',
    label: 'ECN Mark Rate Instability',
    context: 'Use this when low efficiency or unstable job results suggest the control loop is not reacting cleanly.',
  },
  {
    id: 'allreduce-tail-latency',
    label: 'High Tail Latency During All-Reduce',
    context: 'Use this when performance regressions look like stragglers, hot rails, or path imbalance rather than simple capacity shortage.',
  },
  {
    id: 'incast-collapse',
    label: 'Throughput Collapse During Incast',
    context: 'Use this when efficiency drops under convergence or burst fan-in conditions.',
  },
];

const PERFORMANCE_IMPLICATIONS: InfrastructureImplication[] = [
  {
    label: 'What fails first',
    detail: 'Performance design errors show up first as unstable JCT, hot paths, or slow recovery rather than neat average-utilization collapse.',
  },
  {
    label: 'What to monitor first',
    detail: 'Monitor throughput efficiency, failover convergence, queue stability, and whether buffer use is acting as a bounded absorber or a prolonged crutch.',
  },
  {
    label: 'What to tune first',
    detail: 'Tune pathing, congestion posture, and failover behavior before assuming platform capacity is the only missing ingredient.',
  },
];

const PERFORMANCE_CHECK: KnowledgeCheck = {
  id: 'performance-interpretation-check',
  prompt: 'If bandwidth efficiency is weaker than expected, what is the best first interpretation?',
  correctOptionId: 'posture-first',
  options: [
    {
      id: 'bandwidth-only',
      label: 'The only useful conclusion is that the fabric needs more raw bandwidth.',
      rationale: 'More bandwidth may help later, but the first useful question is whether pathing, congestion posture, or hot-spot geometry are wasting the existing fabric.',
    },
    {
      id: 'posture-first',
      label: 'The likely issue is weak control or pathing posture, so investigate collisions, hot rails, and feedback behavior before jumping to capacity conclusions.',
      rationale: 'Correct. These metrics are meant to validate the architecture and control loop, not just justify bigger numbers.',
    },
    {
      id: 'ignore-failover',
      label: 'Performance interpretation should ignore failover because recovery is a separate operational topic.',
      rationale: 'That splits design from resilience incorrectly. Recovery behavior is part of whether the architecture is actually good enough for the workload.',
    },
  ],
};

const PerformanceSection: React.FC = () => {
  const { performanceData, failoverData } = useData();
  const { markVisited, toggleMastered, masteredModules } = useLearning();
  const isMastered = masteredModules.includes('performance');

  useEffect(() => {
    markVisited('performance');
  }, [markVisited]);

  return (
    <section id="performance" className="py-32 bg-[#0F1117] border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="text-red-500 font-mono text-xs uppercase tracking-widest mb-4">
              {PERFORMANCE_SECTION_CONTENT.moduleLabel}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {PERFORMANCE_SECTION_CONTENT.title}
            </h2>
            <p
              className="text-slate-400 max-w-2xl"
              data-claim-id={
                hasSourceMetadata(PERFORMANCE_SECTION_CONTENT.subtitle)
                  ? PERFORMANCE_SECTION_CONTENT.subtitle.claimId
                  : undefined
              }
            >
              {claimText(PERFORMANCE_SECTION_CONTENT.subtitle)}
              {hasSourceMetadata(PERFORMANCE_SECTION_CONTENT.subtitle) && (
                <SourceBadge claim={PERFORMANCE_SECTION_CONTENT.subtitle} className="ml-2" />
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 text-red-500 animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="font-mono text-xs font-bold uppercase">
              {PERFORMANCE_SECTION_CONTENT.systemStatusLabel}
            </span>
          </div>
        </div>

        <div className="mb-12 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-red-400">How to read this</div>
            <h3 className="mb-4 text-2xl font-bold text-white">Performance charts are architecture validation, not decoration</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              The goal is not to admire a better number. The goal is to decide what that number says about pathing, congestion posture, and resilience under failure.
            </p>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              <div className="mb-1 font-semibold">Common mistake</div>
              Teams treat efficiency or failover charts as proof of platform quality without translating them into operational and architectural consequences.
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#161b22] p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">Bandwidth efficiency validates</div>
              <p className="text-sm leading-relaxed text-slate-300">Whether the control loop and path-distribution posture are turning theoretical capacity into useful workload progress.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#161b22] p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-300">Weak efficiency suggests</div>
              <p className="text-sm leading-relaxed text-slate-300">Collisions, hot rails, queue instability, or receiver convergence are consuming the fabric before bandwidth is actually exhausted.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#161b22] p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">Failover validates</div>
              <p className="text-sm leading-relaxed text-slate-300">Whether the architecture recovers quickly enough for the workload’s tolerance to disruption, not just whether a link technically comes back.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#161b22] p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-300">Slow failover suggests</div>
              <p className="text-sm leading-relaxed text-slate-300">The resilience model is not aligned with job completion or serving requirements, so the next question is architecture and operations posture, not just routing theory.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {PERFORMANCE_SECTION_CONTENT.stats.map((stat) => (
            <MetricStatCard
              key={`${stat.label}-${hasSourceMetadata(stat.trend) ? stat.trend.claimId : 'no-claim-id'}`}
              label={stat.label}
              value={stat.value}
              unit={stat.unit}
              trend={claimText(stat.trend)}
              icon={ICON_BY_KEY[stat.iconKey]}
            />
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ChartPanel
            title={PERFORMANCE_SECTION_CONTENT.charts.bandwidth.title}
            subtitle={claimText(PERFORMANCE_SECTION_CONTENT.charts.bandwidth.subtitle)}
            footer={
              hasSourceMetadata(PERFORMANCE_SECTION_CONTENT.charts.bandwidth.subtitle) ? (
                <SourceBadge claim={PERFORMANCE_SECTION_CONTENT.charts.bandwidth.subtitle} />
              ) : undefined
            }
          >
            <HorizontalBarComparisonChart
              data={performanceData.map((item) => ({ ...item, name: claimText(item.name) }))}
              dataKey="efficiency"
              valueUnit="%"
              xDomain={[0, 100]}
            />
          </ChartPanel>

          <ChartPanel
            title={PERFORMANCE_SECTION_CONTENT.charts.failover.title}
            subtitle={claimText(PERFORMANCE_SECTION_CONTENT.charts.failover.subtitle)}
            footer={
              hasSourceMetadata(PERFORMANCE_SECTION_CONTENT.charts.failover.subtitle) ? (
                <SourceBadge claim={PERFORMANCE_SECTION_CONTENT.charts.failover.subtitle} />
              ) : undefined
            }
            icon={AlertTriangle}
          >
            <HorizontalBarComparisonChart
              data={failoverData.map((item) => ({ ...item, name: claimText(item.name) }))}
              dataKey="delay"
              valueUnit="ms"
            />
          </ChartPanel>
        </div>

        <div className="mb-12 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">Telemetry-to-decision bridge</div>
            <h3 className="mb-4 text-2xl font-bold text-white">What to investigate next</h3>
            <div className="space-y-4">
              <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">If bandwidth efficiency is weak</div>
                <p className="text-sm leading-relaxed text-slate-300">Suspect pathing or congestion posture first. Move into Communication Patterns and Transport & Congestion before assuming the platform is simply too small.</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">If failover delay is high</div>
                <p className="text-sm leading-relaxed text-slate-300">Suspect resilience posture, failure-domain assumptions, and operational recovery discipline. Move into Architecture Patterns and Operational Runbooks next.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-300">What to do next</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Communication Patterns', 'Transport & Congestion', 'Architecture Patterns', 'Operational Runbooks'].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {item}
                </span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Use this module as the validation layer for the design story you told earlier in the app. If the charts do not support the expected outcome, the architecture or control posture is still incomplete.
            </p>
          </div>
        </div>

        <div className="mb-12">
          <TelemetryWatchPanel
            title="Performance validation telemetry"
            intro="These are the signals that turn performance metrics into a design review instead of a benchmark screenshot."
            items={PERFORMANCE_TELEMETRY}
          />
        </div>

        <div className="mb-12">
          <RunbookLinksPanel
            title="If the metrics imply an incident path"
            intro="These runbooks are the next operational investigations when performance metrics suggest a control, pathing, or convergence problem."
            items={PERFORMANCE_RUNBOOKS}
          />
        </div>

        <div className="mb-12">
          <InfrastructureImplicationsPanel items={PERFORMANCE_IMPLICATIONS} />
        </div>

        <div className="mb-12">
          <KnowledgeCheckCard check={PERFORMANCE_CHECK} moduleId="performance" />
        </div>

        <div className="mb-12 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-cyan-300">Explain It Back</div>
            <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5 text-sm leading-relaxed text-slate-300">
              “These metrics are not just proof that one feature is better. They show whether pathing, congestion control, and recovery behavior are turning the architecture into stable workload outcomes.”
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-300">Self-check</div>
            <h3 className="mb-3 text-2xl font-bold text-white">What fails first if the design story is wrong?</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              Stable performance usually fails before raw capacity does. The warning sign is weak efficiency, long failover, or inconsistent JCT under conditions the architecture was supposed to absorb.
            </p>
            <button
              onClick={() => toggleMastered('performance')}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                isMastered
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20'
              }`}
            >
              {isMastered ? 'Marked as understood' : 'Mark this module as understood'}
            </button>
          </div>
        </div>

        <SoWhatCallout body="A better performance number is only useful if you can explain which design posture it validates, what failure mode it reduces, and what operational question it answers next." />
      </div>
    </section>
  );
};

export default PerformanceSection;
