import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import GlossaryTerm from './GlossaryTerm';
import { motion, AnimatePresence } from 'framer-motion';
import { ICON_MAP, CONGESTION_PROCEDURE } from '../constants';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Network,
  Pause,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { useProtocolSimulation } from '../hooks/useProtocolSimulation';
import DepthPreferenceTabs from './DepthPreferenceTabs';
import KnowledgeCheckCard from './KnowledgeCheckCard';
import InfrastructureImplicationsPanel from './InfrastructureImplicationsPanel';
import RunbookLinksPanel from './RunbookLinksPanel';
import SoWhatCallout from './SoWhatCallout';
import TelemetryWatchPanel from './TelemetryWatchPanel';
import QuickKnowledgeCheck from './QuickKnowledgeCheck';
import CongestionSequenceStrip from './CongestionSequenceStrip';
import { useLearning } from '../contexts/LearningContext';
import type {
  InfrastructureImplication,
  KnowledgeCheck,
  ProtocolMechanism,
  RunbookReference,
  TelemetryWatchpoint,
} from '../types';

const protocolColor = (color: string) => {
  if (color === 'blue') return { tab: 'bg-blue-600', badge: 'bg-blue-900/30 text-blue-400', icon: 'bg-blue-500/10 text-blue-400' };
  if (color === 'purple') return { tab: 'bg-purple-600', badge: 'bg-purple-900/30 text-purple-400', icon: 'bg-purple-500/10 text-purple-400' };
  return { tab: 'bg-green-600', badge: 'bg-green-900/30 text-green-400', icon: 'bg-green-500/10 text-green-400' };
};

const PROTOCOL_CHECK: KnowledgeCheck = {
  id: 'protocols-congestion-check',
  prompt: 'If sustained PFC is the most visible signal in the fabric, what is the best first interpretation?',
  correctOptionId: 'loop-late',
  options: [
    {
      id: 'pfc-good',
      label: 'That is healthy. It means the lossless design is doing exactly what it should, so sustained pause is a sign of correctness.',
      rationale:
        'Sustained or spreading PFC is usually a sign the congestion loop is arriving too late. PFC should be brief and contained, not the dominant steady-state behavior.',
    },
    {
      id: 'loop-late',
      label: 'The end-to-end congestion loop is probably reacting too late, so the network is relying on link-level rescue rather than timely endpoint response.',
      rationale:
        'Correct. Treat ECN as the early signal and PFC as the emergency backstop, not the primary operating mode.',
    },
    {
      id: 'always-bandwidth',
      label: 'The only useful response is to add bandwidth, because queue tuning and threshold posture are secondary.',
      rationale:
        'More capacity may help, but the first instructional question is whether the control loop, thresholds, and pathing posture are wrong before assuming brute-force headroom is the answer.',
    },
  ],
};

const PROTOCOL_MODULE_IMPLICATIONS: InfrastructureImplication[] = [
  {
    label: 'What to monitor first',
    detail: 'Look for the ECN-to-PFC sequence, queue containment, pause spread, and whether endpoints are reacting in time under synchronized load.',
  },
  {
    label: 'What fails first',
    detail: 'Step-time variance, incast hot spots, and pause-dominated recovery windows usually show up before a flat bandwidth benchmark looks wrong.',
  },
  {
    label: 'What to tune first',
    detail: 'Start with the ECN marking threshold — set it per workload timing class before touching DCQCN sender-reaction timers or PFC pause scope. The congestion procedure in this module gives the workload-specific baseline thresholds.',
  },
];

const PROTOCOL_TELEMETRY: TelemetryWatchpoint[] = [
  {
    label: 'ECN before pause',
    signal: 'ECN marks appear and stabilize before sustained PFC growth',
    whyItMatters: 'This is the quickest indicator that the congestion loop is leading instead of reacting late.',
  },
  {
    label: 'Pause containment',
    signal: 'Pause remains brief and localized rather than spreading across unrelated links',
    whyItMatters: 'Sustained or spreading pause means the fabric is using link-level rescue as a primary control mode.',
  },
  {
    label: 'Endpoint reaction',
    signal: 'CNP and sender-rate reduction counters move in step with marked congestion',
    whyItMatters: 'If the host reaction lags, switch-side tuning alone will not fix the control loop.',
  },
  {
    label: 'Hotspot geometry',
    signal: 'Queue depth and retransmit behavior align with a specific path, rail, or receiver set',
    whyItMatters: 'The useful question is where the loop breaks first, not whether the whole fabric looks busy.',
  },
];

const PROTOCOL_RUNBOOKS: RunbookReference[] = [
  {
    id: 'ecn-instability',
    label: 'ECN Mark Rate Instability',
    context: 'Use this when ECN is absent, constant, or clearly arriving too late for the workload burst pattern.',
  },
  {
    id: 'pfc-storm',
    label: 'PFC Storm / Head-of-Line Blocking',
    context: 'Use this when pause containment fails and lossless behavior turns into broad collateral damage.',
  },
  {
    id: 'allreduce-tail-latency',
    label: 'High Tail Latency During All-Reduce',
    context: 'Use this when synchronized training shows variance and a likely slow rail or path is stretching the collective.',
  },
];

const PROTOCOL_MICRO_CHECK: KnowledgeCheck = {
  id: 'protocols-loop-order-check',
  prompt: 'In a healthy congestion-control story, what should appear before sustained pause?',
  correctOptionId: 'ecn-first',
  options: [
    {
      id: 'ecn-first',
      label: 'ECN marks and endpoint reaction',
      rationale: 'Correct. That sequence proves the early-feedback loop is leading before pause becomes the visible control behavior.',
    },
    {
      id: 'pause-first',
      label: 'PFC pause dominating the queue',
      rationale: 'That indicates PFC is still being read as the primary control loop, which is the wrong causal model.',
    },
  ],
};

const CONTROL_LOOP_STEPS = [
  {
    step: '1',
    title: 'Workload pressure creates queue growth',
    detail: 'Variance, incast, or pause spread tells you which congestion question to ask first.',
    tone: 'blue' as const,
  },
  {
    step: '2',
    title: 'ECN marks before exhaustion',
    detail: 'The switch marks early enough for endpoints to react while the queue still has room.',
    tone: 'amber' as const,
  },
  {
    step: '3',
    title: 'CNP/DCQCN reduces sender rate',
    detail: 'Endpoint feedback closes the loop before link-level rescue becomes the operating mode.',
    tone: 'emerald' as const,
  },
  {
    step: '4',
    title: 'PFC stays brief, local, and exceptional',
    detail: 'If sustained PFC dominates, the loop is late or containment is failing.',
    tone: 'red' as const,
  },
];

const CONTROL_PLANE_MAP = [
  {
    label: 'QoS / Traffic Class',
    detail: 'Where no-drop behavior applies.',
  },
  {
    label: 'ECN',
    detail: 'Switch-side early warning.',
  },
  {
    label: 'CNP / DCQCN',
    detail: 'Endpoint reaction loop.',
  },
  {
    label: 'PFC',
    detail: 'Link-local emergency containment.',
  },
  {
    label: 'DLB / CLB / UET',
    detail: 'Pathing or transport strategy, not a substitute for telemetry.',
  },
];

function protocolForPattern(patternId?: string): string {
  switch (patternId) {
    case 'all-reduce':
    case 'checkpoint-burst':
      return 'roce';
    case 'all-to-all':
    case 'moe-dispatch':
      return 'load-balancing';
    default:
      return 'roce';
  }
}

const ProtocolsSection: React.FC = () => {
  const { protocolConcepts } = useData();
  const {
    selectedDepthPreference,
    setDepthPreference,
    markVisited,
    toggleMastered,
    masteredModules,
    activeTrafficPattern,
  } = useLearning();
  const [activeTab, setActiveTab] = useState(protocolForPattern(activeTrafficPattern));
  const {
    uiState,
    isPlaying,
    setIsPlaying,
    handleBurst,
    handleReset,
    BUFFER_THRESHOLD,
  } = useProtocolSimulation();
  const { bufferLevel, senderPaused, packets } = uiState;
  const ECN_THRESHOLD = 60;
  const ecnActive = bufferLevel >= ECN_THRESHOLD && bufferLevel < BUFFER_THRESHOLD;
  const pfcActive = bufferLevel >= BUFFER_THRESHOLD || senderPaused;
  const showDesignPanels =
    selectedDepthPreference === 'design' || selectedDepthPreference === 'expert';
  const showExpertDepth = selectedDepthPreference === 'expert';
  const isMastered = masteredModules.includes('protocols');

  useEffect(() => {
    markVisited('protocols');
  }, [markVisited]);

  useEffect(() => {
    const suggestedTab = protocolForPattern(activeTrafficPattern);
    setActiveTab((prev) => (prev === suggestedTab ? prev : suggestedTab));
  }, [activeTrafficPattern]);

  return (
    <section id="protocols" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(30,58,138,0.1),transparent_50%)] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4">Domain · Transport & Congestion</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Transport & Congestion</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Diagnose whether congestion control is leading or arriving late. Start with the workload symptom,
            then prove the ECN → DCQCN/CNP → PFC sequence before debating transport posture.
          </p>
        </div>

        <div className="mb-10">
          <DepthPreferenceTabs value={selectedDepthPreference} onChange={setDepthPreference} />
        </div>

        {activeTrafficPattern && (
          <div className="mb-8 inline-flex rounded-full border border-blue-500/15 bg-blue-500/10 px-4 py-2 text-sm text-blue-100">
            Active traffic pattern is setting the default congestion question.
          </div>
        )}

        <div className="mb-12 rounded-2xl border border-white/10 bg-[#161b22] p-6 md:p-8">
          <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">
            Control Loop Contract
          </div>
          <h3 className="mb-6 text-2xl font-bold text-white">Read the control loop before tuning</h3>
          <div className="grid gap-3 lg:grid-cols-4">
            {CONTROL_LOOP_STEPS.map((item) => (
              <ControlLoopStepCard key={item.step} {...item} />
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100">
            If sustained PFC is the dominant signal, the loop is late or containment is failing.
          </div>
        </div>

        <div className="mb-12 grid gap-3 md:grid-cols-5">
          {CONTROL_PLANE_MAP.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/5 bg-[#111827] p-4">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.16em] text-slate-500">
                {item.label}
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <QuickKnowledgeCheck check={PROTOCOL_MICRO_CHECK} moduleId="protocols" />
        </div>

        {/* Style for custom animation keyframes if needed */}
        <style>{`
          @keyframes moveRight {
            0% { left: -20%; }
            100% { left: 120%; }
          }
        `}</style>

        <div className="mb-16">
          <div className="mb-10 text-center">
            <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4">
              Control-Loop Simulator
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ECN and PFC Congestion Loop
            </h3>
            <p className="text-slate-400 max-w-3xl mx-auto">
              Use the active queue state to prove the sequence: queue builds,{" "}
              <GlossaryTerm term="ECN">ECN</GlossaryTerm> marks first, endpoints are expected to
              react, and <GlossaryTerm term="PFC">PFC</GlossaryTerm> is the last-resort backstop
              when feedback is too slow.
            </p>
          </div>

          <div className="bg-[#161b22] rounded-2xl border border-white/5 p-4 md:p-10 relative overflow-hidden min-h-[400px] select-none">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="relative z-10 mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-[0.22em] text-blue-400 mb-2">
                  RoCEv2 Behavior Model
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
                  Use the lab to see whether the loop is below threshold, marking early, reacting at
                  the endpoint, or falling back to pause.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-2 rounded-lg px-5 py-3 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300/70 ${
                    isPlaying
                      ? 'border border-amber-500/50 bg-amber-500/10 text-amber-500'
                      : 'bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.35)] hover:bg-green-500'
                  }`}
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                  {isPlaying ? 'Pause Traffic' : 'Start Traffic'}
                </button>
                <button
                  onClick={handleBurst}
                  disabled={senderPaused}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-bold text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Zap size={16} />
                  Inject Burst
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-white/10 bg-[#0d1117] p-3 text-slate-400 transition-colors hover:border-white/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70"
                  aria-label="Reset simulation"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            <div className="relative z-10 grid gap-6 lg:flex lg:h-72 lg:items-center lg:justify-between">
              <div className="w-full rounded-xl border border-slate-700 bg-[#0d1117] p-4 shadow-2xl lg:w-44">
                <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                  <span>Sender NIC</span>
                  <span>Q3</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full rounded-full bg-slate-800 opacity-30" />
                  <div className="h-2 w-3/4 rounded-full bg-slate-800 opacity-30" />
                  <div className={`relative h-10 rounded border overflow-hidden transition-colors ${
                    senderPaused ? 'border-red-500/50 bg-red-500/5' : 'border-blue-500/30 bg-slate-800'
                  }`}>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold uppercase">
                      {senderPaused ? (
                        <div className="flex items-center gap-2 text-red-400 animate-pulse">
                          <Pause size={12} fill="currentColor" />
                          Queue Paused
                        </div>
                      ) : (
                        <span className="text-blue-400/80">RoCE Data Queue</span>
                      )}
                    </div>
                  </div>
                  <div className="h-2 w-1/2 rounded-full bg-slate-800 opacity-30" />
                </div>
              </div>

              <div className="relative h-40 min-w-0 lg:flex-1">
                <div className="absolute top-[38%] h-px w-full bg-slate-700" />
                <div className="absolute top-[62%] h-px w-full bg-slate-700" />

                {packets.map((p) => (
                  <div
                    key={p.id}
                    className={`absolute top-1/2 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform will-change-transform ${
                      p.type === 'data'
                        ? 'bg-blue-500 text-white -translate-y-8 shadow-blue-500/20'
                        : 'bg-red-500 text-white shadow-red-500/40 z-20 border-2 border-white'
                    }`}
                    style={{ left: `${p.x}%`, transform: p.type === 'data' ? 'translateY(-2rem)' : 'translateY(0)' }}
                  >
                    {p.type === 'data' ? (
                      <div className="w-4 h-1 rounded-full bg-white/50" />
                    ) : (
                      <span className="text-[10px] font-bold">PFC</span>
                    )}
                  </div>
                ))}

                <div className={`absolute top-4 left-1/3 rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] transition-colors ${
                  ecnActive ? 'border border-amber-500/40 bg-amber-500/15 text-amber-300' : 'border border-white/5 bg-white/5 text-slate-500'
                }`}>
                  ECN Marking
                </div>
                <div className={`absolute bottom-4 right-1/3 rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] transition-colors ${
                  pfcActive ? 'border border-red-500/40 bg-red-500/15 text-red-300' : 'border border-white/5 bg-white/5 text-slate-500'
                }`}>
                  PFC Backstop
                </div>

                <div className="absolute left-0 -bottom-8 flex items-center gap-1 text-xs font-mono text-slate-600">
                  Data <ArrowRight size={12} />
                </div>
                <div className="absolute right-0 -bottom-8 flex items-center gap-1 text-xs font-mono text-slate-600">
                  <ArrowLeft size={12} /> Control
                </div>
              </div>

              <div className="w-full rounded-xl border border-slate-700 bg-[#0d1117] p-4 shadow-2xl lg:w-48">
                <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">
                  <span>Receiver Queue</span>
                  <span>Leaf Port</span>
                </div>

                <div
                  className="relative h-44 overflow-hidden rounded border border-slate-600 bg-slate-800 flex flex-col justify-end"
                  role="progressbar"
                  aria-valuenow={Math.round(bufferLevel)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Ingress buffer level"
                >
                  <div
                    className={`w-full transition-[height,background-color] duration-100 ease-linear ${
                      pfcActive ? 'bg-red-500/80' : ecnActive ? 'bg-amber-500/75' : 'bg-green-500/60'
                    }`}
                    style={{ height: `${bufferLevel}%` }}
                  />

                  <div
                    className="absolute w-full border-t-2 border-dashed border-amber-500/50 flex items-end justify-end px-1"
                    style={{ bottom: `${ECN_THRESHOLD}%` }}
                  >
                    <span className="text-[9px] text-amber-300 font-bold bg-slate-900/80 px-1 rounded -mb-3">
                      ECN
                    </span>
                  </div>
                  <div
                    className="absolute w-full border-t-2 border-dashed border-red-500/50 flex items-end justify-end px-1"
                    style={{ bottom: `${BUFFER_THRESHOLD}%` }}
                  >
                    <span className="text-[9px] text-red-400 font-bold bg-slate-900/80 px-1 rounded -mb-3">
                      PFC
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-white drop-shadow-md">
                      {Math.round(bufferLevel)}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-center text-xs font-mono text-slate-400">Ingress Buffer</div>
              </div>
            </div>

            <div className="relative z-10 mt-10 grid gap-4 md:grid-cols-3" aria-live="polite">
              <div className={`rounded-lg border p-4 text-sm ${
                !ecnActive && !pfcActive
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-200'
                  : 'border-slate-700 bg-slate-800/50 text-slate-500'
              }`}>
                <strong className="block mb-1">1. Below Threshold</strong>
                Packets drain cleanly. The objective is not “no congestion ever,” but keeping the
                queue in a range where marks are informative and pause does not spread.
              </div>
              <div className={`rounded-lg border p-4 text-sm ${
                ecnActive
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                  : 'border-slate-700 bg-slate-800/50 text-slate-500'
              }`}>
                <strong className="block mb-1 flex items-center gap-2">
                  2. ECN Marking {ecnActive && <AlertTriangle size={14} aria-hidden="true" />}
                </strong>
                The switch marks before the queue is exhausted. The expected next step is endpoint
                rate reduction via <GlossaryTerm term="DCQCN">DCQCN</GlossaryTerm>, not immediate pause propagation.
              </div>
              <div className={`rounded-lg border p-4 text-sm ${
                pfcActive
                  ? 'border-red-500/30 bg-red-500/10 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.08)]'
                  : 'border-slate-700 bg-slate-800/50 text-slate-500'
              }`}>
                <strong className="block mb-1 flex items-center gap-2">
                  3. PFC As Backstop {pfcActive && <Pause size={14} aria-hidden="true" />}
                </strong>
                When pause dominates, the loop is already late. Sustained or spreading PFC means the
                fabric is relying on link-level rescue instead of timely end-to-end congestion response.
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-6">
            <CongestionSequenceStrip
              ecnActive={ecnActive}
              pfcActive={pfcActive}
              senderPaused={senderPaused}
              bufferLevel={bufferLevel}
            />

            <div className="rounded-2xl border border-white/5 bg-[#161b22] p-7">
              <div className="text-xs font-mono uppercase tracking-[0.22em] text-blue-400 mb-4">
                Control-Loop Readout
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
                  <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                    Congestion State
                  </div>
                  <p className="text-sm text-slate-300">
                    {pfcActive ? 'PFC backstop' : ecnActive ? 'ECN marking' : 'Below threshold'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
                  <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                    Buffer Level
                  </div>
                  <p className="text-sm text-slate-300">{Math.round(bufferLevel)}% occupancy</p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
                  <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                    First Action
                  </div>
                  <p className="text-sm text-slate-300">
                    {pfcActive
                      ? 'Check pause growth, queue mapping, and containment.'
                      : ecnActive
                        ? 'Verify CNP generation and sender rate reduction.'
                        : 'Establish baseline before tuning thresholds.'}
                  </p>
                </div>
                <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
                  <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                    Design Intent
                  </div>
                  <p className="text-sm text-slate-300">
                    ECN should act early enough that PFC stays brief, local, and exceptional.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mb-16">
          <div className="mb-6">
            <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-3">
              Transport & Pathing Reference
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Compare posture after the loop is clear
            </h3>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
              Treat RoCEv2 and UET as transport postures, and path distribution as a separate design
              question that still needs telemetry proof.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Transport and pathing reference">
            {protocolConcepts.map((protocol) => {
              const Icon = ICON_MAP[protocol.iconKey] || Network;
              return (
                <button
                  key={protocol.id}
                  role="tab"
                  aria-selected={activeTab === protocol.id}
                  onClick={() => setActiveTab(protocol.id)}
                  className={`relative flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 ${
                    activeTab === protocol.id
                      ? 'border-blue-500/30 bg-blue-500/10 text-white'
                      : 'border-white/10 bg-[#111827] text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Icon size={16} aria-hidden="true" />
                  {protocol.title}
                </button>
              );
            })}
          </div>

          <div className="min-h-[360px]">
            <AnimatePresence mode="wait">
              {protocolConcepts.map((protocol) =>
                protocol.id === activeTab ? (
                  <motion.div
                    key={protocol.id}
                    role="tabpanel"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="grid gap-6 rounded-2xl border border-white/10 bg-[#161b22] p-6 md:p-8 xl:grid-cols-[0.85fr_1.15fr]"
                  >
                    <div>
                      <div className={`mb-3 inline-block rounded px-3 py-1 text-xs font-bold uppercase tracking-wide ${protocolColor(protocol.color).badge}`}>
                        {protocol.subtitle}
                      </div>
                      <h4 className="mb-4 text-3xl font-bold text-white">{protocol.title}</h4>
                      <p className="text-lg leading-relaxed text-slate-300">{protocol.description}</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {protocol.mechanisms.map((mech: ProtocolMechanism) => {
                        const MechIcon = ICON_MAP[mech.iconKey] || Network;
                        return (
                          <div
                            key={mech.name}
                            className="rounded-xl border border-white/5 bg-[#0d1117] p-4 transition-colors hover:border-white/15"
                          >
                            <div className="mb-3 flex items-start gap-3">
                              <div className={`rounded-lg p-2 ${protocolColor(protocol.color).icon}`}>
                                <MechIcon size={18} aria-hidden="true" />
                              </div>
                              <h5 className="text-sm font-bold text-white">{mech.name}</h5>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-400">{mech.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mb-16">
          <div className="mb-6">
            <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-3">
              Tuning Order
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Tune after the sequence is proven
            </h3>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-400">
              Use the same order every time: classify the pressure, set marking posture, scope pause,
              choose path distribution, then validate endpoint reaction.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {CONGESTION_PROCEDURE.map((step, idx) => (
              <div key={step.step} className="relative">
                {idx < CONGESTION_PROCEDURE.length - 1 && (
                  <div className="hidden md:flex absolute top-6 right-0 translate-x-1/2 z-10 text-slate-600">
                    <ChevronRight size={16} aria-hidden="true" />
                  </div>
                )}
                <div className="h-full rounded-xl border border-white/5 bg-[#161b22] p-5 transition-colors hover:border-blue-500/30">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/20">
                      <span className="text-xs font-bold text-blue-400">{step.step}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{step.title}</h4>
                  </div>
                  {showExpertDepth ? (
                    <ul className="space-y-2">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2 text-xs text-slate-400">
                          <span className="mt-1 shrink-0 text-blue-500">›</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs leading-relaxed text-slate-400">{step.details[0]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showDesignPanels && (
          <div className="mt-16 mb-16">
            <InfrastructureImplicationsPanel
              eyebrow="Design Implication"
              title="What this means operationally"
              items={PROTOCOL_MODULE_IMPLICATIONS}
            />
          </div>
        )}

        <div className="mb-16 grid gap-6 xl:grid-cols-2">
          <TelemetryWatchPanel
            title="Apply the control-loop model with telemetry"
            eyebrow="Apply This"
            intro="These watchpoints prove whether the loop is leading, late, or missing endpoint reaction."
            items={PROTOCOL_TELEMETRY}
          />
          <RunbookLinksPanel
            title="Operational follow-through"
            eyebrow="Apply This"
            intro="Use the runbook that matches the failed control-loop state."
            items={PROTOCOL_RUNBOOKS}
          />
        </div>

        <div className="mb-16">
          <KnowledgeCheckCard check={PROTOCOL_CHECK} moduleId="protocols" />
        </div>

        <div className="mb-16 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-cyan-300">
              Decision Closeout
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">Frame the control-loop decision</h3>
            <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5 text-sm leading-relaxed text-slate-300">
              “The right transport conversation is really a control-model conversation: which signal
              appears first, how fast the endpoints or fabric react, and whether the design relies on
              brief containment or late-stage rescue.”
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-300">
              Next Architecture Lens
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">Next decision</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              Once the control-loop story is clear, the next move is not more acronym memorization. It is deciding whether the root problem is path distribution, workload geometry, or architecture posture. Go next to <span className="font-semibold text-white">Architecture Patterns</span> or back to <span className="font-semibold text-white">Communication Patterns</span> if the hotspot geometry is still unclear.
            </p>
            <button
              onClick={() => toggleMastered('protocols')}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70 ${
                isMastered
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20'
              }`}
            >
              {isMastered ? 'Transport lens reviewed' : 'Mark transport lens reviewed'}
            </button>
          </div>
        </div>

        <SoWhatCallout
          title="Decision Rule"
          body="Name the workload symptom, prove whether ECN leads PFC, verify DCQCN/CNP reaction, then decide whether the next change is threshold, PFC scope, endpoint behavior, or path distribution."
        />

      </div>
    </section>
  );
};

const ControlLoopStepCard: React.FC<{
  step: string;
  title: string;
  detail: string;
  tone: 'blue' | 'amber' | 'emerald' | 'red';
}> = ({ step, title, detail, tone }) => {
  const toneClass = {
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-100',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-100',
    emerald: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100',
    red: 'border-red-500/20 bg-red-500/10 text-red-100',
  }[tone];

  return (
    <div className={`rounded-xl border p-4 ${toneClass}`}>
      <div className="mb-3 flex items-start gap-3">
        <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.18em]">
          {step}
        </div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
      </div>
      <p className="text-sm leading-relaxed">{detail}</p>
    </div>
  );
};

export default ProtocolsSection;
