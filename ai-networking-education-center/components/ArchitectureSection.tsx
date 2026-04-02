
import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import {
  ARCHITECTURE_DECISION_PROMPTS,
  ARCHITECTURE_PATTERN_REFERENCES,
  ICON_MAP,
  PLANNER_HANDOFF_LABEL,
  PLANNER_HANDOFF_STANDARD_TEXT,
  TOPOLOGY_SELECTION,
  VENDOR_NEUTRAL_ARCHITECTURE_LENS,
} from '../constants';
import { Layers, Server, GitMerge, ArrowRight, ChevronRight } from 'lucide-react';
import DecisionSimulator from './DecisionSimulator';
import GlossaryTerm from './GlossaryTerm';
import type { DecisionSimulatorResult, RunbookReference, TelemetryWatchpoint } from '../types';
import SourceBadge from './SourceBadge';
import TelemetryWatchPanel from './TelemetryWatchPanel';
import { claimText, hasSourceMetadata } from '../utils/sourceClaims';

const ArchitectureSection: React.FC = () => {
  const { scalingConcepts } = useData();
  const [selectedTraits, setSelectedTraits] = useState<Record<string, string>>({
    synchronization: 'barrier',
    storageCoupling: 'low',
    scaleCertainty: 'fixed',
    tailSensitivity: 'strict',
  });
  const [manualPatternId, setManualPatternId] = useState<string | null>(null);

  const computedPatternId = useMemo(() => {
    if (selectedTraits.scaleCertainty === 'growing' || selectedTraits.synchronization === 'uncertain') {
      return 'modular-pod-expansion-fabric';
    }
    if (selectedTraits.storageCoupling === 'high' || selectedTraits.synchronization === 'mixed') {
      return 'burst-tolerant-mixed-fabric';
    }
    if (selectedTraits.tailSensitivity === 'strict') {
      return 'deterministic-collective-fabric';
    }
    return 'burst-tolerant-mixed-fabric';
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
            : 'The first failure is usually asymmetric growth: one pod boundary, plane, or expansion edge starts carrying more coordination pain than the rest.'
      ,
      tradeoffs: pattern.tradeoffs,
      telemetry: pattern.telemetryWatchpoints.map((item) => ({
        label: item,
        signal: item,
        whyItMatters:
          pattern.id === 'deterministic-collective-fabric'
            ? 'This validates whether synchronized workloads are seeing predictable, bounded tail behavior.'
            : pattern.id === 'burst-tolerant-mixed-fabric'
              ? 'This validates whether mixed-stage pressure is isolated instead of leaking across the fabric.'
              : 'This validates whether phased growth is staying architecturally clean rather than creating hot boundaries.',
      })) as TelemetryWatchpoint[],
      runbookLinks: runbookMap[pattern.id],
      plannerTrigger: pattern.plannerTrigger,
      misconception:
        pattern.id === 'deterministic-collective-fabric'
          ? 'Do not summarize this as “just make it lossless.” The real lesson is that synchronized workloads punish weak symmetry and late feedback immediately.'
          : pattern.id === 'burst-tolerant-mixed-fabric'
            ? 'Do not treat storage and checkpoint behavior as backend details. If those stages dominate recovery or queue pressure, they are architecture inputs.'
            : 'Do not postpone expansion thinking until later. If scale certainty is low, modularity is part of the design posture from day one.',
      diagramMode: pattern.id,
    }));
  }, []);

  const activeArchitectureResult =
    architectureResults.find((item) => item.id === (manualPatternId ?? computedPatternId)) || architectureResults[0];

  const handleTraitChange = (promptId: string, optionId: string) => {
    setSelectedTraits((prev) => ({ ...prev, [promptId]: optionId }));
    setManualPatternId(null);
  };

  return (
    <section id="etherlink" className="py-32 bg-[#0F1117] relative border-t border-white/5">
      <div className="container mx-auto px-6">
        
        {/* Section Header */}
        <div className="mb-20">
          <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4">Domain · Architecture Patterns</div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Architecture Patterns</h2>
          <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
            Legacy three-tier architectures were built for <GlossaryTerm term="North-South Traffic" />. 
            AI Training requires a flat, high-bandwidth <GlossaryTerm term="East-West Traffic" /> fabric to synchronize thousands of GPUs.
          </p>
        </div>

        {/* Concept Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {(scalingConcepts || []).map((concept, idx) => {
            const Icon = ICON_MAP[concept.iconKey] || Layers;
            return (
              <div key={idx} className="bg-[#161b22] border border-white/5 rounded-2xl p-8 hover:border-blue-500/30 transition-all group">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform border border-blue-500/10">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{concept.title}</h3>
                <div
                  className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-3"
                  data-claim-id={hasSourceMetadata(concept.desc) ? concept.desc.claimId : undefined}
                >
                  {claimText(concept.desc)}
                  {hasSourceMetadata(concept.desc) && <SourceBadge claim={concept.desc} className="ml-2" />}
                </div>
                <p className="text-slate-400 leading-relaxed text-sm">
                  {claimText(concept.details)}
                  {hasSourceMetadata(concept.details) && (
                    <SourceBadge claim={concept.details} className="ml-2 align-middle" />
                  )}
                </p>
              </div>
            );
          })}
        </div>

        {/* Topology Selection Decision Tree */}
        <div className="mb-24">
          <div className="mb-10">
            <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4">Vendor-neutral architecture lens</div>
            <h3 className="text-2xl font-bold text-white mb-3">Principles that apply before platform selection</h3>
            <p className="text-slate-400 max-w-3xl text-sm">
              Use these principles to anchor the architecture conversation in workload behavior and operational outcomes before you move into platform-specific implementation depth.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3 mb-14">
            {VENDOR_NEUTRAL_ARCHITECTURE_LENS.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/5 bg-[#161b22] p-6">
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-blue-400 mb-3">Principle</div>
                <h4 className="text-lg font-bold text-white mb-3">{item.title}</h4>
                <p className="text-sm leading-relaxed text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="mb-10">
            <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4">Architecture Implications</div>
            <h3 className="text-2xl font-bold text-white mb-3">Topology Pattern Guide</h3>
            <p className="text-slate-400 max-w-2xl text-sm">
              Map workload behavior to topology patterns. Detailed sizing is intentionally out of scope in this reference layer.
            </p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {TOPOLOGY_SELECTION.map((branch, idx) => (
              <div key={idx} className="bg-[#161b22] border border-white/5 rounded-2xl p-6 hover:border-blue-500/30 transition-all group flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <ChevronRight size={14} className="text-blue-400" />
                  </div>
                  <span className="text-blue-300 font-bold text-sm">{branch.condition}</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{branch.recommendation}</p>
                <div className="mt-auto pt-3 border-t border-white/5">
                  <div className="text-xs font-mono text-slate-500 uppercase mb-1">Recommended</div>
                  <div className="text-xs text-slate-300 font-mono">{branch.platforms}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-24">
          <DecisionSimulator
            eyebrow="Standardized pattern reference"
            title="Choose the workload conditions, then see the architecture consequence"
            intro="This simulator turns the architecture comparison into a real decision flow. Set the workload traits first, then validate the posture, what fails first, and what you need to watch operationally."
            prompts={ARCHITECTURE_DECISION_PROMPTS}
            selectedValues={selectedTraits}
            onChange={handleTraitChange}
            results={architectureResults}
            activeResult={activeArchitectureResult}
            onSelectResult={setManualPatternId}
            renderVisual={renderArchitectureDecisionVisual}
          />
        </div>

        <div className="mb-24">
          <TelemetryWatchPanel
            title="Validate the active posture with the right telemetry"
            intro="The simulator recommendation only matters if the workload can prove it in counters and timing behavior. These watchpoints now follow the active posture."
            items={activeArchitectureResult.telemetry}
          />
        </div>

        {/* Visual: The Traffic Shift */}
        <div className="bg-[#161b22] rounded-3xl border border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5">
                <h3 className="text-xl font-bold text-white">The Traffic Pattern Shift</h3>
                <p className="text-slate-500 text-sm mt-1">Comparing traditional CPU clusters vs. Modern GPU Training Clusters</p>
            </div>
            
            <div className="grid md:grid-cols-2">
                {/* Traditional */}
                <div 
                  className="p-8 border-r border-white/5 bg-[#0d1117]"
                  role="img"
                  aria-label="Diagram of a Traditional CPU Cluster. Shows North-South traffic characterized by many small, independent flows moving vertically between nodes and a central switch."
                >
                    <div className="flex items-center gap-3 mb-6">
                        <Server size={20} className="text-slate-500" />
                        <span className="text-slate-300 font-semibold">Traditional CPU Cluster</span>
                    </div>
                    
                    {/* Visual */}
                    <div className="h-48 relative flex items-center justify-center mb-6">
                        {/* Central Switch */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-slate-800 rounded border border-slate-700 z-20 flex items-center justify-center shadow-lg">
                            <Layers size={14} className="text-slate-500" />
                        </div>
                        {/* Nodes */}
                        <div className="absolute bottom-0 w-full flex justify-around px-8">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-10 h-10 bg-slate-800 rounded border border-slate-700 relative group flex items-center justify-center">
                                    <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                                    <div className={`absolute -top-24 left-1/2 w-px h-24 bg-slate-700/50 group-hover:bg-slate-600 transition-colors`}></div>
                                    {/* Random small flows */}
                                    <div className={`absolute -top-24 left-1/2 w-0.5 h-2 bg-slate-400 rounded animate-[moveUp_3s_infinite]`} style={{animationDelay: `${i * 0.5}s`}}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="text-xs font-mono text-slate-500 uppercase">Characteristics</div>
                        <li className="text-sm text-slate-400 flex gap-2"><ArrowRight size={14} className="mt-1 text-slate-600"/> Many small flows (HTTP/SQL)</li>
                        <li className="text-sm text-slate-400 flex gap-2"><ArrowRight size={14} className="mt-1 text-slate-600"/> Independent operations</li>
                        <li className="text-sm text-slate-400 flex gap-2"><ArrowRight size={14} className="mt-1 text-slate-600"/> Oversubscription is okay</li>
                    </div>
                </div>

                {/* AI / GPU */}
                <div 
                  className="p-8 bg-[#161b22] relative overflow-hidden"
                  role="img" 
                  aria-labelledby="ai-cluster-title ai-cluster-desc"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <GitMerge size={20} className="text-blue-400" />
                        <span className="text-white font-semibold">AI Training Cluster</span>
                    </div>

                    {/* Visual */}
                    <div className="h-48 relative flex items-center justify-center mb-6 z-10">
                         
                         {/* Abstract Leaf-Spine Fabric Background */}
                         <div className="absolute inset-0 w-full h-full" aria-hidden="true">
                            {/* Horizontal Spines */}
                            <div className="absolute top-4 left-4 right-4 h-px bg-slate-700/30"></div>
                            <div className="absolute top-8 left-4 right-4 h-px bg-slate-700/30"></div>
                            
                            {/* Vertical Links (Abstracted) */}
                            <div className="absolute inset-0 px-12 flex justify-between">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="w-px h-full bg-slate-700/20 relative">
                                        <div className="absolute top-4 w-1 h-1 bg-slate-700/50 -ml-0.5 rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                         </div>

                         {/* Deterministic Flow Paths (No Intersections) */}
                         <div className="absolute inset-0 w-full h-full px-12">
                             <svg className="w-full h-full overflow-visible" role="img">
                                 <title id="ai-cluster-title">AI Cluster Traffic Flow</title>
                                 <desc id="ai-cluster-desc">Diagram showing East-West traffic flow in a leaf-spine topology. Packets move deterministically from nodes up to spines and down to destination nodes without intersection.</desc>
                                 <defs>
                                     <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                         <stop offset="0%" stopColor="transparent" />
                                         <stop offset="50%" stopColor="#3b82f6" />
                                         <stop offset="100%" stopColor="transparent" />
                                     </linearGradient>
                                 </defs>
                                 
                                 {/* Flow 1: Node 1 to Node 3 (Up, Over, Down) */}
                                 <path d="M2,44 V12 H66 V44" fill="none" stroke="url(#flowGradient)" strokeWidth="1.5" strokeLinecap="round" className="opacity-60">
                                    <animate attributeName="stroke-dasharray" from="0,200" to="200,0" dur="2s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                                 </path>
                                 
                                 {/* Flow 2: Node 4 to Node 2 (Up, Over, Down) - Offset height to show lanes */}
                                 <path d="M98,44 V20 H34 V44" fill="none" stroke="url(#flowGradient)" strokeWidth="1.5" strokeLinecap="round" className="opacity-60">
                                    <animate attributeName="stroke-dasharray" from="0,200" to="200,0" dur="2s" begin="1s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1s" repeatCount="indefinite" />
                                 </path>

                                 {/* Flow 3: Node 2 to Node 3 (Short hop) */}
                                 <path d="M34,44 V28 H66 V44" fill="none" stroke="blue" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="2 2">
                                 </path>
                             </svg>
                         </div>

                         {/* Nodes */}
                         <div className="absolute bottom-0 w-full flex justify-between px-12" aria-hidden="true">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="w-6 h-6 bg-[#0F1117] rounded border border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)] z-10 flex items-center justify-center">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <div className="text-xs font-mono text-blue-400 uppercase">Characteristics</div>
                        <li className="text-sm text-slate-300 flex gap-2"><ArrowRight size={14} className="mt-1 text-blue-500"/> Massive synchronized bursts</li>
                        <li className="text-sm text-slate-300 flex gap-2"><ArrowRight size={14} className="mt-1 text-blue-500"/> Deterministic Traffic Flow</li>
                        <li className="text-sm text-slate-300 flex gap-2"><ArrowRight size={14} className="mt-1 text-blue-500"/> <strong className="text-white">Zero</strong> Oversubscription tolerated</li>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes moveUp {
                    0% { top: 100%; opacity: 0; }
                    20% { opacity: 1; }
                    100% { top: 0%; opacity: 0; }
                }
            `}</style>
	        </div>

          {/* Handoff CTA */}
          <div className="mt-10 bg-[#0d1117] border border-blue-500/20 rounded-2xl p-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-blue-300 mb-2">{PLANNER_HANDOFF_LABEL}</div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Validate the architecture posture here first, then move to quantitative planning.{' '}
              {PLANNER_HANDOFF_STANDARD_TEXT}
            </p>
          </div>

      </div>
    </section>
  );
};

export default ArchitectureSection;

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
    <svg className="absolute inset-0 h-full w-full opacity-60">
      <path d="M70,36 L110,70" stroke="#60a5fa" strokeWidth="1.5" />
      <path d="M130,36 L155,70" stroke="#60a5fa" strokeWidth="1.5" />
      <path d="M205,36 L195,70" stroke="#60a5fa" strokeWidth="1.5" />
      <path d="M265,36 L240,70" stroke="#60a5fa" strokeWidth="1.5" />
      <path d="M70,36 L195,70" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 4" />
      <path d="M265,36 L110,70" stroke="#60a5fa" strokeWidth="1" strokeDasharray="4 4" />
    </svg>
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
    <div className="absolute bottom-0 left-0 right-0 rounded-xl border border-white/5 bg-[#0b1020] px-4 py-3 text-sm text-slate-300">
      The architecture protects lifecycle transitions instead of assuming steady-state traffic tells the whole story.
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
    <svg className="absolute inset-0 h-full w-full opacity-50">
      <path d="M92,72 L176,72" stroke="#34d399" strokeWidth="1.5" strokeDasharray="5 4" />
      <path d="M208,72 L292,72" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="5 4" />
    </svg>
  </div>
);
