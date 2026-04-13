import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import {
  ARCHITECTURE_DECISION_PROMPTS,
  ARCHITECTURE_MODULE_IMPLICATIONS,
  ARCHITECTURE_PATTERN_REFERENCES,
  PLANNER_HANDOFF_LABEL,
  PLANNER_HANDOFF_STANDARD_TEXT,
} from '../constants';
import DecisionSimulator from './DecisionSimulator';
import InfrastructureImplicationsPanel from './InfrastructureImplicationsPanel';
import type { DecisionSimulatorResult, RunbookReference, TelemetryWatchpoint } from '../types';
import TelemetryWatchPanel from './TelemetryWatchPanel';
import { useLearning } from '../contexts/LearningContext';
import TopologyWalkthrough, { type TopologyWalkthroughItem } from './TopologyWalkthrough';
import CompactDisclosure from './CompactDisclosure';

const ARCHITECTURE_LEARNING_SEQUENCE = [
  {
    step: '1',
    title: 'Carry forward the workload diagnosis',
    detail: 'Architecture is downstream of workload shape, lifecycle pressure, and traffic geometry.',
  },
  {
    step: '2',
    title: 'Choose the posture',
    detail: 'Decide whether the fabric must optimize for strict collective symmetry, mixed-stage isolation, or modular growth.',
  },
  {
    step: '3',
    title: 'Validate what fails first',
    detail: 'A good pattern predicts the earliest architectural failure before it predicts a benchmark number.',
  },
  {
    step: '4',
    title: 'Hand off only when the posture is clear',
    detail: 'Quantitative planning belongs after the pattern is defensible.',
  },
];

function architectureTraitsForProfile(profileId?: string): Record<string, string> {
  switch (profileId) {
    case 'pretraining':
      return { synchronization: 'barrier', storageCoupling: 'low', scaleCertainty: 'fixed', tailSensitivity: 'strict' };
    case 'finetuning':
    case 'scientific-hpc':
      return { synchronization: 'mixed', storageCoupling: 'high', scaleCertainty: 'fixed', tailSensitivity: 'strict' };
    case 'batch-inference':
      return { synchronization: 'uncertain', storageCoupling: 'low', scaleCertainty: 'growing', tailSensitivity: 'moderate' };
    case 'realtime-inference':
      return { synchronization: 'mixed', storageCoupling: 'low', scaleCertainty: 'fixed', tailSensitivity: 'strict' };
    default:
      return { synchronization: 'barrier', storageCoupling: 'low', scaleCertainty: 'fixed', tailSensitivity: 'strict' };
  }
}

const ArchitectureSection: React.FC = () => {
  useData();
  const { activeWorkloadProfile, activeDataMovementStage, activeTrafficPattern } = useLearning();
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string>>(
    architectureTraitsForProfile(activeWorkloadProfile)
  );
  const [manualPatternId, setManualPatternId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTraits((prev) => {
      const next = architectureTraitsForProfile(activeWorkloadProfile);
      const changed = Object.keys(next).some((key) => prev[key] !== next[key]);
      return changed ? next : prev;
    });
  }, [activeWorkloadProfile]);

  const computedPatternId = useMemo(() => {
    if (selectedTraits.scaleCertainty === 'growing' || selectedTraits.synchronization === 'uncertain') {
      return 'modular-pod-expansion-fabric';
    }
    if (selectedTraits.storageCoupling === 'high' || selectedTraits.synchronization === 'mixed') {
      return 'burst-tolerant-mixed-fabric';
    }
    return 'deterministic-collective-fabric';
  }, [selectedTraits]);

  const architectureResults = useMemo<DecisionSimulatorResult[]>(() => {
    const runbookMap: Record<string, RunbookReference[]> = {
      'deterministic-collective-fabric': [
        { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce', context: 'Use this when one rail or path is stretching synchronized collective completion.' },
        { id: 'ecn-instability', label: 'ECN Mark Rate Instability', context: 'Use this when early congestion feedback is not arriving before pause or queue spread.' },
      ],
      'burst-tolerant-mixed-fabric': [
        { id: 'incast-collapse', label: 'Throughput Collapse During Incast', context: 'Use this when checkpoint, shuffle, or convergent phases collapse receiver throughput.' },
        { id: 'ecn-instability', label: 'ECN Mark Rate Instability', context: 'Use this when mixed-stage burst pressure outruns the feedback loop.' },
      ],
      'modular-pod-expansion-fabric': [
        { id: 'allreduce-tail-latency', label: 'High Tail Latency During All-Reduce', context: 'Use this when expansion boundaries create new hot paths or straggler rails.' },
        { id: 'incast-collapse', label: 'Throughput Collapse During Incast', context: 'Use this when pod boundaries or receivers become convergent bottlenecks as scale grows.' },
      ],
    };

    return ARCHITECTURE_PATTERN_REFERENCES.map((pattern) => ({
      id: pattern.id,
      title: pattern.title,
      summary: pattern.bestFitWorkload,
      recommendedPosture: pattern.title,
      whyItFits: pattern.topologyPosture,
      whatFailsFirst:
        pattern.id === 'deterministic-collective-fabric'
          ? 'The first visible failure is usually straggler amplification from rail imbalance, late ECN response, or a degraded path under synchronized load.'
          : pattern.id === 'burst-tolerant-mixed-fabric'
            ? 'The first failure is usually a lifecycle transition, especially checkpoint or shuffle, where storage-coupled pressure collides with job-critical traffic.'
            : 'The first failure is usually asymmetric growth: one pod boundary, plane, or expansion edge starts carrying more coordination pain than the rest.',
      tradeoffs: pattern.tradeoffs,
      telemetry: pattern.telemetryWatchpoints.map((item) => ({
        label: item,
        signal: item,
        whyItMatters: 'Use these signals to validate the active topology posture rather than describing it abstractly.',
      })) as TelemetryWatchpoint[],
      runbookLinks: runbookMap[pattern.id],
      plannerTrigger: pattern.plannerTrigger,
      misconception: pattern.migrationConstraints,
      diagramMode: pattern.id,
    }));
  }, []);

  const walkthroughItems = useMemo<TopologyWalkthroughItem[]>(
    () => [
      {
        id: 'deterministic-collective-fabric',
        title: 'Deterministic collective fabric',
        subtitle: 'Strict tail control',
        fit: 'Best when synchronized collectives dominate and one slow rail can stretch the whole step.',
        posture: 'Balanced rails, non-blocking Clos, and disciplined congestion behavior.',
        inspect: 'Rail spread, collective tail, ECN before pause.',
        visualTone: 'blue',
        failureModes: [
          { id: 'rail-imbalance', label: 'Rail imbalance', detail: 'One path or rail becomes the straggler and synchronized workers inherit the slowest completion time.' },
          { id: 'late-feedback', label: 'Late feedback', detail: 'ECN arrives too late, PFC becomes visible, and the architecture loses deterministic tail behavior.' },
        ],
      },
      {
        id: 'burst-tolerant-mixed-fabric',
        title: 'Burst-tolerant mixed workflow fabric',
        subtitle: 'Stage isolation',
        fit: 'Best when checkpoint, shuffle, restore, and training share the same backend and transitions matter as much as steady state.',
        posture: 'Separate or isolate storage-coupled pressure so lifecycle transitions do not poison collective traffic.',
        inspect: 'Checkpoint duration, first-batch delay, storage uplink pressure.',
        visualTone: 'violet',
        failureModes: [
          { id: 'checkpoint-collision', label: 'Checkpoint collision', detail: 'Storage-coupled bursts collide with job-critical traffic and recovery windows become the real bottleneck.' },
          { id: 'shuffle-spread', label: 'Shuffle spread', detail: 'Burst containment fails during redistribution and the mixed environment looks healthy until transitions hit.' },
        ],
      },
      {
        id: 'modular-pod-expansion-fabric',
        title: 'Modular pod expansion fabric',
        subtitle: 'Growth discipline',
        fit: 'Best when workload posture is known but final scale, budget, or expansion sequence is still moving.',
        posture: 'Treat growth boundaries as part of the initial architecture, not an afterthought.',
        inspect: 'Inter-pod utilization, boundary hotspots, drift after pod additions.',
        visualTone: 'emerald',
        failureModes: [
          { id: 'boundary-hotspot', label: 'Boundary hotspot', detail: 'Expansion edges start carrying disproportionate coordination pressure and create asymmetric tail growth.' },
          { id: 'underplanned-growth', label: 'Underplanned growth', detail: 'The first pod is treated like the final architecture, so later scale changes create avoidable redesign pain.' },
        ],
      },
    ],
    []
  );

  const activeArchitectureResult =
    architectureResults.find((item) => item.id === (manualPatternId ?? computedPatternId)) || architectureResults[0];

  const handleTraitChange = (promptId: string, optionId: string) => {
    setSelectedTraits((prev) => ({ ...prev, [promptId]: optionId }));
    setManualPatternId(null);
  };

  return (
    <section id="etherlink" className="border-t border-white/5 bg-[#0F1117] py-32">
      <div className="container mx-auto px-6">
        <div className="mb-20">
          <div className="mb-4 font-mono text-xs uppercase tracking-widest text-blue-500">Domain · Architecture Patterns</div>
          <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">Architecture Patterns</h2>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
            Architecture is where the earlier mental models cash out. By this point you should already know the workload shape, the dominant pressure stage, and the traffic geometry that the fabric has to survive.
          </p>
        </div>

        <div className="mb-12 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">Why This Matters</div>
            <h3 className="mb-3 text-2xl font-bold text-white">Start with the visible posture</h3>
            <p className="text-sm leading-relaxed text-slate-300">
              Pick the topology that fits the workload behavior first. Open the reasoning only if you need the full chain.
            </p>
          </div>

          <CompactDisclosure
            eyebrow="Show reasoning"
            title="Open the architecture learning sequence"
            summary="Architecture is downstream of workload, stage, and traffic geometry."
          >
            <div className="grid gap-4 md:grid-cols-2">
              {ARCHITECTURE_LEARNING_SEQUENCE.map((item) => (
                <div key={item.step} className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-mono text-blue-300">
                      Step {item.step}
                    </div>
                    <div className="text-sm font-semibold text-white">{item.title}</div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </CompactDisclosure>
        </div>

        {(activeWorkloadProfile || activeDataMovementStage || activeTrafficPattern) && (
          <div className="mb-12 rounded-2xl border border-blue-500/15 bg-blue-500/10 p-4 text-sm text-blue-100">
            This module is using the current learning context from earlier steps:
            {activeWorkloadProfile ? ` workload profile = ${activeWorkloadProfile};` : ''}
            {activeDataMovementStage ? ` dominant stage = ${activeDataMovementStage};` : ''}
            {activeTrafficPattern ? ` traffic pattern = ${activeTrafficPattern}.` : ''}
            {' '}Use the walkthrough and simulator to confirm or override the suggested architecture posture.
          </div>
        )}

        <div className="mb-24">
          <TopologyWalkthrough
            title="Walk the topology choices from workload to failure mode"
            intro="Instead of memorizing patterns, use this walkthrough to map workload fit, topology posture, and the first visible architectural failure."
            summary="Choose the pattern that fits the workload, then inspect what fails first."
            items={walkthroughItems}
            activeItemId={activeArchitectureResult.id}
            onSelectItem={setManualPatternId}
          />
        </div>

        <div className="mb-24">
          <CompactDisclosure
            eyebrow="Deep explanation"
            title="Open the architecture confirmation simulator"
            summary="Use trait changes to confirm or override the current topology recommendation."
          >
            <DecisionSimulator
              eyebrow="Architecture confirmation"
              title="Choose the workload conditions, then confirm the topology posture"
              intro="Use the traits to test whether the active architecture recommendation still makes sense when workload synchronization, storage coupling, and scale certainty change."
              prompts={ARCHITECTURE_DECISION_PROMPTS}
              selectedValues={selectedTraits}
              onChange={handleTraitChange}
              results={architectureResults}
              activeResult={activeArchitectureResult}
              onSelectResult={setManualPatternId}
              renderVisual={renderArchitectureDecisionVisual}
            />
          </CompactDisclosure>
        </div>

        <div className="mb-24">
          <CompactDisclosure
            eyebrow="Apply this"
            title="Open validation telemetry"
            summary="Use counters and timing behavior to prove the active topology posture."
          >
            <TelemetryWatchPanel
              title="Validate the active posture with the right telemetry"
              eyebrow="Apply This"
              intro="The recommendation only matters if the workload can prove it in counters and timing behavior. These watchpoints follow the active posture."
              items={activeArchitectureResult.telemetry}
            />
          </CompactDisclosure>
        </div>

        <div className="mb-24">
          <InfrastructureImplicationsPanel
            eyebrow="Design Implication"
            title="What this means operationally"
            items={ARCHITECTURE_MODULE_IMPLICATIONS}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
          <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-300">Transfer Prompt</div>
          <h3 className="mb-3 text-2xl font-bold text-white">Next decision</h3>
          <p className="text-sm leading-relaxed text-slate-300">
            If the posture is now clear, the next move is quantitative planning and implementation detail. If it is still unclear, go backward to the module that owns the missing premise: workload shape, lifecycle stage, or traffic geometry.
          </p>
          <div className="mt-5">
            <CompactDisclosure
              eyebrow={PLANNER_HANDOFF_LABEL}
              title="Open planner handoff guidance"
              summary="Move to quantitative planning only after the architecture posture is defensible."
            >
              <p className="text-sm leading-relaxed text-slate-300">
                Validate the architecture posture here first, then move to quantitative planning. {PLANNER_HANDOFF_STANDARD_TEXT}
              </p>
            </CompactDisclosure>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderArchitectureDecisionVisual = (result: DecisionSimulatorResult) => {
  switch (result.diagramMode) {
    case 'burst-tolerant-mixed-fabric':
      return <BurstMixedVisual />;
    case 'modular-pod-expansion-fabric':
      return <ModularPodVisual />;
    case 'deterministic-collective-fabric':
    default:
      return <DeterministicCollectiveVisual />;
  }
};

const DeterministicCollectiveVisual: React.FC = () => (
  <div className="relative h-44">
    <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-blue-400">Balanced non-blocking rails</div>
    <div className="absolute inset-x-8 top-4 grid grid-cols-2 gap-8">
      <div className="h-2 rounded-full bg-blue-500/40" />
      <div className="h-2 rounded-full bg-blue-500/40" />
    </div>
    <div className="absolute inset-x-10 top-10 grid grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-20 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
          <div className="mb-2 h-1.5 rounded-full bg-blue-400/60" />
          <div className="h-1.5 rounded-full bg-blue-400/40" />
          <div className="mt-6 h-8 rounded-lg bg-[#0b1020]" />
        </div>
      ))}
    </div>
  </div>
);

const BurstMixedVisual: React.FC = () => (
  <div className="relative h-44">
    <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-violet-300">Checkpoint-aware isolation</div>
    <div className="grid h-32 grid-cols-[1fr_auto_1fr] gap-4">
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
        <div className="mb-2 text-xs text-cyan-200">Training path</div>
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-cyan-400/60" />
          <div className="h-2 rounded-full bg-cyan-400/40" />
        </div>
      </div>
      <div className="flex items-center justify-center text-slate-500">||</div>
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
        <div className="mb-2 text-xs text-amber-200">Checkpoint / storage path</div>
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-amber-400/60" />
          <div className="h-2 rounded-full bg-amber-400/40" />
        </div>
      </div>
    </div>
  </div>
);

const ModularPodVisual: React.FC = () => (
  <div className="relative h-44">
    <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-300">Pod-oriented expansion path</div>
    <div className="grid h-32 grid-cols-3 gap-4">
      {['Pod A', 'Pod B', 'Future Pod'].map((label, index) => (
        <div
          key={label}
          className={`rounded-2xl border p-4 ${index === 2 ? 'border-white/10 bg-white/5' : 'border-emerald-500/20 bg-emerald-500/10'}`}
        >
          <div className={`mb-3 text-xs ${index === 2 ? 'text-slate-400' : 'text-emerald-200'}`}>{label}</div>
          <div className="space-y-2">
            <div className={`h-2 rounded-full ${index === 2 ? 'bg-slate-700' : 'bg-emerald-400/60'}`} />
            <div className={`h-2 rounded-full ${index === 2 ? 'bg-slate-800' : 'bg-emerald-400/40'}`} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ArchitectureSection;
