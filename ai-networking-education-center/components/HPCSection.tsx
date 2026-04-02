import React from 'react';
import { Share2, Grid, Clock, Zap, Network, GitGraph, Activity, CheckCircle2 } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import type { HPCItem } from '../types';
import { ICON_MAP, VALIDATION_PHASES } from '../constants';
import SourceBadge from './SourceBadge';
import { claimText, hasSourceMetadata } from '../utils/sourceClaims';

const HPCSection: React.FC = () => {
  const { hpcChecklist } = useData();

  return (
    <section id="hpc" className="py-32 bg-[#0F1117] border-t border-white/5">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-20 flex flex-col items-center text-center">
          <div className="text-emerald-500 font-mono text-xs uppercase tracking-widest mb-4">
            Domain · Scientific Workflow Context
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Scientific Workflow Context</h2>
          <p className="text-slate-400 max-w-3xl mx-auto text-lg leading-relaxed">
            Both live in the family of "extreme throughput, low-latency distributed compute," but
            they diverge in traffic shape, sensitivity, and failure tolerance.
          </p>
        </div>

        {/* The Core Similarity */}
        <div className="bg-[#161b22] rounded-2xl p-8 border border-white/5 mb-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          <h3 className="text-xl font-bold text-white mb-8">The Core Similarity</h3>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {[
              'Massive East-West Bandwidth',
              'Microsecond-Level Latency',
              'Lossless Behavior',
              'Deterministic Performance',
              'Scaling to Thousands of Nodes',
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-[#0d1117] px-4 py-3 rounded-lg border border-white/10 text-slate-300 shadow-sm hover:border-emerald-500/30 transition-colors"
              >
                <div className="w-4 h-4 rounded-full border border-emerald-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="font-mono text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 border-b border-white/5 pb-4">
          <h3 className="text-2xl font-bold text-white mb-2">The Big Differences</h3>
          <p className="text-slate-500 text-sm font-mono uppercase">
            Deep dive into Traffic, Congestion, and Topology
          </p>
        </div>

        {/* 1. Traffic Pattern Visuals */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* AI Side */}
          <div className="bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-1 bg-gradient-to-r from-blue-700 to-blue-400 opacity-20"></div>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-blue-400 font-mono text-xs uppercase tracking-wider mb-2">
                    Traffic Pattern
                  </div>
                  <h3 className="text-2xl font-bold text-white">All-to-All Collective</h3>
                </div>
                <div className="p-3 bg-blue-900/20 rounded-lg text-blue-400">
                  <Share2 size={24} />
                </div>
              </div>
              {/* Visual: Mesh */}
              <div
                className="h-48 bg-[#0d1117] rounded-xl border border-white/5 mb-8 relative overflow-hidden flex items-center justify-center group"
                role="img"
                aria-label="Diagram of All-to-All collective communication. Nodes arranged in a circle with mesh connections indicating every GPU talks to every other GPU."
              >
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                <div className="relative w-40 h-40">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10"
                      style={{
                        top: `${50 + 35 * Math.sin(i * 1.25)}%`,
                        left: `${50 + 35 * Math.cos(i * 1.25)}%`,
                      }}
                    ></div>
                  ))}
                  <svg className="absolute inset-0 w-full h-full opacity-40">
                    <path
                      d="M20,50 L80,50 M20,50 L50,20 M20,50 L50,80"
                      stroke="#60a5fa"
                      strokeWidth="1"
                      className="animate-pulse"
                    />
                    <path
                      d="M80,50 L50,20 M80,50 L50,80"
                      stroke="#60a5fa"
                      strokeWidth="1"
                      className="animate-pulse delay-75"
                    />
                    <path
                      d="M50,20 L50,80"
                      stroke="#60a5fa"
                      strokeWidth="1"
                      className="animate-pulse delay-150"
                    />
                  </svg>
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start text-sm text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                  <span>
                    <strong className="text-white">Heavy Sync:</strong> Every GPU talks to every
                    other GPU (All-Reduce).
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* HPC Side */}
          <div className="bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-1 bg-gradient-to-r from-amber-500 to-amber-700 opacity-20"></div>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-amber-500 font-mono text-xs uppercase tracking-wider mb-2">
                    Traffic Pattern
                  </div>
                  <h3 className="text-2xl font-bold text-white">Domain Specific</h3>
                </div>
                <div className="p-3 bg-amber-900/20 rounded-lg text-amber-500">
                  <Grid size={24} />
                </div>
              </div>
              {/* Visual: Grid */}
              <div
                className="h-48 bg-[#0d1117] rounded-xl border border-white/5 mb-8 relative overflow-hidden flex items-center justify-center group"
                role="img"
                aria-label="Diagram of Domain Specific communication. Nodes arranged in a grid indicating structured, nearest-neighbor traffic patterns."
              >
                <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"></div>
                <div className="grid grid-cols-4 gap-4 p-4">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-amber-600 rounded-sm"></div>
                  ))}
                </div>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start text-sm text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                  <span>
                    <strong className="text-white">Structured:</strong> Nearest-neighbor or
                    predictable grid patterns.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Congestion & Completion Time */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* AI Side */}
          <div className="bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-1 bg-gradient-to-r from-blue-700 to-blue-400 opacity-20"></div>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-blue-400 font-mono text-xs uppercase tracking-wider mb-2">
                    Completion Time
                  </div>
                  <h3 className="text-2xl font-bold text-white">The "Straggler" Effect</h3>
                </div>
                <div className="p-3 bg-blue-900/20 rounded-lg text-blue-400">
                  <Clock size={24} />
                </div>
              </div>

              {/* Visual: Barrier Sync */}
              <div className="h-40 bg-[#0d1117] rounded-xl border border-white/5 mb-8 relative flex items-center px-8 gap-4">
                <div className="absolute right-12 h-full w-1 bg-white/20 border-r border-dashed border-white/30"></div>
                <div className="absolute right-12 top-4 text-[10px] text-slate-500 font-mono rotate-90 origin-top-right">
                  BARRIER
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  {/* Fast Jobs */}
                  <div className="h-2 w-[80%] bg-blue-500/50 rounded-full relative"></div>
                  <div className="h-2 w-[82%] bg-blue-500/50 rounded-full relative"></div>
                  <div className="h-2 w-[79%] bg-blue-500/50 rounded-full relative"></div>
                  {/* Straggler */}
                  <div className="h-2 w-[40%] bg-red-500 rounded-full relative animate-pulse flex items-center">
                    <span className="absolute left-full ml-2 text-[10px] text-red-400 font-bold whitespace-nowrap">
                      Straggler!
                    </span>
                  </div>
                </div>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-4 items-start text-sm text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                  <span>
                    <strong className="text-white">Barrier Sync:</strong> If GPU 4 is slow, all 1024
                    GPUs wait.
                  </span>
                </li>
                <li className="flex gap-4 items-start text-sm text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></div>
                  <span>
                    <strong className="text-white">Tail Latency:</strong> The network's 99th
                    percentile latency dictates cluster performance.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* HPC Side */}
          <div className="bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-1 bg-gradient-to-r from-amber-500 to-amber-700 opacity-20"></div>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-amber-500 font-mono text-xs uppercase tracking-wider mb-2">
                    Completion Time
                  </div>
                  <h3 className="text-2xl font-bold text-white">Graceful Tolerance</h3>
                </div>
                <div className="p-3 bg-amber-900/20 rounded-lg text-amber-500">
                  <Activity size={24} />
                </div>
              </div>

              {/* Visual: Independent Jobs */}
              <div className="h-40 bg-[#0d1117] rounded-xl border border-white/5 mb-8 relative flex items-center px-8 gap-4">
                <div className="flex-1 flex flex-col gap-3">
                  <div className="h-2 w-[90%] bg-amber-500/50 rounded-full relative">
                    <span className="absolute right-0 -top-2 text-[8px] text-amber-500">Done</span>
                  </div>
                  <div className="h-2 w-[40%] bg-amber-500/50 rounded-full relative"></div>
                  <div className="h-2 w-[70%] bg-amber-500/50 rounded-full relative"></div>
                  <div className="h-2 w-[20%] bg-amber-500/50 rounded-full relative"></div>
                </div>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-4 items-start text-sm text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                  <span>
                    <strong className="text-white">Independent Tasks:</strong> Workloads often run
                    as decoupled simulations.
                  </span>
                </li>
                <li className="flex gap-4 items-start text-sm text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                  <span>
                    <strong className="text-white">Tolerant:</strong> One slow node doesn't
                    necessarily stall the entire job.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 3. Topology & Scale */}
        <div className="grid lg:grid-cols-2 gap-8 mb-24">
          {/* AI Side */}
          <div className="bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-1 bg-gradient-to-r from-blue-700 to-blue-400 opacity-20"></div>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-blue-400 font-mono text-xs uppercase tracking-wider mb-2">
                    Topology
                  </div>
                  <h3 className="text-2xl font-bold text-white">Fat-Tree / Clos</h3>
                </div>
                <div className="p-3 bg-blue-900/20 rounded-lg text-blue-400">
                  <GitGraph size={24} />
                </div>
              </div>

              <div className="bg-[#0d1117] p-4 rounded-xl border border-white/5 mb-6 text-center">
                <div className="flex justify-center mb-2">
                  {/* Abstract Tree */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-4">
                      <div className="w-8 h-2 bg-blue-500/50 rounded"></div>
                      <div className="w-8 h-2 bg-blue-500/50 rounded"></div>
                    </div>
                    <div className="w-full h-px bg-blue-500/20"></div>
                    <div className="flex gap-2">
                      <div className="w-6 h-2 bg-slate-700 rounded"></div>
                      <div className="w-6 h-2 bg-slate-700 rounded"></div>
                      <div className="w-6 h-2 bg-slate-700 rounded"></div>
                      <div className="w-6 h-2 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-2">Optimized for Any-to-Any</p>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-4 items-start text-sm text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                  <span>
                    <strong className="text-white">Zero Oversubscription:</strong> Non-blocking
                    bandwidth is critical.
                  </span>
                </li>
                <li className="flex gap-4 items-start text-sm text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                  <span>
                    <strong className="text-white">Network Functions:</strong> Needs RoCEv2 and
                    ECN; SmartNIC/DPU offload is optional depending on deployment.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* HPC Side */}
          <div className="bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
            <div className="p-1 bg-gradient-to-r from-amber-500 to-amber-700 opacity-20"></div>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-amber-500 font-mono text-xs uppercase tracking-wider mb-2">
                    Topology
                  </div>
                  <h3 className="text-2xl font-bold text-white">Torus / Dragonfly</h3>
                </div>
                <div className="p-3 bg-amber-900/20 rounded-lg text-amber-500">
                  <Network size={24} />
                </div>
              </div>

              <div className="bg-[#0d1117] p-4 rounded-xl border border-white/5 mb-6 text-center">
                <div className="flex justify-center mb-2">
                  {/* Abstract Torus */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="w-4 h-4 border border-amber-500/50 rounded-full"></div>
                    <div className="w-4 h-4 border border-amber-500/50 rounded-full"></div>
                    <div className="w-4 h-4 border border-amber-500/50 rounded-full"></div>
                    <div className="w-4 h-4 border border-amber-500/50 rounded-full"></div>
                    <div className="w-4 h-4 border border-amber-500/50 rounded-full"></div>
                    <div className="w-4 h-4 border border-amber-500/50 rounded-full"></div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-2">
                  Optimized for Neighbor Traffic
                </p>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-4 items-start text-sm text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                  <span>
                    <strong className="text-white">Domain Mapped:</strong> Topology often mimics the
                    physical simulation (e.g., weather grid).
                  </span>
                </li>
                <li className="flex gap-4 items-start text-sm text-slate-300">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></div>
                  <span>
                    <strong className="text-white">Tech:</strong> Historically MPI + InfiniBand,
                    though converging to Ethernet.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* POC Validation Workflow */}
        <div className="mb-24">
          <div className="mb-10">
            <div className="text-emerald-500 font-mono text-xs uppercase tracking-widest mb-4">POC Validation Procedure</div>
            <h3 className="text-2xl font-bold text-white mb-3">AI Fabric Validation — 3-Phase Workflow</h3>
            <p className="text-slate-400 max-w-2xl text-sm">
              A structured 15-day procedure for validating AI fabric readiness. Run all tests in order — each phase gates the next.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {VALIDATION_PHASES.map((phase) => (
              <div key={phase.phase} className="bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <span className="text-emerald-400 font-bold text-sm">{phase.phase}</span>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{phase.title}</h4>
                    <span className="text-xs text-slate-500 font-mono">{phase.days}</span>
                  </div>
                </div>
                <ul className="p-5 space-y-3">
                  {phase.tests.map((test) => (
                    <li key={test.testId} className="flex items-start gap-3 text-sm text-slate-400">
                      <CheckCircle2 size={14} className="text-slate-600 mt-0.5 shrink-0" />
                      <span>
                        <span className="text-slate-600 font-mono text-xs mr-2">{test.testId}</span>
                        {test.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Engineer's Checklist (Pain Points) */}
        <div className="mb-24">
          <h3 className="text-2xl font-bold text-white mb-12 text-center">
            Engineer's Checklist: Addressing the Pain Points
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hpcChecklist.map((card: HPCItem, i: number) => {
              const Icon = ICON_MAP[card.iconKey] || Zap;
              return (
                <div
                  key={i}
                  className="bg-[#161b22] p-6 rounded-xl border border-white/5 hover:border-blue-500/30 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#0d1117] rounded-lg text-blue-400 group-hover:text-blue-300 group-hover:bg-blue-900/20 transition-colors">
                      <Icon size={20} />
                    </div>
                    <h4 className="font-bold text-white text-sm font-mono uppercase tracking-wide">
                      {card.title}
                    </h4>
                  </div>
                  <ul className="space-y-3">
                    {card.points.map((pt, j: number) => (
                      <li
                        key={j}
                        className="text-sm text-slate-400 flex items-start gap-2 leading-relaxed"
                        data-claim-id={hasSourceMetadata(pt) ? pt.claimId : undefined}
                      >
                        <span className="text-blue-500 mt-1.5 w-1 h-1 bg-blue-500 rounded-full shrink-0"></span>
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

        {/* Final Story */}
        <div className="bg-gradient-to-r from-blue-900/10 to-blue-700/10 rounded-2xl p-12 text-center border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest font-mono">
            The Takeaway
          </h3>
          <p className="text-2xl text-blue-100 font-serif italic max-w-4xl mx-auto leading-relaxed">
            "We accelerate distributed training by delivering stable, low-latency, congestion-aware
            fabrics that maximize GPU utilization and reduce training time."
          </p>
        </div>
      </div>
    </section>
  );
};

export default HPCSection;
