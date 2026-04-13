import React, { useEffect, useMemo, useState } from 'react';
import { Cpu, BarChart2, SlidersHorizontal, AlertTriangle, ArrowRightLeft, Timer, GitBranch, Boxes, Microscope, Activity } from 'lucide-react';
import {
  WORKLOAD_DECISION_PROMPTS,
  WORKLOAD_PROFILES,
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
import ComparisonCards from './ComparisonCards';
import QuickKnowledgeCheck from './QuickKnowledgeCheck';
import { useLearning } from '../contexts/LearningContext';
import WorkloadProfileFingerprint from './WorkloadProfileFingerprint';
import MiniPatternPreview from './MiniPatternPreview';
import ProfileDeltaHint from './ProfileDeltaHint';
import CompactDisclosure from './CompactDisclosure';

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

const WORKLOAD_MICRO_CHECK: KnowledgeCheck = {
  id: 'workload-sequencing-check',
  prompt: 'Before selecting a design posture, what should be identified first?',
  correctOptionId: 'workload-behavior',
  options: [
    {
      id: 'workload-behavior',
      label: 'The dominant workload behavior and its likely first failure',
      rationale: 'Correct. The workload profile sets up the traffic pattern, telemetry loop, and next design question.',
    },
    {
      id: 'platform-choice',
      label: 'The likely switch or silicon family',
      rationale: 'Platform choice is downstream. Starting there creates unnecessary cognitive load and weak mental models.',
    },
  ],
};

const WORKLOAD_PROFILE_CONTRASTS = [
  {
    title: 'Pre-Training',
    subtitle: 'Barrier-heavy collective behavior',
    summary: 'Everyone contributes and everyone waits. One slow rail stretches the whole step.',
    bullets: ['Tail jitter matters more than average latency', 'Path symmetry and early feedback dominate'],
    tone: 'violet' as const,
  },
  {
    title: 'Real-Time Inference',
    subtitle: 'Tail-latency constrained serving',
    summary: 'The network is part of the response-time budget, so jitter and microbursts matter immediately.',
    bullets: ['P99 matters more than bulk throughput', 'Request-path consistency dominates'],
    tone: 'emerald' as const,
  },
  {
    title: 'Scientific Workflow',
    subtitle: 'Barrier plus restart/storage pressure',
    summary: 'The architecture must survive both synchronized compute and checkpoint or restart phases.',
    bullets: ['Storage coupling can dominate', 'Recovery quality is part of the design'],
    tone: 'amber' as const,
  },
];

const WORKLOAD_LEARNING_SEQUENCE = [
  {
    step: '1',
    title: 'Classify the workload',
    detail: 'Start with the dominant behavior, not the transport acronym.',
  },
  {
    step: '2',
    title: 'Inspect the traffic pattern',
    detail: 'Use the active profile to predict where queueing, convergence, or stragglers appear.',
  },
  {
    step: '3',
    title: 'Validate with telemetry',
    detail: 'Check the counters and timing signals that should fail first for that profile.',
  },
  {
    step: '4',
    title: 'Choose the next design question',
    detail: 'Only then move to data movement, pathing, congestion, or topology posture.',
  },
];

const PROFILE_TRAIT_HINTS: Record<string, Record<string, string>> = {
  pretraining: {
    synchronizationIntensity: 'high',
    latencySensitivity: 'balanced',
    storageCoupling: 'low',
    objective: 'completion',
  },
  finetuning: {
    synchronizationIntensity: 'medium',
    latencySensitivity: 'balanced',
    storageCoupling: 'high',
    objective: 'completion',
  },
  'batch-inference': {
    synchronizationIntensity: 'low',
    latencySensitivity: 'throughput',
    storageCoupling: 'low',
    objective: 'throughput',
  },
  'realtime-inference': {
    synchronizationIntensity: 'low',
    latencySensitivity: 'tail',
    storageCoupling: 'low',
    objective: 'response',
  },
  'scientific-hpc': {
    synchronizationIntensity: 'medium',
    latencySensitivity: 'balanced',
    storageCoupling: 'high',
    objective: 'completion',
  },
};

const PROMPT_LABELS: Record<string, string> = {
  synchronizationIntensity: 'Synchronization',
  latencySensitivity: 'Latency',
  storageCoupling: 'Storage coupling',
  objective: 'Objective',
};

const TrainingVsInferenceSection: React.FC = () => {
  const { markVisited, toggleMastered, masteredModules, setActiveWorkloadProfile, setActiveTrafficPattern } = useLearning();
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({
    synchronizationIntensity: 'high',
    latencySensitivity: 'tail',
    storageCoupling: 'low',
    objective: 'completion',
  });
  const [manualProfileId, setManualProfileId] = useState<string | null>(null);
  const [lastChangedPromptId, setLastChangedPromptId] = useState<string | null>(null);
  const trafficLabRef = React.useRef<HTMLDivElement | null>(null);
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

  const previousProfileRef = React.useRef(activeResult.id);
  const previousProfileId = previousProfileRef.current;

  useEffect(() => {
    setActiveWorkloadProfile(activeResult.id);
    if (activeResult.diagramMode) {
      setActiveTrafficPattern(activeResult.diagramMode);
    }
  }, [activeResult.diagramMode, activeResult.id, setActiveTrafficPattern, setActiveWorkloadProfile]);

  useEffect(() => {
    previousProfileRef.current = activeResult.id;
  }, [activeResult.id]);

  const handleSimulatorChange = (promptId: string, optionId: string) => {
    setSelectedValues((prev) => ({ ...prev, [promptId]: optionId }));
    setManualProfileId(null);
    setLastChangedPromptId(promptId);
  };

  const activeProfile = WORKLOAD_PROFILES.find((profile) => profile.id === activeResult.id) || WORKLOAD_PROFILES[0];
  const alternativeProfiles = WORKLOAD_PROFILES
    .filter((profile) => profile.id !== activeProfile.id)
    .map((profile) => {
      const expected = PROFILE_TRAIT_HINTS[profile.id] || {};
      const distance = Object.entries(expected).reduce((score, [key, value]) => {
        return score + (selectedValues[key] === value ? 0 : 1);
      }, 0);
      return { profile, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 2);

  const changedPromptValue = lastChangedPromptId ? selectedValues[lastChangedPromptId] : undefined;
  const profileChangeExplanation =
    lastChangedPromptId === 'latencySensitivity'
      ? 'This dimension changes whether the network is protecting tail latency, bulk progress, or balanced recovery behavior.'
      : lastChangedPromptId === 'storageCoupling'
        ? 'This dimension shifts the classifier toward or away from checkpoint, restart, and staging-driven architectures.'
        : lastChangedPromptId === 'objective'
          ? 'This dimension changes whether the design optimizes for completion, response time, or aggregate drain.'
          : 'This dimension changes whether synchronized barriers or looser throughput behavior dominate the fabric conversation.';

  const resultSummaryTags = [
    { label: 'Traffic', value: activeProfile.dominantTraffic, tone: 'blue' as const },
    { label: 'Latency', value: activeProfile.latencySensitivity, tone: 'violet' as const },
    { label: 'Storage', value: selectedValues.storageCoupling, tone: 'amber' as const },
    { label: 'Risk', value: activeProfile.operationalRisk.split(',')[0], tone: 'emerald' as const },
  ];

  const scrollToTrafficLab = () => {
    trafficLabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="training-vs-inference" className="nav-safe-bottom border-t border-white/5 bg-slate-900 pt-28">
      <div className="container mx-auto px-6">
        <div className="mb-16 flex flex-col items-center text-center">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.18em] text-violet-500">
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

        <div className="post-hero-band grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
          <div className="rounded-xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.16em] text-violet-400">
              Why This Matters
            </div>
            <h3 className="mb-4 text-2xl font-bold text-white">Choose the workload before the fabric posture</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              The common failure is choosing a transport or platform story before proving what kind of workload behavior is actually dominant.
            </p>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              <div className="mb-1 font-semibold">What users usually get wrong</div>
              They treat “training,” “inference,” or “HPC” as enough detail. The useful question is which workload behavior dominates and which failure signature proves it.
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.16em] text-emerald-400">
              Core Mental Model
            </div>
            <h3 className="mb-4 text-2xl font-bold text-white">Use the same four-step decision chain every time</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {WORKLOAD_LEARNING_SEQUENCE.map((item) => (
                <div key={item.step} className="rounded-lg border border-white/5 bg-[#0d1117] p-5">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-mono text-violet-300">
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

        <div className="post-hero-band">
          <ComparisonCards
            eyebrow="Anchor Contrasts"
            title="Use a few memorable contrasts instead of memorizing every profile at once"
            intro="Use these anchor cases to separate the dominant workload profiles quickly before moving into transport or platform decisions."
            items={WORKLOAD_PROFILE_CONTRASTS}
          />
        </div>

        <div className="post-hero-band pt-0">
          <QuickKnowledgeCheck check={WORKLOAD_MICRO_CHECK} moduleId="training-vs-inference" />
        </div>

        <div className="post-hero-band pt-0">
          <DecisionSimulator
            eyebrow="Workload Decision Simulator"
            title="Choose workload traits, then see the likely infrastructure consequence"
            intro="Adjust the traits until the active workload profile matches the behavior you need to explain."
            prompts={WORKLOAD_DECISION_PROMPTS}
            selectedValues={selectedValues}
            onChange={handleSimulatorChange}
            results={workloadResults}
            activeResult={activeResult}
            onSelectResult={setManualProfileId}
            interactionMode="guided"
            collapseSecondaryDetails
            resultSummaryTags={resultSummaryTags}
            reasonChange={
              <ProfileDeltaHint
                changedLabel={lastChangedPromptId ? PROMPT_LABELS[lastChangedPromptId] : undefined}
                changedValue={changedPromptValue}
                activeProfileTitle={activeProfile.title}
                explanation={
                  previousProfileId !== activeResult.id
                    ? `${profileChangeExplanation} The recommendation moved from ${WORKLOAD_PROFILES.find((profile) => profile.id === previousProfileId)?.title || 'the previous profile'} to ${activeProfile.title}.`
                    : `${profileChangeExplanation} The profile stayed on ${activeProfile.title}, which means this setting reinforces the current classification.`
                }
              />
            }
            renderResultHero={() => (
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <WorkloadProfileFingerprint values={selectedValues} />
                <div className="space-y-3">
                  <MiniPatternPreview patternId={activeResult.diagramMode} />
                  <button
                    type="button"
                    onClick={scrollToTrafficLab}
                    className="w-full rounded-lg border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-100 transition-colors hover:border-violet-500/40 hover:bg-violet-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
                  >
                    Open the full traffic pattern lab
                  </button>
                </div>
              </div>
            )}
          >
            <CompactDisclosure
              eyebrow="Nearby alternatives"
              title="Open the closest competing profiles"
              summary="Use this when you want to see the nearest boundary cases instead of treating the classifier like a black box."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {alternativeProfiles.map(({ profile, distance }) => {
                  const Icon =
                    ICON_MAP[profile.iconKey] ||
                    FALLBACK_ICONS[profile.iconKey as keyof typeof FALLBACK_ICONS] ||
                    Cpu;
                  return (
                    <button
                      key={profile.id}
                      onClick={() => setManualProfileId(profile.id)}
                      className="rounded-lg border border-white/5 bg-white/5 p-4 text-left transition-colors hover:border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-xl bg-white/5 p-2.5 text-slate-300">
                          <Icon size={18} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{profile.title}</div>
                          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                            {distance === 0 ? 'boundary match' : `${distance} trait difference${distance > 1 ? 's' : ''}`}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-400">{profile.summary}</p>
                    </button>
                  );
                })}
              </div>
            </CompactDisclosure>
          </DecisionSimulator>
        </div>

        <div ref={trafficLabRef} className="post-hero-band scroll-mt-28">
          <TrafficPatternLab activePatternId={activeResult.diagramMode} />
        </div>

        <div className="post-hero-band grid gap-6 pt-0 xl:grid-cols-2">
          <TelemetryWatchPanel
            title="Apply this profile with the right telemetry"
            eyebrow="Apply This"
            intro="Use the active profile to decide what should fail first in counters, not just in architecture language."
            items={activeResult.telemetry}
          />
          <RunbookLinksPanel
            title="Bridge from explanation to incident response"
            eyebrow="Apply This"
            intro="If this workload posture becomes an operational problem, start with the runbooks that match the active profile."
            items={activeResult.runbookLinks || []}
          />
        </div>

        <div className="post-hero-band pt-0">
          <InfrastructureImplicationsPanel
            title="What this classification changes next"
            eyebrow="Transfer"
            items={WORKLOAD_MODULE_IMPLICATIONS}
          />
        </div>

        <div className="post-hero-band grid gap-6 pt-0 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.16em] text-cyan-300">
              Explain It Back
            </div>
            <h3 className="mb-3 max-w-2xl text-2xl font-bold text-white">Use one sentence that survives after the page is closed</h3>
            <div className="rounded-lg border border-white/5 bg-[#0d1117] p-5 text-sm leading-relaxed text-slate-300">
              “First classify the workload behavior, then use that profile to predict the traffic pattern, first failure, and next design question before you talk about transports or platforms.”
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.16em] text-emerald-300">
              Transfer Prompt
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">Next decision</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              If the active profile feels right, the next move is to map where the pressure sits in the lifecycle and what traffic geometry that creates. The next step should usually be <span className="font-semibold text-white">Data Movement</span> or <span className="font-semibold text-white">Communication Patterns</span>, not platform selection.
            </p>
            <button
              onClick={() => toggleMastered('training-vs-inference')}
              className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 ${
                isMastered
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20'
              }`}
            >
              {isMastered ? 'Workload lens reviewed' : 'Mark workload lens reviewed'}
            </button>
          </div>
        </div>

        <div className="post-hero-band pt-0">
          <KnowledgeCheckCard check={WORKLOAD_CHECK} moduleId="training-vs-inference" />
        </div>

        <SoWhatCallout body="Do not ask whether the environment is 'training or inference' and stop there. Ask which workload profile is dominant, what failure signature matters most, and which telemetry proves the fabric posture is correct before you size anything." />
      </div>
    </section>
  );
};

export default TrainingVsInferenceSection;
