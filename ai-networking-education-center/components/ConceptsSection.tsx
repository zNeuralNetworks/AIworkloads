import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Cpu,
  Database,
  GitBranch,
  HardDrive,
  Layers,
  MessageSquare,
  Network,
  RotateCcw,
  Save,
  Server,
  Shuffle,
  TimerReset,
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import {
  DATA_MOVEMENT_DECISION_PROMPTS,
  DATA_MOVEMENT_DECISION_NOTES,
  DATA_MOVEMENT_MODULE_IMPLICATIONS,
  DATA_MOVEMENT_STAGES,
  ICON_MAP,
} from '../constants';
import type { ConceptData, DataMovementStage } from '../types';
import InfrastructureImplicationsPanel from './InfrastructureImplicationsPanel';
import SoWhatCallout from './SoWhatCallout';
import GlossaryTerm from './GlossaryTerm';
import SourceBadge from './SourceBadge';
import { claimText, hasSourceMetadata } from '../utils/sourceClaims';
import { CONCEPTS_SECTION_CONTENT } from '../content/concepts';
import DecisionSimulator from './DecisionSimulator';
import DepthPreferenceTabs from './DepthPreferenceTabs';
import ScenarioDecisionCards from './ScenarioDecisionCards';
import KnowledgeCheckCard from './KnowledgeCheckCard';
import RunbookLinksPanel from './RunbookLinksPanel';
import TelemetryWatchPanel from './TelemetryWatchPanel';
import { useLearning } from '../contexts/LearningContext';
import type {
  DecisionSimulatorResult,
  KnowledgeCheck,
  LearningScenario,
  RunbookReference,
} from '../types';

const FALLBACK_ICONS = {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpDown,
  Cpu,
  Database,
  GitBranch,
  HardDrive,
  Layers,
  MessageSquare,
  Network,
  RotateCcw,
  Save,
  Server,
  Shuffle,
  TimerReset,
};

function conceptById(concepts: ConceptData[], id: string): ConceptData | undefined {
  return concepts.find((concept) => concept.id === id);
}

function dependencyLabel(id: string): string {
  switch (id) {
    case 'rdma':
      return 'RDMA';
    case 'roce_intro':
      return 'RoCEv2';
    case 'nvme':
      return 'NVMe / NVMe-oF';
    default:
      return id;
  }
}

const DATA_MOVEMENT_SCENARIOS: LearningScenario[] = [
  {
    title: '32-node training cluster misses first batch',
    prompt:
      'The fabric looks healthy on steady-state counters, but the first batch arrives late and startup feels inconsistent across runs.',
    dominantSignal: 'Ingest and shuffle stages are destabilizing readiness before collectives even dominate',
    networkBehavior: 'Queue absorption, path balance, and startup redistribution matter more than generic transport claims',
    infrastructureDecision: 'Protect ingest and startup posture before tuning collective-phase transports',
  },
  {
    title: 'Checkpoint-heavy workflow degrades recovery time',
    prompt:
      'Job time is acceptable until save windows and restart events collide with storage and fabric pressure.',
    dominantSignal: 'Checkpoint and restore stages dominate operational risk',
    networkBehavior: 'Storage traffic becomes a first-class fabric event rather than a background subsystem',
    infrastructureDecision: 'Design for deterministic restart and checkpoint isolation, not just steady-state throughput',
  },
  {
    title: 'Customer says “we use RoCEv2 already”',
    prompt:
      'You need to explain why the protocol name alone does not answer whether the design is right for the workload.',
    dominantSignal: 'Lifecycle stage determines which primitive actually matters',
    networkBehavior: 'The same acronym implies different pressure points at ingest, shuffle, checkpoint, and restore',
    infrastructureDecision: 'Frame the conversation around stage-specific failure modes and telemetry, then discuss transports',
  },
];

const DATA_MOVEMENT_CHECK: KnowledgeCheck = {
  id: 'concepts-stage-check',
  prompt: 'A cluster only falls apart during checkpoint windows. Which explanation is the most useful first answer?',
  correctOptionId: 'checkpoint-stage',
  options: [
    {
      id: 'rdma-label',
      label: 'The main issue is probably that the environment uses the wrong acronym, so start by swapping RDMA or RoCE settings globally.',
      rationale:
        'Protocol labels alone are too coarse. The more useful first frame is which lifecycle stage is dominating pressure and what that implies for storage-fabric behavior.',
    },
    {
      id: 'checkpoint-stage',
      label: 'Checkpoint is acting as the dominant fabric event, so the real question is how writeback bursts and recovery posture interact with queueing and storage paths.',
      rationale:
        'Correct. Checkpoint-heavy failures should be framed as stage-specific architecture and congestion behavior, not just generic transport troubleshooting.',
    },
    {
      id: 'ignore-storage',
      label: 'Storage is secondary to the network here, so the right move is to focus only on east-west training counters.',
      rationale:
        'This misses the main lesson of the module: storage and restart paths are part of the fabric decision, not an isolated backend concern.',
    },
  ],
};

const DATA_MOVEMENT_RUNBOOKS: RunbookReference[] = [
  {
    id: 'incast-collapse',
    label: 'Throughput Collapse During Incast',
    context: 'Use this when shuffle, checkpoint, or fan-in stages collapse throughput at the receiver edge.',
  },
  {
    id: 'ecn-instability',
    label: 'ECN Mark Rate Instability',
    context: 'Use this when stage transitions consistently reach pause or tail-drop behavior before early feedback is visible.',
  },
  {
    id: 'pfc-storm',
    label: 'PFC Storm / Head-of-Line Blocking',
    context: 'Use this when burst containment fails and pause spreads beyond the stage that originally created pressure.',
  },
];

const STAGE_RUNBOOKS: Record<string, RunbookReference[]> = {
  ingest: [
    DATA_MOVEMENT_RUNBOOKS[1],
    DATA_MOVEMENT_RUNBOOKS[0],
  ],
  shuffle: [
    DATA_MOVEMENT_RUNBOOKS[0],
    DATA_MOVEMENT_RUNBOOKS[1],
  ],
  checkpoint: [
    DATA_MOVEMENT_RUNBOOKS[0],
    DATA_MOVEMENT_RUNBOOKS[2],
  ],
  restore: [
    DATA_MOVEMENT_RUNBOOKS[2],
    DATA_MOVEMENT_RUNBOOKS[0],
  ],
};

const ENVIRONMENT_MODIFIER_GUIDANCE: Record<
  string,
  { summary: string; whyItFits: string; plannerTrigger: string; misconception: string }
> = {
  'storage-coupled': {
    summary: 'Storage behavior is part of the fabric event, not a backend detail.',
    whyItFits: 'Prioritize storage-path isolation, queue boundaries, and deterministic write or read behavior before debating transport branding.',
    plannerTrigger: 'Move to the planner when storage isolation, tier count, or path separation becomes a quantitative implementation question.',
    misconception: 'Do not say “the network is fine, storage is separate.” If the stage pressure is storage-coupled, that is already a fabric architecture decision.',
  },
  'synchronized-training': {
    summary: 'Collective timing pressure sits immediately downstream of this stage.',
    whyItFits: 'Treat this stage as a rehearsal for the training fabric. Weak symmetry or weak early feedback here will reappear harder during collectives.',
    plannerTrigger: 'Move to the planner when rail count, plane count, or non-blocking assumptions are the remaining unknowns.',
    misconception: 'Do not isolate the stage from the collective phase. If training follows immediately, stage-local instability becomes job-time instability.',
  },
  'mixed-scientific': {
    summary: 'Multiple lifecycle modes share the same backend and compete for policy headroom.',
    whyItFits: 'Bias toward explicit boundaries, predictable transitions, and telemetry that differentiates one workflow mode from another.',
    plannerTrigger: 'Move to the planner when mixed-workflow segmentation or shared-tier capacity becomes the next design constraint.',
    misconception: 'Do not optimize for one clean benchmark path. Mixed scientific environments usually fail at transitions, not at the average case.',
  },
  'recovery-heavy': {
    summary: 'Restart quality matters nearly as much as steady-state job speed.',
    whyItFits: 'Optimize for bounded recovery time, checkpoint locality, and queue behavior under degraded conditions rather than only peak throughput.',
    plannerTrigger: 'Move to the planner when restart-domain sizing, storage fan-out, or failure-domain isolation becomes the real question.',
    misconception: 'Do not treat restart as a rare exception. In preemptible or failure-prone environments, recovery posture is core architecture.',
  },
};

const ConceptsSection: React.FC = () => {
  const { coreConcepts } = useData();
  const { selectedDepthPreference, setDepthPreference, markVisited, toggleMastered, masteredModules } = useLearning();
  const concepts = useMemo(() => coreConcepts || [], [coreConcepts]);
  const [selectedSimulatorValues, setSelectedSimulatorValues] = useState<Record<string, string>>({
    stageCondition: DATA_MOVEMENT_STAGES[0]?.id ?? 'ingest',
    environmentModifier: 'storage-coupled',
  });
  const [manualStageId, setManualStageId] = useState<string | null>(null);
  const [refreshersOpen, setRefreshersOpen] = useState(false);
  const [expandedRefreshers, setExpandedRefreshers] = useState<Set<string>>(new Set());

  useEffect(() => {
    markVisited('concepts');
  }, [markVisited]);

  const activeStage = useMemo(
    () =>
      DATA_MOVEMENT_STAGES.find(
        (stage) => stage.id === (manualStageId ?? selectedSimulatorValues.stageCondition)
      ) || DATA_MOVEMENT_STAGES[0],
    [manualStageId, selectedSimulatorValues.stageCondition]
  );

  const supportingPrimitiveIds = Array.from(new Set(DATA_MOVEMENT_STAGES.flatMap((stage) => stage.dependsOn)));
  const supportingPrimitives = supportingPrimitiveIds
    .map((id) => conceptById(concepts, id))
    .filter(Boolean) as ConceptData[];
  const showDesignPanels =
    selectedDepthPreference === 'design' || selectedDepthPreference === 'expert';
  const showExpertDepth = selectedDepthPreference === 'expert';
  const isMastered = masteredModules.includes('concepts');

  const dataMovementResults = useMemo<DecisionSimulatorResult[]>(() => {
    const modifier = ENVIRONMENT_MODIFIER_GUIDANCE[selectedSimulatorValues.environmentModifier];

    return DATA_MOVEMENT_STAGES.map((stage) => {
      const telemetry = stage.primarySignals.split(',').map((signal) => signal.trim()).filter(Boolean);
      return {
        id: stage.id,
        title: stage.title,
        summary: `${stage.summary} ${modifier.summary}`,
        recommendedPosture: stage.title,
        whyItFits: `${stage.designPosture} ${modifier.whyItFits}`,
        whatFailsFirst: stage.stressSignature,
        tradeoffs: [
          `Dominant flow: ${stage.dominantFlow}`,
          `Lifecycle sequence: ${stage.flowSteps.join(' -> ')}`,
          `Key primitive set: ${stage.dependsOn.map((dependency) => conceptById(concepts, dependency)?.title || dependencyLabel(dependency)).join(', ')}`,
        ],
        telemetry: telemetry.map((signal, index) => ({
          label: index === 0 ? 'Inspect first' : `Signal ${index + 1}`,
          signal,
          whyItMatters: `This signal tells you whether ${stage.title.toLowerCase()} is the real pressure stage before you generalize to protocol or platform conclusions.`,
        })),
        runbookLinks: STAGE_RUNBOOKS[stage.id] || DATA_MOVEMENT_RUNBOOKS,
        plannerTrigger: modifier.plannerTrigger,
        misconception: modifier.misconception,
        diagramMode: stage.id,
      };
    });
  }, [concepts, selectedSimulatorValues.environmentModifier]);

  const activeDataMovementResult =
    dataMovementResults.find((result) => result.id === activeStage.id) || dataMovementResults[0];

  const handleSimulatorChange = (promptId: string, optionId: string) => {
    setSelectedSimulatorValues((prev) => ({ ...prev, [promptId]: optionId }));
    if (promptId === 'stageCondition') {
      setManualStageId(null);
    }
  };

  const toggleRefresher = (id: string) => {
    setExpandedRefreshers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!activeStage) return null;

  return (
    <section id="concepts" className="border-t border-white/5 bg-[#0b1020] py-32">
      <div className="container mx-auto px-6">
        <div className="mb-20 flex flex-col items-center text-center">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-blue-500">
            Domain · Data Movement
          </div>
          <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">Data Movement</h2>
          <p className="max-w-4xl text-lg leading-relaxed text-slate-400">
            The useful question is not whether the environment uses{' '}
            <GlossaryTerm term="RDMA">RDMA</GlossaryTerm>,{' '}
            <GlossaryTerm term="RoCEv2">RoCEv2</GlossaryTerm>, or{' '}
            <GlossaryTerm term="NVMe-oF">NVMe-oF</GlossaryTerm>. The useful question is where
            the workflow is under pressure: ingest, shuffle, checkpoint, or restart. Those stages
            determine whether the dominant constraint is storage, congestion, queue isolation, or
            recovery time.
          </p>
        </div>

        <div className="mb-10">
          <DepthPreferenceTabs value={selectedDepthPreference} onChange={setDepthPreference} />
        </div>

        <div className="mb-12">
          <ScenarioDecisionCards
            title="Start with the stage that is creating the infrastructure pressure"
            intro="This module should teach a fast habit: do not start with RDMA, RoCEv2, or NVMe-oF in isolation. Start with the stage that is late, bursty, or operationally fragile, then trace the primitive that matters."
            scenarios={DATA_MOVEMENT_SCENARIOS}
          />
        </div>

        <div className="mb-12 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">
              Why This Matters
            </div>
            <h3 className="mb-4 text-2xl font-bold text-white">Most teams start in the wrong place</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              The mistake is treating data movement like a static protocol topic. In practice, the
              useful question is which stage is controlling job time, recovery time, or operational
              risk right now.
            </p>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              <div className="mb-1 font-semibold">What users usually get wrong</div>
              They say “we use RoCEv2” or “we need RDMA” and skip the harder question of whether
              ingest, shuffle, checkpoint, or restore is the actual design problem.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-400">
              Before / After Understanding
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                  Quick take
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  Data movement is a lifecycle problem. Different stages create different dominant
                  flows, failure signatures, and telemetry priorities.
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                  What you should leave with
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  You should be able to explain which stage matters, what fails first there, and
                  what infrastructure posture follows from that diagnosis.
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5 md:col-span-2">
                <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                  Depth guidance
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  Use <strong className="text-white">Quick take</strong> for plain-language orientation,
                  <strong className="text-white"> How it works</strong> for the lifecycle model,
                  <strong className="text-white"> Design implication</strong> for monitoring and architecture posture,
                  and <strong className="text-white">Expert depth</strong> when you need the protocol refreshers.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-blue-500">
            Lifecycle Stages
          </div>
          <h3 className="mb-8 text-2xl font-bold text-white">
            Keep the lifecycle visible, then drive it with the stage that matters
          </h3>
        </div>

        <div className="mb-20">
          <DecisionSimulator
            title="Choose the stage pressure, then see the infrastructure consequence"
            intro="This simulator keeps the lifecycle model visible while you change the stage and environment context. Use it to diagnose which phase is really creating the network question before you reach for protocol labels."
            prompts={DATA_MOVEMENT_DECISION_PROMPTS}
            selectedValues={selectedSimulatorValues}
            onChange={handleSimulatorChange}
            results={dataMovementResults}
            activeResult={activeDataMovementResult}
            onSelectResult={setManualStageId}
            renderVisual={(result) => (
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-blue-400">Stage learning canvas</div>
                  <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-mono uppercase tracking-[0.18em] text-blue-300">
                    {activeStage.subtitle}
                  </div>
                </div>
                <StageVisual
                  stage={DATA_MOVEMENT_STAGES.find((stage) => stage.id === result.id) || activeStage}
                />
              </div>
            )}
          >
            <div className="rounded-2xl border border-white/5 bg-[#111827] p-5">
              <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                Which primitives matter
              </div>
              <div className="flex flex-wrap gap-2">
                {activeStage.dependsOn.map((dependency) => (
                  <span
                    key={`${activeStage.id}-${dependency}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                  >
                    {conceptById(concepts, dependency)?.title || dependencyLabel(dependency)}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Use the stage to decide which transport or storage primitive matters. Do not start with the acronym and work backward.
              </p>
            </div>
          </DecisionSimulator>
        </div>

        {(showExpertDepth || refreshersOpen) && (
          <div className="mb-20 overflow-hidden rounded-2xl border border-white/5 bg-[#161b22]">
          <button
            onClick={() => setRefreshersOpen((prev) => !prev)}
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/3"
          >
            <div>
              <div className="mb-2 text-xs font-mono uppercase tracking-[0.28em] text-blue-500">
                Foundational Refreshers
              </div>
              <h3 className="text-2xl font-bold text-white">Protocol intuition when you need it</h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
                This material stays available, but secondary. Open it when you want the conceptual
                ramp for RDMA, RoCEv2, or NVMe before returning to the lifecycle view.
              </p>
            </div>
            <div className="shrink-0 text-slate-500">
              {refreshersOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </div>
          </button>

          {refreshersOpen && (
            <div className="space-y-4 border-t border-white/5 px-6 pb-6 pt-4">
              <div className="grid gap-4 lg:grid-cols-3">
                {supportingPrimitives.map((concept) => {
                  const isExpanded = expandedRefreshers.has(concept.id);
                  const Icon =
                    ICON_MAP[concept.iconKey] ||
                    FALLBACK_ICONS[concept.iconKey as keyof typeof FALLBACK_ICONS] ||
                    Cpu;

                  return (
                    <article
                      key={concept.id}
                      className="overflow-hidden rounded-2xl border border-white/5 bg-[#0d1117]"
                    >
                      <button
                        onClick={() => toggleRefresher(concept.id)}
                        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-white/3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
                            <Icon size={18} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white">{concept.title}</h4>
                            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-blue-500">
                              {concept.fullName}
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-slate-500">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="space-y-4 border-t border-white/5 px-5 pb-5 pt-3">
                          <p className="text-sm leading-relaxed text-slate-400">
                            {claimText(concept.description)}
                            {hasSourceMetadata(concept.description) && (
                              <SourceBadge claim={concept.description} className="ml-2 align-middle" />
                            )}
                          </p>

                          {concept.id === 'rdma' && <RdmaRefresher />}
                          {concept.id === 'roce_intro' && <RoceRefresher />}
                          {concept.id === 'nvme' && <NvmeRefresher concept={concept} />}

                          <ul className="space-y-3">
                            {concept.features.map((feature, index) => (
                              <li
                                key={`${concept.id}-${index}`}
                                className="flex items-start gap-3 text-slate-300"
                              >
                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-400" />
                                <span>
                                  {claimText(feature)}
                                  {hasSourceMetadata(feature) && (
                                    <SourceBadge claim={feature} className="ml-2 align-middle" />
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>
          )}
          </div>
        )}

        {showDesignPanels && (
          <div className="mb-20">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-blue-500">
            First Response
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {DATA_MOVEMENT_DECISION_NOTES.map((note) => {
              const Icon =
                ICON_MAP[note.iconKey] ||
                FALLBACK_ICONS[note.iconKey as keyof typeof FALLBACK_ICONS] ||
                Cpu;

              return (
                <div key={note.title} className="rounded-2xl border border-white/5 bg-[#161b22] p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
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
        )}

        <div className="mb-20">
          <InfrastructureImplicationsPanel items={DATA_MOVEMENT_MODULE_IMPLICATIONS} />
        </div>

        <div className="mb-20">
          <TelemetryWatchPanel
            title="Stage validation telemetry"
            intro="These watchpoints now follow the active simulator result so the stage diagnosis and telemetry posture stay connected."
            items={activeDataMovementResult.telemetry}
          />
        </div>

        <div className="mb-20">
          <RunbookLinksPanel
            title="If this becomes an incident, go here next"
            intro="These runbooks now follow the active stage diagnosis instead of staying generic."
            items={activeDataMovementResult.runbookLinks || DATA_MOVEMENT_RUNBOOKS}
          />
        </div>

        <div className="mb-20">
          <KnowledgeCheckCard check={DATA_MOVEMENT_CHECK} moduleId="concepts" />
        </div>

        <div className="mb-20 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-cyan-300">
              Explain It Back
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">End-of-module synthesis</h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-300">
              If you had to explain this to a customer in two sentences, you would say:
            </p>
            <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5 text-sm leading-relaxed text-slate-300">
              “The important design question is not just which protocol is present. It is which
              data-movement stage is dominating job time or recovery risk, and whether the fabric
              can handle that stage without turning checkpoint, shuffle, or restart into the real bottleneck.”
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-300">
              Self-check
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">What fails first if this is designed incorrectly?</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              Usually not the pristine steady-state benchmark. It is the stage transition: ingest readiness,
              shuffle imbalance, checkpoint collision, or restore delay.
            </p>
            <button
              onClick={() => toggleMastered('concepts')}
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

        <SoWhatCallout body="If you only say RDMA, RoCEv2, or NVMe-oF, you have not made an architecture decision yet. The real decision is which data-movement stage dominates job time, which failure mode matters most, and whether the fabric can survive checkpoint and restart behavior without turning every incident into a long recovery event." />
      </div>
    </section>
  );
};

const StageVisual: React.FC<{ stage: DataMovementStage }> = ({ stage }) => {
  const dependencies = stage.dependsOn.map(dependencyLabel);

  switch (stage.visualMode) {
    case 'ingest':
      return (
        <StageCanvas
          stage={stage}
          pressureLabel="Edge queues and ingest gateways saturate before the fabric looks busy."
          meaning="If first-batch readiness slips here, the cluster misses training time before collectives even start."
          telemetry={['Ingress queue depth', 'Gateway uplink load', 'First-batch delay', 'Loader idle time']}
          dependencies={dependencies}
        >
          <div className="grid gap-6 lg:grid-cols-[0.95fr_auto_1.2fr]">
            <div className="space-y-3">
              {['Object Store', 'Dataset Repository', 'Pipeline Feed'].map((label, index) => (
                <InstructionNode
                  key={label}
                  step={index + 1}
                  eyebrow="External source"
                  title={label}
                  tone="source"
                  detail={
                    index === 0
                      ? 'Bulk dataset read'
                      : index === 1
                        ? 'Shard lookup + fetch'
                        : 'Streaming feature feed'
                  }
                />
              ))}
            </div>

            <div className="hidden items-center justify-center lg:flex">
              <FlowArrow label="North-south ingest" tone="cyan" />
            </div>

            <div className="space-y-4">
              <InstructionNode
                step={2}
                eyebrow="Fabric / ingress tier"
                title="Cluster Ingress Tier"
                tone="fabric"
                detail="Absorb bursts, stage reads, protect first-batch readiness."
              />
              <HotspotCallout
                title="Pressure zone"
                detail="Queue growth and storage uplink oversubscription appear here first, well before collective traffic dominates."
                tone="amber"
              />
              <InstructionNode
                step={3}
                eyebrow="Compute handoff"
                title="Loaders / Worker Staging"
                tone="compute"
                detail="Workers only start well if the ingress tier lands and stages data on schedule."
              />
            </div>
          </div>
        </StageCanvas>
      );
    case 'shuffle':
      return (
        <StageCanvas
          stage={stage}
          pressureLabel="Path imbalance, incast, and skew emerge as workers redistribute shards laterally."
          meaning="Shuffle is the first rehearsal for congestion posture: weak symmetry or queue policy here will show up again during collectives."
          telemetry={['Leaf queue growth', 'ECN mark volatility', 'Startup latency', 'Application slowdown']}
          dependencies={dependencies}
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {['Shard Group A', 'Shard Group B', 'Shard Group C'].map((label, index) => (
                <InstructionNode
                  key={label}
                  step={1}
                  eyebrow="Initial placement"
                  title={label}
                  tone="compute"
                  detail={
                    index === 1 ? 'Skewed ownership drives heavier redistribution.' : 'Local batches need rebalance.'
                  }
                />
              ))}
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-blue-500/15 bg-[#09111a] p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_65%)]" />
              <div className="relative grid gap-4 md:grid-cols-[1fr_auto_1fr]">
                <div className="space-y-3">
                  {['Worker Pod 1', 'Worker Pod 2'].map((label) => (
                    <InstructionNode
                      key={label}
                      step={2}
                      eyebrow="East-west redistribution"
                      title={label}
                      tone="compute"
                      detail="Export shards to peers."
                    />
                  ))}
                </div>

                <div className="flex items-center justify-center">
                  <div className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs font-mono uppercase tracking-[0.18em] text-amber-300">
                    hot paths cross here
                  </div>
                </div>

                <div className="space-y-3">
                  {['Worker Pod 3', 'Worker Pod 4'].map((label) => (
                    <InstructionNode
                      key={label}
                      step={3}
                      eyebrow="Balanced batches"
                      title={label}
                      tone="compute"
                      detail="Receive redistributed shards."
                    />
                  ))}
                </div>
              </div>
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-80"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path d="M16 28 C34 18, 44 18, 50 50" stroke="#22d3ee" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
                <path d="M16 68 C34 76, 44 76, 50 50" stroke="#22d3ee" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
                <path d="M84 28 C66 18, 56 18, 50 50" stroke="#f59e0b" strokeWidth="1.8" fill="none" strokeDasharray="4 4" />
                <path d="M84 68 C66 76, 56 76, 50 50" stroke="#f59e0b" strokeWidth="1.8" fill="none" strokeDasharray="4 4" />
              </svg>
            </div>
          </div>
        </StageCanvas>
      );
    case 'checkpoint':
      return (
        <StageCanvas
          stage={stage}
          pressureLabel="Checkpoint windows concentrate write pressure and can collide directly with active job traffic."
          meaning="A durable save is not a storage footnote. It is a timed fabric event that can dominate job completion time if left unisolated."
          telemetry={['Checkpoint duration', 'Target saturation', 'HOL blocking', 'Accelerator idle time']}
          dependencies={dependencies}
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_auto_1.15fr]">
            <div className="space-y-3">
              {['Worker 1', 'Worker 2', 'Worker 3', 'Worker 4'].map((label) => (
                <InstructionNode
                  key={label}
                  step={1}
                  eyebrow="Training state"
                  title={label}
                  tone="compute"
                  detail="Drain model + optimizer state."
                />
              ))}
            </div>

            <div className="hidden items-center justify-center lg:flex">
              <FlowArrow label="Burst writes aggregate" tone="amber" />
            </div>

            <div className="space-y-4">
              <InstructionNode
                step={2}
                eyebrow="Aggregation point"
                title="Storage / Checkpoint Tier"
                tone="storage"
                detail="Shared fabric + storage targets absorb periodic save bursts."
              />
              <HotspotCallout
                title="Collision zone"
                detail="Checkpoint traffic competes with active collectives and exposes storage-fabric coupling immediately."
                tone="amber"
              />
              <InstructionNode
                step={3}
                eyebrow="Durable landing"
                title="Protected state on target"
                tone="storage"
                detail="Write must complete predictably, not just eventually."
              />
            </div>
          </div>
        </StageCanvas>
      );
    case 'restore':
      return (
        <StageCanvas
          stage={stage}
          pressureLabel="Restart storms create synchronized read demand against a small number of checkpoint targets."
          meaning="Recovery quality is an architecture metric: weak locality or hidden bottlenecks turn every failure into a long rehydration event."
          telemetry={['Time-to-first-batch', 'Read skew', 'Recovery queue depth', 'Restart success rate']}
          dependencies={dependencies}
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_auto_1fr]">
            <div className="space-y-4">
              <InstructionNode
                step={1}
                eyebrow="Checkpoint source"
                title="Checkpoint Targets"
                tone="storage"
                detail="Shared targets must serve many workers at once."
              />
              <HotspotCallout
                title="Recovery bottleneck"
                detail="Hot spots and uneven storage locality appear here first because restart demand is synchronized."
                tone="amber"
              />
            </div>

            <div className="hidden items-center justify-center lg:flex">
              <FlowArrow label="Fan-out restart path" tone="violet" />
            </div>

            <div className="space-y-3">
              {['Recovering Worker 1', 'Recovering Worker 2', 'Recovering Worker 3', 'Recovering Worker 4'].map(
                (label, index) => (
                  <InstructionNode
                    key={label}
                    step={index === 0 ? 3 : undefined}
                    eyebrow="Rehydration"
                    title={label}
                    tone="compute"
                    detail={
                      index === 0
                        ? 'Resume with deterministic first-batch timing.'
                        : 'Competes for the same restart path.'
                    }
                  />
                )
              )}
            </div>
          </div>
        </StageCanvas>
      );
    default:
      return null;
  }
};

const StageCanvas: React.FC<{
  stage: DataMovementStage;
  pressureLabel: string;
  meaning: string;
  telemetry: string[];
  dependencies: string[];
  children: React.ReactNode;
}> = ({ stage, pressureLabel, meaning, telemetry, dependencies, children }) => (
  <div className="space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="mb-2 text-xs font-mono uppercase tracking-[0.18em] text-blue-500">
          What to notice in this stage
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-300">{stage.notice}</p>
      </div>
      <StageLegend />
    </div>

    <div className="rounded-2xl border border-white/5 bg-[#0b1220] p-5 md:p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        {stage.flowSteps.map((step, index) => (
          <span
            key={`${stage.id}-${step}`}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-300"
          >
            {index + 1}. {step}
          </span>
        ))}
      </div>

      {children}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <HotspotCallout title="Where pressure builds" detail={pressureLabel} tone="amber" />
        <HotspotCallout title="Why this matters" detail={meaning} tone="cyan" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
          <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
            Telemetry ribbon
          </div>
          <TelemetryRibbon signals={telemetry.join(', ')} />
        </div>
        <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
          <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
            Which primitives matter
          </div>
          <div className="flex flex-wrap gap-2">
            {dependencies.map((dependency) => (
              <span
                key={`${stage.id}-${dependency}`}
                className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-200"
              >
                {dependency}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const StageLegend: React.FC = () => (
  <div className="rounded-xl border border-white/5 bg-[#111827] px-4 py-3">
    <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">Legend</div>
    <div className="flex flex-wrap gap-3 text-xs text-slate-300">
      <LegendItem tone="source" label="Source" />
      <LegendItem tone="fabric" label="Fabric / ingress" />
      <LegendItem tone="compute" label="Worker / compute" />
      <LegendItem tone="storage" label="Storage target" />
      <LegendItem tone="hotspot" label="Pressure zone" />
    </div>
  </div>
);

const LegendItem: React.FC<{
  tone: 'source' | 'fabric' | 'compute' | 'storage' | 'hotspot';
  label: string;
}> = ({ tone, label }) => {
  const toneClass = {
    source: 'bg-slate-500',
    fabric: 'bg-blue-400',
    compute: 'bg-emerald-400',
    storage: 'bg-violet-400',
    hotspot: 'bg-amber-400',
  }[tone];

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${toneClass}`} />
      {label}
    </span>
  );
};

const InstructionNode: React.FC<{
  eyebrow: string;
  title: string;
  detail: string;
  tone: 'source' | 'fabric' | 'compute' | 'storage';
  step?: number;
}> = ({ eyebrow, title, detail, tone, step }) => {
  const toneClasses = {
    source: 'border-slate-700/70 bg-[#111827]',
    fabric: 'border-blue-500/20 bg-blue-500/10',
    compute: 'border-emerald-500/20 bg-emerald-500/10',
    storage: 'border-violet-500/20 bg-violet-500/10',
  }[tone];

  const eyebrowClasses = {
    source: 'text-slate-500',
    fabric: 'text-blue-300',
    compute: 'text-emerald-300',
    storage: 'text-violet-300',
  }[tone];

  return (
    <div className={`rounded-xl border p-4 ${toneClasses}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className={`text-[11px] font-mono uppercase tracking-[0.18em] ${eyebrowClasses}`}>
          {eyebrow}
        </div>
        {step ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-300">
            Step {step}
          </span>
        ) : null}
      </div>
      <div className="mb-1 text-sm font-semibold text-white">{title}</div>
      <div className="text-sm leading-relaxed text-slate-300">{detail}</div>
    </div>
  );
};

const HotspotCallout: React.FC<{ title: string; detail: string; tone: 'amber' | 'cyan' }> = ({
  title,
  detail,
  tone,
}) => (
  <div
    className={`rounded-xl border p-4 ${
      tone === 'amber' ? 'border-amber-500/20 bg-amber-500/10' : 'border-blue-500/20 bg-blue-500/10'
    }`}
  >
    <div
      className={`mb-2 text-[11px] font-mono uppercase tracking-[0.18em] ${
        tone === 'amber' ? 'text-amber-300' : 'text-blue-300'
      }`}
    >
      {title}
    </div>
    <p className="text-sm leading-relaxed text-slate-200">{detail}</p>
  </div>
);

const FlowArrow: React.FC<{ label: string; tone: 'cyan' | 'amber' | 'violet' }> = ({ label, tone }) => {
  const toneClass = {
    cyan: 'text-blue-400',
    amber: 'text-amber-300',
    violet: 'text-violet-300',
  }[tone];

  return (
    <div className="flex flex-col items-center gap-3">
      <span className={`text-xs font-mono uppercase tracking-[0.18em] ${toneClass}`}>{label}</span>
      <ArrowRight className={toneClass} size={20} />
      <ArrowRight className={toneClass} size={20} />
      <ArrowRight className={toneClass} size={20} />
    </div>
  );
};

const TelemetryRibbon: React.FC<{ signals: string }> = ({ signals }) => (
  <div className="flex flex-wrap gap-2">
    {signals
      .split(',')
      .map((signal) => signal.trim())
      .filter(Boolean)
      .map((signal) => (
        <span
          key={signal}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
        >
          {signal}
        </span>
      ))}
  </div>
);

const RdmaRefresher: React.FC = () => (
  <div
    className="rounded-xl border border-slate-800 bg-[#111827] p-5"
    role="img"
    aria-label={CONCEPTS_SECTION_CONTENT.rdmaVisualization.ariaLabel}
  >
    <div className="mb-2 flex justify-between text-xs font-mono text-slate-500">
      <span>{CONCEPTS_SECTION_CONTENT.rdmaVisualization.sourceLabel}</span>
      <span>{CONCEPTS_SECTION_CONTENT.rdmaVisualization.destinationLabel}</span>
    </div>
    <div className="relative flex h-20 items-center justify-between">
      <div className="z-10 flex h-full w-16 flex-col items-center justify-center rounded border border-slate-700 bg-slate-800">
        <div className="mb-1 h-1 w-12 bg-slate-600" />
        <div className="mb-1 h-1 w-12 bg-slate-600" />
        <div className="h-1 w-12 bg-slate-600" />
      </div>
      <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-slate-800" />
      <div className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-[moveLeftRight_2s_ease-in-out_infinite]" />
      <div className="z-10 flex h-full w-16 flex-col items-center justify-center rounded border border-slate-700 bg-slate-800">
        <div className="mb-1 h-1 w-12 bg-slate-600" />
        <div className="mb-1 h-1 w-12 bg-slate-600" />
        <div className="h-1 w-12 bg-slate-600" />
      </div>
    </div>
    <div className="mt-3 text-center text-xs font-semibold text-green-400">
      {claimText(CONCEPTS_SECTION_CONTENT.rdmaVisualization.bypassCaption)}
      {hasSourceMetadata(CONCEPTS_SECTION_CONTENT.rdmaVisualization.bypassCaption) && (
        <SourceBadge claim={CONCEPTS_SECTION_CONTENT.rdmaVisualization.bypassCaption} className="ml-2" />
      )}
    </div>
  </div>
);

const RoceRefresher: React.FC = () => (
  <div
    className="rounded-xl border border-slate-800 bg-[#111827] p-5"
    role="img"
    aria-label="Diagram showing RoCEv2 as the bridge layer between RDMA and Ethernet."
  >
    <div className="mb-4 text-center text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
      Protocol Stack
    </div>
    <div className="space-y-2">
      <div className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-900/20 p-3">
        <Cpu size={16} className="shrink-0 text-blue-400" />
        <span className="text-sm font-semibold text-blue-300">RDMA Verbs</span>
        <span className="ml-auto text-xs text-slate-500">Application layer</span>
      </div>
      <div className="flex justify-center">
        <ArrowRight size={14} className="rotate-90 text-slate-600" />
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-emerald-500/40 bg-emerald-900/20 p-3">
        <Network size={16} className="shrink-0 text-emerald-400" />
        <span className="text-sm font-semibold text-emerald-300">RoCEv2 / UDP / IP</span>
        <span className="ml-auto text-xs text-slate-500">Transport layer</span>
      </div>
      <div className="flex justify-center">
        <ArrowRight size={14} className="rotate-90 text-slate-600" />
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/60 p-3">
        <Layers size={16} className="shrink-0 text-slate-400" />
        <span className="text-sm font-semibold text-slate-300">Lossless Ethernet Fabric</span>
        <span className="ml-auto text-xs text-slate-500">Physical layer</span>
      </div>
    </div>
    <div className="mt-4 border-t border-slate-800/50 pt-4 text-center text-xs text-slate-400">
      Lossless behavior (PFC + ECN) required at the Ethernet layer
    </div>
  </div>
);

const NvmeRefresher: React.FC<{ concept: ConceptData }> = ({ concept }) => (
  <div className="grid gap-5">
    <div className="rounded-xl border border-violet-500/20 bg-violet-900/10 p-5">
      <h4 className="mb-3 flex items-center gap-2 font-bold text-violet-300">
        <Network size={18} /> {CONCEPTS_SECTION_CONTENT.nvmeExpansion.title} (
        <GlossaryTerm term="NVMe-oF">NVMe-oF</GlossaryTerm>)
      </h4>
      <div className="space-y-4 text-sm text-slate-300">
        <p>
          <span className="font-medium text-white">{CONCEPTS_SECTION_CONTENT.nvmeExpansion.goalLabel}</span>{' '}
          {claimText(CONCEPTS_SECTION_CONTENT.nvmeExpansion.goalBody)}
          {hasSourceMetadata(CONCEPTS_SECTION_CONTENT.nvmeExpansion.goalBody) && (
            <SourceBadge claim={CONCEPTS_SECTION_CONTENT.nvmeExpansion.goalBody} className="ml-2" />
          )}
        </p>
        <p>
          <span className="font-medium text-white">{CONCEPTS_SECTION_CONTENT.nvmeExpansion.mechanismLabel}</span>{' '}
          {CONCEPTS_SECTION_CONTENT.nvmeExpansion.mechanismBodyPrefix}{' '}
          <span className="text-violet-200">FibreChannel</span>,{' '}
          <GlossaryTerm term="RoCEv2">
            <span className="text-violet-200">RoCE</span>
          </GlossaryTerm>
          , {CONCEPTS_SECTION_CONTENT.nvmeExpansion.mechanismBodySuffix}{' '}
          <span className="text-violet-200">TCP/IP</span>.
        </p>
        <div className="flex items-center gap-2 rounded border border-violet-500/10 bg-slate-950/50 p-2 text-xs">
          <Layers size={14} className="shrink-0 text-violet-400" />
          <span>{claimText(CONCEPTS_SECTION_CONTENT.nvmeExpansion.abstractionNote)}</span>
          {hasSourceMetadata(CONCEPTS_SECTION_CONTENT.nvmeExpansion.abstractionNote) && (
            <SourceBadge claim={CONCEPTS_SECTION_CONTENT.nvmeExpansion.abstractionNote} />
          )}
        </div>
      </div>
    </div>

    <div
      className="rounded-xl border border-slate-800 bg-[#111827] p-5"
      role="list"
      aria-label={CONCEPTS_SECTION_CONTENT.packetFlow.ariaLabel}
    >
      <h4 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
        <ArrowLeftRight size={16} className="text-violet-400" />
        {CONCEPTS_SECTION_CONTENT.packetFlow.title}
      </h4>
      <div className="relative space-y-6 border-l border-slate-800 pl-6">
        <div className="relative" role="listitem">
          <div className="absolute -left-[31px] h-4 w-4 rounded-full border-2 border-violet-500/50 bg-slate-800" />
          <div className="flex items-start gap-3">
            <div className="mt-1 text-violet-400">
              <Server size={14} aria-hidden="true" />
            </div>
            <div>
              <div className="mb-1 text-xs font-bold text-violet-300">
                HOST <span className="mx-1 text-slate-500">→</span> CONTROLLER
              </div>
              <div className="text-sm font-medium text-white">
                {CONCEPTS_SECTION_CONTENT.packetFlow.connectionRequestTitle}
              </div>
              <div className="text-xs text-slate-500">
                {claimText(CONCEPTS_SECTION_CONTENT.packetFlow.connectionRequestBody)}
                {hasSourceMetadata(CONCEPTS_SECTION_CONTENT.packetFlow.connectionRequestBody) && (
                  <SourceBadge
                    claim={CONCEPTS_SECTION_CONTENT.packetFlow.connectionRequestBody}
                    className="ml-2"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="relative" role="listitem">
          <div className="absolute -left-[31px] h-4 w-4 rounded-full border-2 border-violet-500/50 bg-slate-800" />
          <div className="flex items-start gap-3">
            <div className="mt-1 text-violet-400">
              <Database size={14} aria-hidden="true" />
            </div>
            <div>
              <div className="mb-1 text-xs font-bold text-violet-300">
                CONTROLLER <span className="mx-1 text-slate-500">→</span> HOST
              </div>
              <div className="text-sm font-medium text-white">
                {CONCEPTS_SECTION_CONTENT.packetFlow.connectionResponseTitle}
              </div>
              <div className="text-xs text-slate-500">
                {claimText(CONCEPTS_SECTION_CONTENT.packetFlow.connectionResponseBody)}
                {hasSourceMetadata(CONCEPTS_SECTION_CONTENT.packetFlow.connectionResponseBody) && (
                  <SourceBadge
                    claim={CONCEPTS_SECTION_CONTENT.packetFlow.connectionResponseBody}
                    className="ml-2"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="relative" role="listitem">
          <div className="absolute -left-[31px] h-4 w-4 rounded-full border-2 border-violet-500/50 bg-slate-800" />
          <div className="flex items-start gap-3">
            <div className="mt-1 text-violet-400">
              <MessageSquare size={14} aria-hidden="true" />
            </div>
            <div>
              <div className="mb-1 text-xs font-bold text-violet-300">
                {CONCEPTS_SECTION_CONTENT.packetFlow.exchangePduLabel}
              </div>
              <div className="text-sm font-medium text-white">
                {CONCEPTS_SECTION_CONTENT.packetFlow.initConfirmTitle}
              </div>
              <div className="text-xs text-slate-500">
                {claimText(CONCEPTS_SECTION_CONTENT.packetFlow.initConfirmBody)}
                {hasSourceMetadata(CONCEPTS_SECTION_CONTENT.packetFlow.initConfirmBody) && (
                  <SourceBadge claim={CONCEPTS_SECTION_CONTENT.packetFlow.initConfirmBody} className="ml-2" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-lg border border-violet-500/10 bg-violet-900/10 p-4 text-sm text-slate-300">
        {CONCEPTS_SECTION_CONTENT.packetFlow.transparencyPrefix}{' '}
        <strong>{CONCEPTS_SECTION_CONTENT.packetFlow.transparentWord}</strong>{' '}
        {claimText(CONCEPTS_SECTION_CONTENT.packetFlow.transparencySuffix)}
        {hasSourceMetadata(CONCEPTS_SECTION_CONTENT.packetFlow.transparencySuffix) && (
          <SourceBadge claim={CONCEPTS_SECTION_CONTENT.packetFlow.transparencySuffix} className="ml-2" />
        )}
      </div>
      <div className="mt-4 text-xs text-slate-500">
        Refresher for {concept.title}: useful when storage-fabric coupling or restart behavior
        becomes the main architecture question.
      </div>
    </div>
  </div>
);

export default ConceptsSection;
