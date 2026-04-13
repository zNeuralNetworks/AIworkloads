import React, { useEffect } from 'react';
import { Activity, AlertTriangle, TrendingUp, Zap } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useLearning } from '../contexts/LearningContext';
import { PERFORMANCE_SECTION_CONTENT } from '../content/performance';
import type { InfrastructureImplication, KnowledgeCheck, RunbookReference, TelemetryWatchpoint } from '../types';
import { ChartPanel, HorizontalBarComparisonChart, MetricStatCard } from '../shared/visualization';
import AnnotatedChartPanel from './AnnotatedChartPanel';
import ComparisonCards from './ComparisonCards';
import InfrastructureImplicationsPanel from './InfrastructureImplicationsPanel';
import KnowledgeCheckCard from './KnowledgeCheckCard';
import QuickKnowledgeCheck from './QuickKnowledgeCheck';
import RunbookLinksPanel from './RunbookLinksPanel';
import SoWhatCallout from './SoWhatCallout';
import SourceBadge from './SourceBadge';
import TelemetryWatchPanel from './TelemetryWatchPanel';
import CompactDisclosure from './CompactDisclosure';
import { claimText, hasSourceMetadata } from '../utils/sourceClaims';

const ICON_BY_KEY = {
  activity: Activity,
  zap: Zap,
  trendingUp: TrendingUp,
} as const;

const PERFORMANCE_TELEMETRY: TelemetryWatchpoint[] = [
  { label: 'Throughput efficiency gap', signal: 'Efficiency trails the expected control-loop or pathing posture', whyItMatters: 'A low-efficiency result usually means the design is losing work to collisions, hot paths, or weak congestion posture before raw capacity is exhausted.' },
  { label: 'Failover convergence tail', signal: 'Link-failure recovery time is long enough to expand job or service disruption', whyItMatters: 'Failover results tell you whether the architecture is resilient enough for the workload’s tolerance to interruption.' },
  { label: 'Buffer behavior', signal: 'Buffer usage stays elevated instead of acting as bounded burst absorption', whyItMatters: 'This usually indicates the design is relying on prolonged buffering rather than timely pathing and feedback behavior.' },
  { label: 'JCT consistency', signal: 'JCT improvement is unstable run-to-run even when peak metrics look good', whyItMatters: 'Stable workload outcomes matter more than occasional benchmark highs.' },
];

const PERFORMANCE_RUNBOOKS: RunbookReference[] = [
  { id: 'ecn-instability', label: 'ECN Mark Rate Instability', context: 'Use this when low efficiency or unstable job results suggest the control loop is not reacting cleanly.' },
  { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce', context: 'Use this when performance regressions look like stragglers, hot rails, or path imbalance rather than simple capacity shortage.' },
  { id: 'incast-collapse', label: 'Throughput Collapse During Incast', context: 'Use this when efficiency drops under convergence or burst fan-in conditions.' },
];

const PERFORMANCE_IMPLICATIONS: InfrastructureImplication[] = [
  { label: 'What fails first', detail: 'Performance design errors show up first as unstable JCT, hot paths, or slow recovery rather than neat average-utilization collapse.' },
  { label: 'What to monitor first', detail: 'Monitor throughput efficiency, failover convergence, queue stability, and whether buffer use is acting as a bounded absorber or a prolonged crutch.' },
  { label: 'What to tune first', detail: 'Tune pathing, congestion posture, and failover behavior before assuming platform capacity is the only missing ingredient.' },
];

const PERFORMANCE_CHECK: KnowledgeCheck = {
  id: 'performance-interpretation-check',
  prompt: 'If bandwidth efficiency is weaker than expected, what is the best first interpretation?',
  correctOptionId: 'posture-first',
  options: [
    { id: 'bandwidth-only', label: 'The only useful conclusion is that the fabric needs more raw bandwidth.', rationale: 'More bandwidth may help later, but the first useful question is whether pathing, congestion posture, or hot-spot geometry are wasting the existing fabric.' },
    { id: 'posture-first', label: 'The likely issue is weak control or pathing posture, so investigate collisions, hot rails, and feedback behavior before jumping to capacity conclusions.', rationale: 'Correct. These metrics are meant to validate the architecture and control loop, not just justify bigger numbers.' },
    { id: 'ignore-failover', label: 'Performance interpretation should ignore failover because recovery is a separate operational topic.', rationale: 'That splits design from resilience incorrectly. Recovery behavior is part of whether the architecture is actually good enough for the workload.' },
  ],
};

const PERFORMANCE_MICRO_CHECK: KnowledgeCheck = {
  id: 'performance-evidence-check',
  prompt: 'What should a performance chart primarily do?',
  correctOptionId: 'validate-story',
  options: [
    { id: 'validate-story', label: 'Validate or challenge a design story', rationale: 'Correct. This turns the chart into a thinking tool instead of passive evidence.' },
    { id: 'show-bigger-number', label: 'Show that one platform has a bigger number', rationale: 'That reading creates shallow recognition rather than transfer. Tie metrics back to pathing, congestion, and resilience for better decision leverage.' },
  ],
};

const PERFORMANCE_SIGNAL_COMPARISON = [
  { title: 'Weak Efficiency', subtitle: 'Usually not a pure capacity problem', summary: 'Start by suspecting collisions, hot paths, or weak congestion posture before blaming raw bandwidth.', bullets: ['Go back to pattern or transport', 'Treat the metric as a clue about mechanism'], tone: 'amber' as const },
  { title: 'Slow Failover', subtitle: 'A resilience mismatch', summary: 'The design is not recovering quickly enough for the workload’s interruption tolerance.', bullets: ['Go back to architecture or operations', 'Recovery is part of the learning story'], tone: 'red' as const },
];

const PERFORMANCE_LEARNING_SEQUENCE = [
  { step: '1', title: 'Read the metric as evidence', detail: 'A chart matters only if it validates or disproves an earlier design claim.' },
  { step: '2', title: 'Tie the result to a mechanism', detail: 'Weak efficiency or slow failover should point back to pathing, control posture, or resilience assumptions.' },
  { step: '3', title: 'Decide what module owns the gap', detail: 'Go back to patterns, congestion, or architecture before assuming the problem is raw scale.' },
  { step: '4', title: 'Use metrics to justify action', detail: 'Performance is the validation layer for a design story, not a standalone trophy screen.' },
];

const PerformanceSection: React.FC = () => {
  const { performanceData, failoverData } = useData();
  const { markVisited, toggleMastered, masteredModules, activeWorkloadProfile, activeTrafficPattern } = useLearning();
  const isMastered = masteredModules.includes('performance');

  useEffect(() => {
    markVisited('performance');
  }, [markVisited]);

  return (
    <section id="performance" className="border-t border-white/5 bg-[#0F1117] py-32">
      <div className="container mx-auto px-6">
        <div className="mb-12 flex flex-col items-end justify-between gap-6 md:flex-row">
          <div>
            <div className="mb-4 font-mono text-xs uppercase tracking-widest text-red-500">
              {PERFORMANCE_SECTION_CONTENT.moduleLabel}
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl">{PERFORMANCE_SECTION_CONTENT.title}</h2>
            <p
              className="max-w-2xl text-slate-400"
              data-claim-id={hasSourceMetadata(PERFORMANCE_SECTION_CONTENT.subtitle) ? PERFORMANCE_SECTION_CONTENT.subtitle.claimId : undefined}
            >
              {claimText(PERFORMANCE_SECTION_CONTENT.subtitle)}
              {hasSourceMetadata(PERFORMANCE_SECTION_CONTENT.subtitle) && <SourceBadge claim={PERFORMANCE_SECTION_CONTENT.subtitle} className="ml-2" />}
            </p>
          </div>
          <div className="flex items-center gap-2 animate-pulse text-red-500">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="font-mono text-xs font-bold uppercase">{PERFORMANCE_SECTION_CONTENT.systemStatusLabel}</span>
          </div>
        </div>

        <div className="mb-12 grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-red-400">Why This Matters</div>
            <h3 className="mb-4 text-2xl font-bold text-white">Performance charts are architecture validation, not decoration</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              The goal is not to admire a better number. The goal is to decide what that number says about pathing, congestion posture, and resilience under failure.
            </p>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              <div className="mb-1 font-semibold">Common mistake</div>
              Teams treat efficiency or failover charts as proof of platform quality without translating them into operational and architectural consequences.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-400">Core Mental Model</div>
            <h3 className="mb-4 text-2xl font-bold text-white">Use the charts to prove or break the design story</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {PERFORMANCE_LEARNING_SEQUENCE.map((item) => (
                <div key={item.step} className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[11px] font-mono text-red-300">
                      Step {item.step}
                    </div>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {(activeWorkloadProfile || activeTrafficPattern) && (
          <div className="mb-12 rounded-2xl border border-red-500/15 bg-red-500/10 p-4 text-sm text-red-100">
            This validation layer is using the current learning context:
            {activeWorkloadProfile ? ` workload profile = ${activeWorkloadProfile};` : ''}
            {activeTrafficPattern ? ` traffic pattern = ${activeTrafficPattern}.` : ''}
            {' '}Interpret the charts as confirmation or rejection of that design posture.
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
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

        <div className="mb-12 grid gap-8">
          <AnnotatedChartPanel
            title="Bandwidth efficiency should validate the pathing story"
            intro="Use this chart to judge whether the current workload pattern is actually getting the path distribution and congestion behavior it needs."
            summary="Read this as a pathing and congestion signal, not just a bigger-number chart."
            proves="Whether CLB-style posture is converting synchronized or coordinated traffic into more usable throughput than baseline hashing."
            doesntProve="That one platform is universally better, or that raw bandwidth alone explains the outcome."
            nextCompare={
              activeTrafficPattern
                ? `Compare this against the active traffic pattern (${activeTrafficPattern}) and the congestion-control signals from the Transport module.`
                : 'Compare this against the active traffic pattern and the congestion-control signals from the Transport module.'
            }
          >
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
          </AnnotatedChartPanel>

          <AnnotatedChartPanel
            title="Failover convergence should validate resilience assumptions"
            intro="This chart matters because recovery behavior is part of architecture quality, not a separate operations topic."
            summary="Read this as a resilience signal: can the design recover quickly enough for the workload?"
            proves="Whether the design can absorb link failure quickly enough for the workload’s interruption tolerance."
            doesntProve="That the steady-state fabric is perfect, or that a fast benchmark automatically means graceful recovery."
            nextCompare={
              activeWorkloadProfile
                ? `Compare this against the interruption tolerance implied by the active workload profile (${activeWorkloadProfile}).`
                : 'Compare this against the workload’s tolerance for interruption and restart.'
            }
          >
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
          </AnnotatedChartPanel>
        </div>

        <div className="mb-12">
          <CompactDisclosure
            eyebrow="Show reasoning"
            title="Open the metric interpretation guide"
            summary="Use contrast only when you need help deciding whether the signal points to capacity, posture, or resilience."
          >
            <ComparisonCards
              eyebrow="Interpret The Signal"
              title="Use contrast to decide what the metric means"
              intro="Do not infer meaning from raw numbers alone. These are the two main decision paths the charts should support."
              items={PERFORMANCE_SIGNAL_COMPARISON}
            />
          </CompactDisclosure>
        </div>

        <div className="mb-12">
          <QuickKnowledgeCheck check={PERFORMANCE_MICRO_CHECK} moduleId="performance" />
        </div>

        <div className="mb-12">
          <CompactDisclosure
            eyebrow="Apply this"
            title="Open metric follow-through"
            summary="Telemetry, incident paths, and design implications stay available here, but they are no longer part of the first read."
          >
            <div className="grid gap-6 xl:grid-cols-2">
              <TelemetryWatchPanel
                title="Apply the metric interpretation with telemetry"
                eyebrow="Apply This"
                intro="These are the signals that turn performance metrics into a design review instead of a benchmark screenshot."
                items={PERFORMANCE_TELEMETRY}
              />
              <RunbookLinksPanel
                title="If the metrics imply an incident path"
                eyebrow="Apply This"
                intro="These runbooks are the next operational investigations when performance metrics suggest a control, pathing, or convergence problem."
                items={PERFORMANCE_RUNBOOKS}
              />
            </div>
            <div className="mt-6">
              <InfrastructureImplicationsPanel items={PERFORMANCE_IMPLICATIONS} />
            </div>
          </CompactDisclosure>
        </div>

        <div className="mb-12">
          <KnowledgeCheckCard check={PERFORMANCE_CHECK} moduleId="performance" />
        </div>

        <div className="mb-12 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-300">Transfer Prompt</div>
            <h3 className="mb-3 text-2xl font-bold text-white">Next decision</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              If the metrics validate the story, move to implementation or operations. If they do not validate the story, go back to the module that owns the failed assumption: communication pattern, congestion posture, or architecture choice.
            </p>
            <button
              onClick={() => toggleMastered('performance')}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                isMastered
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20'
              }`}
            >
              {isMastered ? 'Performance lens reviewed' : 'Mark performance lens reviewed'}
            </button>
          </div>

          <CompactDisclosure
            eyebrow="Deep explanation"
            title="Open the synthesis statement"
            summary="These metrics matter only if they explain stable workload outcomes."
          >
            <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5 text-sm leading-relaxed text-slate-300">
              “These metrics are not just proof that one feature is better. They show whether pathing, congestion control, and recovery behavior are turning the architecture into stable workload outcomes.”
            </div>
          </CompactDisclosure>
        </div>

        <SoWhatCallout body="A better performance number is only useful if you can explain which design posture it validates, what failure mode it reduces, and what operational question it answers next." />
      </div>
    </section>
  );
};

export default PerformanceSection;
