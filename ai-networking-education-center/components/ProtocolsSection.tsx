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
import ComparisonCards from './ComparisonCards';
import QuickKnowledgeCheck from './QuickKnowledgeCheck';
import CongestionSequenceStrip from './CongestionSequenceStrip';
import { useLearning } from '../contexts/LearningContext';
import type { InfrastructureImplication, KnowledgeCheck, RunbookReference, TelemetryWatchpoint } from '../types';

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
        'Correct. The learning goal is to treat ECN as the early signal and PFC as the emergency backstop, not the primary operating mode.',
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
      rationale: 'Correct. That sequence supports a usable mental model of congestion as an early-feedback loop rather than an emergency brake.',
    },
    {
      id: 'pause-first',
      label: 'PFC pause dominating the queue',
      rationale: 'That indicates PFC is still being read as the primary control loop, which is the wrong causal model.',
    },
  ],
};

const CONTROL_LOOP_COMPARISON = [
  {
    title: 'ECN Leading',
    subtitle: 'Healthy early feedback',
    summary: 'Marks appear before the queue is exhausted, endpoints react, and pause stays exceptional.',
    bullets: ['Good mental model: early signal', 'Implies bounded queue growth'],
    tone: 'blue' as const,
  },
  {
    title: 'PFC Dominating',
    subtitle: 'Late rescue mode',
    summary: 'Pause becomes the visible control mechanism because the loop is already late.',
    bullets: ['Good warning sign', 'Usually means thresholds or endpoint response need work'],
    tone: 'red' as const,
  },
  {
    title: 'UET Promise',
    subtitle: 'Changed transport model',
    summary: 'Loss tolerance changes transport assumptions, but it does not remove the need for good pathing and control posture.',
    bullets: ['Do not oversell protocol magic', 'Still ask what fails first'],
    tone: 'emerald' as const,
  },
];

const PROTOCOL_LEARNING_SEQUENCE = [
  {
    step: '1',
    title: 'Start from the symptom',
    detail: 'Variance, pause spread, or incast tells you what congestion question to ask first.',
  },
  {
    step: '2',
    title: 'Read the control-loop order',
    detail: 'ECN should appear before sustained pause. Endpoint response should happen before link-level rescue dominates.',
  },
  {
    step: '3',
    title: 'Locate where the loop breaks',
    detail: 'Identify whether the failure is in thresholds, pathing, endpoint reaction, or hotspot geometry.',
  },
  {
    step: '4',
    title: 'Only then compare transports',
    detail: 'RoCEv2 and UET are meaningful after the control model is clear.',
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
            Compare transport and flow-control behavior for RoCEv2 and emerging Ultra Ethernet Transport (UET) workflows.
          </p>
        </div>

        <div className="mb-10">
          <DepthPreferenceTabs value={selectedDepthPreference} onChange={setDepthPreference} />
        </div>

        <div className="mb-12">
          <ComparisonCards
            eyebrow="Control Loop By Contrast"
            title="Use contrast to reduce transport complexity"
            intro="The reference does not require every transport detail at once. A few strong contrasts explain what a healthy loop looks like and what a broken one looks like."
            items={CONTROL_LOOP_COMPARISON}
          />
        </div>

        <div className="mb-12 grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">
              Why This Matters
            </div>
            <h3 className="mb-4 text-2xl font-bold text-white">Congestion loops are teaching moments</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              Protocol debates become useful only when you can connect them to the actual workload
              symptom, telemetry, and recovery path. The goal is not memorizing acronyms. The goal
              is reading what the fabric is telling you.
            </p>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100">
              <div className="mb-1 font-semibold">What users usually get wrong</div>
              They treat sustained PFC as proof the lossless design is working, instead of reading it
              as a sign that endpoint response or threshold posture may already be late.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-400">
              Core Mental Model
            </div>
            <h3 className="mb-4 text-2xl font-bold text-white">Teach the congestion loop in a fixed order</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {PROTOCOL_LEARNING_SEQUENCE.map((item) => (
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
          </div>
        </div>

        {activeTrafficPattern && (
          <div className="mb-12 rounded-2xl border border-blue-500/15 bg-blue-500/10 p-4 text-sm text-blue-100">
            This module is inheriting the active traffic-pattern lens from the earlier learning flow. The default protocol view is biased toward the kind of congestion question that pattern usually creates.
          </div>
        )}

        <div className="mb-12">
          <QuickKnowledgeCheck check={PROTOCOL_MICRO_CHECK} moduleId="protocols" />
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800 p-1 rounded-full border border-slate-700 flex relative z-10" role="tablist">
            {protocolConcepts.map((protocol) => {
              const Icon = ICON_MAP[protocol.iconKey] || Network;
              return (
              <button
                key={protocol.id}
                role="tab"
                aria-selected={activeTab === protocol.id}
                onClick={() => setActiveTab(protocol.id)}
                className={`relative px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 z-10 ${
                   activeTab !== protocol.id ? 'text-slate-400 hover:text-white' : 'text-white'
                }`}
              >
                {activeTab === protocol.id && (
                  <motion.div
                    layoutId="protocol-tab-bg"
                    className={`absolute inset-0 rounded-full ${protocolColor(protocol.color).tab} shadow-lg`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon size={16} />
                  {protocol.title}
                </span>
              </button>
            )})}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {protocolConcepts.map((protocol) => (
               protocol.id === activeTab ? (
                <motion.div 
                    key={protocol.id}
                    role="tabpanel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid md:grid-cols-2 gap-12 items-center"
                >
                    {/* Left: Description */}
                    <div>
                        <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.1 }}
                           className={`inline-block px-3 py-1 rounded mb-4 text-xs font-bold uppercase tracking-wide ${protocolColor(protocol.color).badge}`}>
                            {protocol.subtitle}
                        </motion.div>
                        <h3 className="text-3xl font-bold text-white mb-4">{protocol.title}</h3>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                            {protocol.description}
                        </p>
                        
                        <div className="space-y-4">
                            {protocol.mechanisms.map((mech: any, idx: number) => {
                                const MechIcon = ICON_MAP[mech.iconKey] || Network;
                                return (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (idx * 0.1) }}
                                    className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-md ${protocolColor(protocol.color).icon}`}>
                                            <MechIcon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-1">{mech.name}</h4>
                                            <p className="text-slate-400 text-sm">{mech.desc}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )})}
                        </div>
                    </div>

                    {/* Right: Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-800 rounded-2xl p-8 border border-slate-700 h-full flex items-center justify-center relative overflow-hidden"
                        role="img"
                        aria-label={
                            protocol.id === 'roce'
                            ? "Visual representation of RoCE traffic. Packets flow in a single ordered line from source to destination. A red 'PAUSE' indicator flashes, demonstrating Priority Flow Control blocking the path when congested."
                            : protocol.id === 'load-balancing'
                            ? "Visual representation of load balancing. Four paths are shown with different traffic volumes, illustrating ECMP, DLB, CLB and Packet Spraying distributing flows."
                            : "Visual representation of UET traffic. Green packets are sprayed across multiple paths simultaneously from source to destination, demonstrating high bandwidth utilization and out-of-order delivery."
                        }
                    >
                         {/* Abstract Flow Visual */}
                         {protocol.id === 'roce' ? (
                             <div className="relative w-full h-64 flex items-center justify-between px-8">
                                <div className="absolute inset-0 bg-blue-900/5 z-0"></div>
                                {/* Sender */}
                                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-blue-500 z-10">
                                    <span className="text-xs text-white">Source</span>
                                </div>
                                
                                {/* Path - In Order */}
                                <div className="flex-1 mx-4 h-2 bg-slate-700 rounded relative overflow-hidden">
                                    <div className="absolute top-0 left-0 h-full w-1/3 bg-blue-500 animate-[moveRight_2s_linear_infinite]"></div>
                                    <div className="absolute top-0 left-1/2 h-full w-1/3 bg-blue-500 animate-[moveRight_2s_linear_infinite_0.5s]"></div>
                                </div>
                                
                                {/* PFC Pause Signal */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 flex flex-col items-center animate-pulse">
                                    <span className="text-red-500 font-bold text-xs"><GlossaryTerm term="PFC">PAUSE</GlossaryTerm></span>
                                    <div className="w-0.5 h-8 bg-red-500"></div>
                                </div>

                                {/* Receiver */}
                                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-blue-500 z-10">
                                    <span className="text-xs text-white">Dest</span>
                                </div>
                             </div>
                         ) : protocol.id === 'load-balancing' ? (
                             <div className="relative w-full h-64 flex flex-col justify-center gap-3 px-8">
                                 <div className="absolute inset-0 bg-purple-900/5 z-0"></div>
                                 <div className="text-xs font-mono text-purple-400 uppercase mb-2 z-10">Path Utilization</div>
                                 {[
                                   { label: 'ECMP', pct: '72%', w: 'w-[72%]', note: 'hash collision risk' },
                                   { label: 'DLB', pct: '95%', w: 'w-[95%]', note: 'rebalanced' },
                                   { label: 'CLB', pct: '91%', w: 'w-[91%]', note: 'coordinated' },
                                   { label: 'Spraying', pct: '99%', w: 'w-[99%]', note: 'all paths used' },
                                 ].map((row, i) => (
                                   <div key={i} className="flex items-center gap-3 z-10">
                                     <span className="text-xs font-mono text-slate-400 w-16 shrink-0">{row.label}</span>
                                     <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                                       <div
                                         className="h-full bg-purple-500/70 rounded-full relative overflow-hidden"
                                         style={{ width: row.pct }}
                                       >
                                         <div className="absolute inset-0 animate-[moveRight_2s_linear_infinite] w-1/4 bg-purple-300/20 blur-sm" style={{ animationDelay: `${i * 0.3}s` }}></div>
                                       </div>
                                     </div>
                                     <span className="text-xs text-slate-500 w-24 shrink-0">{row.note}</span>
                                   </div>
                                 ))}
                             </div>
                         ) : (
                             <div className="relative w-full h-64 flex items-center justify-between px-8">
                                 <div className="absolute inset-0 bg-green-900/5 z-0"></div>
                                {/* Sender */}
                                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-green-500 z-10">
                                    <span className="text-xs text-white">Source</span>
                                </div>
                                
                                {/* Path - Sprayed */}
                                <div className="flex-1 mx-4 flex flex-col gap-2">
                                    <div className="h-1 bg-slate-700 w-full rounded relative overflow-hidden">
                                         <div className="absolute h-full w-4 bg-green-500 rounded animate-[moveRight_1s_linear_infinite]"></div>
                                    </div>
                                    <div className="h-1 bg-slate-700 w-full rounded relative overflow-hidden">
                                         <div className="absolute h-full w-4 bg-green-500 rounded animate-[moveRight_1.2s_linear_infinite_0.2s]"></div>
                                    </div>
                                    <div className="h-1 bg-slate-700 w-full rounded relative overflow-hidden">
                                         <div className="absolute h-full w-4 bg-green-500 rounded animate-[moveRight_0.9s_linear_infinite_0.5s]"></div>
                                    </div>
                                </div>

                                {/* Receiver */}
                                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-green-500 z-10">
                                    <span className="text-xs text-white">Dest</span>
                                </div>
                             </div>
                         )}
                    </motion.div>
                </motion.div>
               ) : null
            ))}
          </AnimatePresence>
        </div>
        
        {/* Style for custom animation keyframes if needed */}
        <style>{`
          @keyframes moveRight {
            0% { left: -20%; }
            100% { left: 120%; }
          }
        `}</style>

        <div className="mt-24">
          <div className="mb-10 text-center">
            <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4">
              Interactive Lab
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ECN and PFC Congestion Loop
            </h3>
            <p className="text-slate-400 max-w-3xl mx-auto">
              Keep the theory, but let engineers see the sequence: queue builds,{" "}
              <GlossaryTerm term="ECN">ECN</GlossaryTerm> marks first, endpoints are expected to
              react, and <GlossaryTerm term="PFC">PFC</GlossaryTerm> is the last-resort backstop
              when the feedback loop is too slow.
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
                  This simplified lab is intentionally didactic. It shows why ECN should appear
                  before sustained pause behavior, and why spreading pause is a sign the congestion
                  loop is arriving too late.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-2 rounded-lg px-5 py-3 font-bold transition-all ${
                    isPlaying
                      ? 'border border-amber-500/50 bg-amber-500/10 text-amber-500'
                      : 'bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.35)] hover:bg-green-500'
                  }`}
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                  {isPlaying ? 'Pause Sim' : 'Start Traffic'}
                </button>
                <button
                  onClick={handleBurst}
                  disabled={senderPaused}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-bold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Zap size={16} />
                  Inject Burst
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-white/10 bg-[#0d1117] p-3 text-slate-400 transition-colors hover:border-white/30 hover:text-white"
                  aria-label="Reset simulation"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between gap-6 h-72">
              <div className="w-44 bg-[#0d1117] border border-slate-700 rounded-xl p-4 flex flex-col gap-2 shadow-2xl">
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

              <div className="relative flex-1 h-40">
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

                <div className={`absolute top-4 left-1/3 rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] transition-all ${
                  ecnActive ? 'border border-amber-500/40 bg-amber-500/15 text-amber-300' : 'border border-white/5 bg-white/5 text-slate-500'
                }`}>
                  ECN Marks
                </div>
                <div className={`absolute bottom-4 right-1/3 rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] transition-all ${
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

              <div className="w-48 bg-[#0d1117] border border-slate-700 rounded-xl p-4 flex flex-col gap-2 shadow-2xl">
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
                    className={`w-full transition-all duration-100 ease-linear ${
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
                <strong className="block mb-1">1. Normal Operation</strong>
                Packets drain cleanly. The objective is not “no congestion ever,” but keeping the
                queue in a range where marks are informative and pause does not spread.
              </div>
              <div className={`rounded-lg border p-4 text-sm ${
                ecnActive
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                  : 'border-slate-700 bg-slate-800/50 text-slate-500'
              }`}>
                <strong className="block mb-1 flex items-center gap-2">
                  2. ECN Marks First {ecnActive && <AlertTriangle size={14} aria-hidden="true" />}
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

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <CongestionSequenceStrip
              ecnActive={ecnActive}
              pfcActive={pfcActive}
              senderPaused={senderPaused}
              bufferLevel={bufferLevel}
            />

            <div className="rounded-2xl border border-white/5 bg-[#161b22] p-7">
              <div className="text-xs font-mono uppercase tracking-[0.22em] text-blue-400 mb-4">
                Operational Readout
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
                  <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                    Queue State
                  </div>
                  <p className="text-sm text-slate-300">
                    {pfcActive ? 'Pause dominated' : ecnActive ? 'Marked but recoverable' : 'Below mark threshold'}
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

          {showExpertDepth && (
            <div className="mt-12">
            <div className="mb-8">
              <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4">
                Design Procedure
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                RoCEv2 Congestion Tuning
              </h3>
              <p className="text-slate-400 max-w-2xl">
                Use the lab as intuition, then move into a repeatable tuning sequence tied to the
                actual workload and telemetry.
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-4">
              {CONGESTION_PROCEDURE.map((step, idx) => (
                <div key={step.step} className="relative">
                  {idx < CONGESTION_PROCEDURE.length - 1 && (
                    <div className="hidden md:flex absolute top-6 right-0 translate-x-1/2 z-10 text-slate-600">
                      <ChevronRight size={16} />
                    </div>
                  )}
                  <div className="bg-[#161b22] rounded-xl border border-white/5 p-5 hover:border-blue-500/30 transition-colors h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center shrink-0">
                        <span className="text-blue-400 font-bold text-xs">{step.step}</span>
                      </div>
                      <h4 className="text-white font-bold text-sm">{step.title}</h4>
                    </div>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-blue-500 mt-1 shrink-0">›</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            </div>
          )}
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
            intro="These watchpoints make the transport conversation observable. If these signals are missing, the model is still too abstract."
            items={PROTOCOL_TELEMETRY}
          />
          <RunbookLinksPanel
            title="Operational follow-through"
            eyebrow="Apply This"
            intro="When transport and congestion posture turn into an incident, these runbooks are the next useful paths."
            items={PROTOCOL_RUNBOOKS}
          />
        </div>

        <div className="mb-16">
          <KnowledgeCheckCard check={PROTOCOL_CHECK} moduleId="protocols" />
        </div>

        <div className="mb-16 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-cyan-300">
              Explain It Back
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">End-of-module synthesis</h3>
            <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5 text-sm leading-relaxed text-slate-300">
              “The right transport conversation is really a control-model conversation: which signal
              appears first, how fast the endpoints or fabric react, and whether the design relies on
              brief containment or late-stage rescue.”
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6">
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-emerald-300">
              Transfer Prompt
            </div>
            <h3 className="mb-3 text-2xl font-bold text-white">Next decision</h3>
            <p className="mb-5 text-sm leading-relaxed text-slate-300">
              Once the control-loop story is clear, the next move is not more acronym memorization. It is deciding whether the root problem is path distribution, workload geometry, or architecture posture. Go next to <span className="font-semibold text-white">Architecture Patterns</span> or back to <span className="font-semibold text-white">Communication Patterns</span> if the hotspot geometry is still unclear.
            </p>
            <button
              onClick={() => toggleMastered('protocols')}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
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
          title="So What?"
          body="If the only thing you can say is that the environment is lossless or that it uses UET, you still do not have the design answer. The real answer is whether the congestion loop, pathing posture, and transport behavior match the workload symptom you are trying to explain or fix."
        />

      </div>
    </section>
  );
};

export default ProtocolsSection;
