import React, { useEffect, useMemo, useState } from 'react';
import { Cpu, BarChart2, SlidersHorizontal, AlertTriangle, ArrowRightLeft, Timer, GitBranch, Boxes, Microscope, Activity } from 'lucide-react';
import {
  WORKLOAD_DECISION_PROMPTS,
  WORKLOAD_PROFILES,
  WORKLOAD_DECISION_TABLE,
  WORKLOAD_DECISION_NOTES,
  WORKLOAD_MODULE_IMPLICATIONS,
  ICON_MAP,
} from '../constants';
import type { DecisionSimulatorResult, KnowledgeCheck, RunbookReference, TelemetryWatchpoint } from '../types';
import DecisionSimulator from './DecisionSimulator';
import InfrastructureImplicationsPanel from './InfrastructureImplicationsPanel';
import KnowledgeCheckCard from './KnowledgeCheckCard';
import RunbookLinksPanel from './RunbookLinksPanel';
import SoWhatCallout from './SoWhatCallout';
import TelemetryWatchPanel from './TelemetryWatchPanel';
import TrafficPatternLab from './TrafficPatternLab';
import { useLearning } from '../contexts/LearningContext';

const FALLBACK_ICONS = {
  Activity,
  ArrowRightLeft,
  AlertTriangle,
  BarChart2,
  Boxes,
  Cpu,
  GitBranch,
  Microscope,
  SlidersHorizontal,
  Timer,
};

const WORKLOAD_PATTERN_BY_PROFILE: Record<string, string> = {
  pretraining: 'all-reduce',
  finetuning: 'checkpoint-burst',
  'batch-inference': 'all-to-all',
  'realtime-inference': 'parameter-server',
  'scientific-hpc': 'checkpoint-burst',
};

const WORKLOAD_RUNBOOKS: Record<string, RunbookReference[]> = {
  pretraining: [
    { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce', context: 'Use this when synchronized training is dominated by a straggler rail or path imbalance.' },
    { id: 'ecn-instability', label: 'ECN Mark Rate Instability', context: 'Use this when the congestion loop is arriving too late for collective pressure.' },
  ],
  finetuning: [
    { id: 'incast-collapse', label: 'Throughput Collapse During Incast', context: 'Use this when checkpoint or mixed-stage bursts collapse throughput at shared receivers.' },
    { id: 'pfc-storm', label: 'PFC Storm / Head-of-Line Blocking', context: 'Use this when shared-fabric pause spreads beyond the active checkpoint event.' },
  ],
  'batch-inference': [
    { id: 'incast-collapse', label: 'Throughput Collapse During Incast', context: 'Use this when fan-in or aggregation tiers become the real bottleneck.' },
    { id: 'ecn-instability', label: 'ECN Mark Rate Instability', context: 'Use this when broad fan-out and receiver convergence outrun the expected feedback loop.' },
  ],
  'realtime-inference': [
    { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce', context: 'Use this as the model for hunting one hot path or path skew that stretches tail latency.' },
    { id: 'ecn-instability', label: 'ECN Mark Rate Instability', context: 'Use this when microbursts or queue volatility are destabilizing response time.' },
  ],
  'scientific-hpc': [
    { id: 'incast-collapse', label: 'Throughput Collapse During Incast', context: 'Use this when barrier or checkpoint stages converge on a constrained receiver set.' },
    { id: 'pfc-storm', label: 'PFC Storm / Head-of-Line Blocking', context: 'Use this when recovery and restart paths spread pause beyond the original hotspot.' },
  ],
};

const WORKLOAD_CHECK: KnowledgeCheck = {
  id: 'workload-profile-check',
  prompt: 'If the workload profile is misclassified, what is usually the first real consequence?',
  correctOptionId: 'wrong-posture',
  options: [
    {
      id: 'wrong-acronym',
      label: 'The main issue is usually that the team chose the wrong acronym, so the first fix is protocol renaming.',
      rationale: 'This misses the module’s point. The damaging mistake is choosing the wrong congestion, pathing, and recovery posture for the actual workload shape.',
    },
    {
      id: 'wrong-posture',
      label: 'The design adopts the wrong posture, and the failure appears first as stragglers, hotspots, restart collapse, or P99 regression rather than average bandwidth loss.',
      rationale: 'Correct. Misclassification leads to the wrong architecture and operations posture first, not just the wrong vocabulary.',
    },
    {
      id: 'only-sizing',
      label: 'The only likely problem is poor quantitative sizing, so behavior and telemetry matter less than capacity math.',
      rationale: 'Sizing matters later, but the first error is usually choosing the wrong behavioral model for the workload and therefore the wrong design posture.',
    },
  ],
};

const TrainingVsInferenceSection: React.FC = () => {
  const { markVisited, toggleMastered, masteredModules } = useLearning();
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({
    synchronizationIntensity: 'high',
    latencySensitivity: 'tail',
    storageCoupling: 'low',
    objective: 'completion',
  });
  const [manualProfileId, setManualProfileId] = useState<string | null>(null);
  const isMastered = masteredModules.includes('training-vs-inference');

  useEffect(() => {
    markVisited('training-vs-inference');
  }, [markVisited]);

  const computedProfileId = useMemo(() => {
    if (selectedValues.objective === 'response' || selectedValues.latencySensitivity === 'tail') {
      if (selectedValues.synchronizationIntensity === 'low') {
        return 'realtime-inference';
      }
    }

    if (selectedValues.storageCoupling === 'high') {
      return selectedValues.objective === 'completion' ? 'scientific-hpc' : 'finetuning';
    }

    if (selectedValues.synchronizationIntensity === 'high' && selectedValues.objective === 'completion') {
      return 'pretraining';
    }

    if (selectedValues.objective === 'throughput') {
      return 'batch-inference';
    }

    if (selectedValues.synchronizationIntensity === 'medium') {
      return 'finetuning';
    }

    return 'scientific-hpc';
  }, [selectedValues]);

  const workloadResults = useMemo<DecisionSimulatorResult[]>(() => {
    const telemetryGuidance: Record<string, string> = {
      pretraining: 'These signals validate whether synchronized collectives are bounded by healthy path symmetry and early feedback.',
      finetuning: 'These signals validate whether checkpoint and shared-fabric behavior are distorting the training posture.',
      'batch-inference': 'These signals validate whether throughput collapse is coming from convergence and skew rather than pure capacity shortage.',
      'realtime-inference': 'These signals validate whether the network is consuming too much of the serving latency budget.',
      'scientific-hpc': 'These signals validate whether barrier and restart phases are the true operational bottleneck.',
    };

    return WORKLOAD_PROFILES.map((profile) => ({
      id: profile.id,
      title: profile.title,
      summary: profile.summary,
      recommendedPosture: profile.title,
      whyItFits: profile.designPosture,
      whatFailsFirst: profile.operationalRisk,
      tradeoffs: [
        `Dominant traffic: ${profile.dominantTraffic}`,
        `Burstiness: ${profile.burstiness}`,
        `Retransmission tolerance: ${profile.retransmissionTolerance}`,
      ],
      telemetry: [
        {
          label: 'Monitor first',
          signal: profile.latencySensitivity,
          whyItMatters: telemetryGuidance[profile.id],
        },
        {
          label: 'Traffic signature',
          signal: profile.dominantTraffic,
          whyItMatters: 'This confirms whether the workload is really behaving the way the design conversation assumes.',
        },
      ] as TelemetryWatchpoint[],
      nextSteps:
        profile.id === 'pretraining'
          ? ['Communication Patterns', 'Transport & Congestion', 'Architecture Patterns']
          : profile.id === 'realtime-inference'
            ? ['Performance Implications', 'Platform Considerations', 'Transport & Congestion']
            : ['Data Movement', 'Communication Patterns', 'Transport & Congestion'],
      runbookLinks: WORKLOAD_RUNBOOKS[profile.id],
      plannerTrigger: `Once the workload posture is clear, move to planning when the remaining question is quantitative scale, optics, lane count, or fabric tier count.`,
      misconception:
        profile.id === 'pretraining'
          ? 'Do not stop at “AI training.” The design question is whether synchronized collectives and straggler sensitivity dominate the network behavior.'
          : profile.id === 'realtime-inference'
            ? 'Do not treat serving like a smaller training cluster. Tail latency and jitter consume the user experience directly.'
            : profile.id === 'scientific-hpc'
              ? 'Do not assume scientific workflow behavior is just AI training with different tools. Restart and storage phases can dominate the architecture.'
              : 'Do not jump from workload label to platform choice without validating the traffic shape, failure signature, and telemetry loop first.',
      diagramMode: WORKLOAD_PATTERN_BY_PROFILE[profile.id],
    }));
  }, []);

  const activeResult =
    workloadResults.find((result) => result.id === (manualProfileId ?? computedProfileId)) || workloadResults[0];

  const handleSimulatorChange = (promptId: string, optionId: string) => {
    setSelectedValues((prev) => ({ ...prev, [promptId]: optionId }));
    setManualProfileId(null);
  };

  const activeProfile = WORKLOAD_PROFILES.find((profile) => profile.id === activeResult.id) || WORKLOAD_PROFILES[0];

  return (
    <section id="training-vs-inference" className="border-t border-white/5 bg-slate-900 py-32">
      <div className="container mx-auto px-6">
        <div className="mb-20 flex flex-col items-center text-center">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-violet-500">
            Domain · Workload Types
          </div>
          <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">Workload Types</h2>
          <p className="max-w-4xl text-lg leading-relaxed text-slate-400">
            The first architecture decision is not protocol selection. It is identifying what kind of
            workload the network is actually serving, because traffic direction, burst behavior, and
            failure signatures change materially across pre-training, fine-tuning, inference, and
            scientific workflow profiles.
          </p>
        </div>

        <div className="mb-12 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-violet-400">
              Why This Matters
            </div>
            <h3 className="mb-4 text-2xl font-bold text-white">Choose the workload before the fabric posture</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              The common failure is choosing a transport or platform story before proving what kind of workload behavior is actually dominant.
            </p>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              <div className="mb-1 font-semibold">What users usually get wrong</div>
              They treat “training,” “inference,” or “HPC” as enough detail. The useful question is which workload behavior dominates and which failure signature proves it.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-400">
              Learning Frame
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">Quick take</div>
                <p className="text-sm leading-relaxed text-slate-300">
                  Workload behavior determines traffic shape, failure mode, and what the network must do well before platform sizing begins.
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">What you should leave with</div>
                <p className="text-sm leading-relaxed text-slate-300">
                  You should be able to explain the dominant workload profile, what fails first, and which module should come next.
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5 md:col-span-2">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">Depth guidance</div>
                <p className="text-sm leading-relaxed text-slate-300">
                  Use the simulator first, then use the traffic pattern lab as the visual explanation layer that proves why the recommended workload posture makes sense.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <DecisionSimulator
            eyebrow="Workload Decision Simulator"
            title="Choose workload traits, then see the likely infrastructure consequence"
            intro="This simulator turns workload labels into actual design posture. Change the traits until the active profile matches the behavior you are trying to explain."
            prompts={WORKLOAD_DECISION_PROMPTS}
            selectedValues={selectedValues}
            onChange={handleSimulatorChange}
            results={workloadResults}
            activeResult={activeResult}
            onSelectResult={setManualProfileId}
          >
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-5">
              <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-violet-300">Profile reference</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {WORKLOAD_PROFILES.map((profile) => {
                  const Icon =
                    ICON_MAP[profile.iconKey] ||
                    FALLBACK_ICONS[profile.iconKey as keyof typeof FALLBACK_ICONS] ||
                    Cpu;
                  const isActive = profile.id === activeProfile.id;
                  return (
                    <button
                      key={profile.id}
                      onClick={() => setManualProfileId(profile.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        isActive
                          ? 'border-violet-500/30 bg-violet-500/10'
                          : 'border-white/5 bg-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className={`rounded-xl p-2.5 ${isActive ? 'bg-violet-500/15 text-violet-300' : 'bg-white/5 text-slate-400'}`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{profile.title}</div>
                          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                            {profile.subtitle}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-400">{profile.summary}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </DecisionSimulator>
        </div>

        <TrafficPatternLab activePatternId={activeResult.diagramMode} />

        <div className="mb-20 overflow-x-auto">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-violet-500">
            Decision Outputs
          </div>
          <div className="min-w-[960px] overflow-hidden rounded-2xl border border-white/5">
            <div className="grid grid-cols-5 gap-px bg-white/5">
              <div className="bg-[#161b22] p-4 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                Dimension
              </div>
              <div className="bg-[#161b22] p-4 text-sm font-bold text-blue-400">Pre-Training</div>
              <div className="bg-[#161b22] p-4 text-sm font-bold text-violet-400">Fine-Tuning</div>
              <div className="bg-[#161b22] p-4 text-sm font-bold text-emerald-400">Batch Inference</div>
              <div className="bg-[#161b22] p-4 text-sm font-bold text-teal-400">Real-Time Inference</div>
            </div>
            <div className="space-y-px bg-white/5">
              {WORKLOAD_DECISION_TABLE.map((row) => (
                <div key={row.dimension} className="grid grid-cols-5 gap-px">
                  <div className="bg-[#0d1117] p-4 text-sm font-medium text-slate-300">{row.dimension}</div>
                  <div className="bg-[#0d1117] p-4 text-sm text-slate-400">{row.preTraining}</div>
                  <div className="bg-[#0d1117] p-4 text-sm text-slate-400">{row.fineTuning}</div>
                  <div className="bg-[#0d1117] p-4 text-sm text-slate-400">{row.batchInference}</div>
                  <div className="bg-[#0d1117] p-4 text-sm text-slate-400">{row.realTimeInference}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-20">
          <TelemetryWatchPanel
            title="What to monitor first for the active workload"
            intro="The right telemetry depends on the workload shape. Use the active profile to decide which counters or timing signals should lead the investigation."
            items={activeResult.telemetry}
          />
        </div>

        <div className="mb-20">
          <RunbookLinksPanel
            title="If this becomes an incident, go here next"
            intro="These runbooks follow the active workload profile so the operational bridge matches the behavior you are diagnosing."
            items={activeResult.runbookLinks || []}
          />
        </div>

        <div className="mb-20">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-violet-500">
            First Response
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {WORKLOAD_DECISION_NOTES.map((note) => {
              const Icon =
                ICON_MAP[note.iconKey] ||
                FALLBACK_ICONS[note.iconKey as keyof typeof FALLBACK_ICONS] ||
                Cpu;

              return (
                <div key={note.title} className="rounded-2xl border border-white/5 bg-[#161b22] p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400">
                      <Icon size={18} />
                    </div>
                    <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                      {note.title}
                    </h4>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-400">{note.guidance}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-20">
          <InfrastructureImplicationsPanel items={WORKLOAD_MODULE_IMPLICATIONS} />
        </div>

        <div className="mb-20">
          <KnowledgeCheckCard check={WORKLOAD_CHECK} moduleId="training-vs-inference" />
        </div>

        <div className="mb-20 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-cyan-300">
              Explain It Back
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">End-of-module synthesis</h3>
            <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5 text-sm leading-relaxed text-slate-300">
              “The first networking decision is to classify the workload behavior correctly. Once that profile is clear, the right traffic pattern, telemetry loop, and next architecture question become much more obvious.”
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-300">
              Self-check
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">What fails first if this is designed incorrectly?</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              Usually not a clean average-throughput chart. It is the wrong failure signature for the real workload: stragglers, hotspot receivers, restart collapse, or serving tail regression.
            </p>
            <button
              onClick={() => toggleMastered('training-vs-inference')}
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

        <SoWhatCallout body="Do not ask whether the environment is 'training or inference' and stop there. Ask which workload profile is dominant, what failure signature matters most, and which telemetry proves the fabric posture is correct before you size anything." />
      </div>
    </section>
  );
};

export default TrainingVsInferenceSection;
