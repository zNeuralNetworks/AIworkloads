import React from 'react';
import { CheckCircle2, Zap } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import type { HPCItem } from '../types';
import { ICON_MAP, VALIDATION_PHASES } from '../constants';
import SourceBadge from './SourceBadge';
import WorkflowStoryboard, { type WorkflowStoryboardScenario } from './WorkflowStoryboard';
import { claimText, hasSourceMetadata } from '../utils/sourceClaims';

const WORKFLOW_STORYBOARD_SCENARIOS: WorkflowStoryboardScenario[] = [
  {
    id: 'ai-training',
    title: 'AI Training Workflow',
    subtitle: 'The main story is synchronized exchange, checkpoint safety, and straggler sensitivity.',
    frames: [
      { id: 'train-ingest', phase: 'Phase 1', title: 'Dataset ingest', summary: 'Training begins with dataset placement and first-batch readiness rather than collective traffic.', traffic: 'North-south ingest plus early east-west staging', storage: 'Moderate to high if dataset landing is delayed', failure: 'First-batch delay and uneven worker start', nextModule: 'Data Movement' },
      { id: 'train-collective', phase: 'Phase 2', title: 'Collective exchange', summary: 'This is where all-reduce and synchronized bursts dominate the architecture story.', traffic: 'Heavy east-west collective coordination', storage: 'Low during steady-state exchange', failure: 'Straggler rails and tail-latency amplification', nextModule: 'Communication Patterns / Transport & Congestion' },
      { id: 'train-checkpoint', phase: 'Phase 3', title: 'Checkpoint save', summary: 'Checkpoint windows turn storage into a first-class fabric event and test isolation quality.', traffic: 'Burst writeback with convergent pressure', storage: 'High', failure: 'Checkpoint collisions with training or long recovery windows', nextModule: 'Architecture Patterns' },
    ],
  },
  {
    id: 'scientific-workflow',
    title: 'Scientific Workflow',
    subtitle: 'The main story is mixed-stage pressure, storage coupling, and restart tolerance.',
    frames: [
      { id: 'science-stage', phase: 'Phase 1', title: 'Input staging', summary: 'Large datasets and preprocessing steps often make storage and staging the first infrastructure constraint.', traffic: 'Burst ingest plus shared backend contention', storage: 'High', failure: 'Slow readiness and backend contention', nextModule: 'Data Movement' },
      { id: 'science-compute', phase: 'Phase 2', title: 'Domain compute', summary: 'Traffic can be structured, nearest-neighbor, or intermittently convergent rather than globally synchronized.', traffic: 'Structured domain exchange or phase-specific redistribution', storage: 'Low to moderate', failure: 'Localized hotspots or uneven phase completion', nextModule: 'Communication Patterns' },
      { id: 'science-restart', phase: 'Phase 3', title: 'Restart and recovery', summary: 'Recovery quality matters because long-running simulations can turn restart into the dominant operational event.', traffic: 'Checkpoint restore and state reload', storage: 'High', failure: 'Extended recovery time and repeated queue pressure during restore', nextModule: 'Architecture Patterns / Performance' },
    ],
  },
  {
    id: 'mixed-shared',
    title: 'Mixed Shared Environment',
    subtitle: 'The main story is interference between training, scientific jobs, and storage-coupled bursts.',
    frames: [
      { id: 'mixed-ingest', phase: 'Phase 1', title: 'Shared ingest', summary: 'Multiple tenants land data through the same fabric and create unpredictable startup contention.', traffic: 'Mixed north-south and lateral staging', storage: 'Moderate to high', failure: 'Readiness jitter and noisy-neighbor effects', nextModule: 'Data Movement' },
      { id: 'mixed-runtime', phase: 'Phase 2', title: 'Concurrent runtime', summary: 'Training collectives, fan-in jobs, and scientific phases all compete for policy headroom.', traffic: 'Mixed collectives, convergence, and structured flows', storage: 'Moderate', failure: 'One policy posture overfits one workload and harms the others', nextModule: 'Communication Patterns / Transport & Congestion' },
      { id: 'mixed-checkpoint', phase: 'Phase 3', title: 'Shared checkpoint windows', summary: 'If checkpoint and restore are not isolated, they become the hidden architecture constraint.', traffic: 'Convergent storage bursts during save and restore', storage: 'High', failure: 'Long recovery events and broad collateral congestion', nextModule: 'Architecture Patterns / Operations' },
    ],
  },
];

const HPCSection: React.FC = () => {
  const { hpcChecklist } = useData();

  return (
    <section id="hpc" className="border-t border-white/5 bg-[#0F1117] py-32">
      <div className="container mx-auto px-6">
        <div className="mb-20 flex flex-col items-center text-center">
          <div className="mb-4 font-mono text-xs uppercase tracking-widest text-emerald-500">
            Domain · Scientific Workflow Context
          </div>
          <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">Scientific Workflow Context</h2>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-400">
            Teach this as a workflow with phases, bursts, checkpoints, and recovery consequences, not just as a static contrast with AI training.
          </p>
        </div>

        <div className="mb-24">
          <WorkflowStoryboard
            title="Map the workflow before you map the topology"
            intro="This storyboard makes the infrastructure conversation phase-based: what the workflow is doing now, what traffic shape appears, what storage does, and what fails first."
            scenarios={WORKFLOW_STORYBOARD_SCENARIOS}
          />
        </div>

        <div className="mb-24">
          <div className="mb-10">
            <div className="mb-4 font-mono text-xs uppercase tracking-widest text-emerald-500">POC Validation Procedure</div>
            <h3 className="mb-3 text-2xl font-bold text-white">AI Fabric Validation — 3-Phase Workflow</h3>
            <p className="max-w-2xl text-sm text-slate-400">
              A structured validation flow still matters. Run these tests in order after the workflow and architecture posture are clear.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {VALIDATION_PHASES.map((phase) => (
              <div key={phase.phase} className="overflow-hidden rounded-2xl border border-white/5 bg-[#161b22]">
                <div className="flex items-center gap-3 border-b border-white/5 p-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20">
                    <span className="text-sm font-bold text-emerald-400">{phase.phase}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{phase.title}</h4>
                    <span className="font-mono text-xs text-slate-500">{phase.days}</span>
                  </div>
                </div>
                <ul className="space-y-3 p-5">
                  {phase.tests.map((test) => (
                    <li key={test.testId} className="flex items-start gap-3 text-sm text-slate-400">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-slate-600" />
                      <span>
                        <span className="mr-2 font-mono text-xs text-slate-600">{test.testId}</span>
                        {test.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-24">
          <h3 className="mb-12 text-center text-2xl font-bold text-white">
            Engineer's Checklist: What Still Needs To Be True
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {hpcChecklist.map((card: HPCItem, i: number) => {
              const Icon = ICON_MAP[card.iconKey] || Zap;
              return (
                <div
                  key={i}
                  className="group rounded-xl border border-white/5 bg-[#161b22] p-6 transition-colors hover:border-blue-500/30"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-[#0d1117] p-2 text-blue-400 transition-colors group-hover:bg-blue-900/20 group-hover:text-blue-300">
                      <Icon size={20} />
                    </div>
                    <h4 className="font-mono text-sm font-bold uppercase tracking-wide text-white">
                      {card.title}
                    </h4>
                  </div>
                  <ul className="space-y-3">
                    {card.points.map((pt, j: number) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm leading-relaxed text-slate-400"
                        data-claim-id={hasSourceMetadata(pt) ? pt.claimId : undefined}
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                        <span>{claimText(pt)}</span>
                        {hasSourceMetadata(pt) && <SourceBadge claim={pt} className="ml-2" />}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-900/10 to-blue-700/10 p-12 text-center">
          <h3 className="mb-6 font-mono text-xl font-bold uppercase tracking-widest text-white">
            The Takeaway
          </h3>
          <p className="mx-auto max-w-4xl text-2xl italic leading-relaxed text-blue-100">
            "The useful question is not whether this environment is AI or HPC. The useful question is which workflow phase dominates the infrastructure pressure, what traffic geometry appears there, and how recovery behaves when that phase goes wrong."
          </p>
        </div>
      </div>
    </section>
  );
};

export default HPCSection;
