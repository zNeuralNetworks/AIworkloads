import React, { useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Boxes,
  Database,
  GitBranch,
  Network,
  Server,
} from 'lucide-react';
import { TRAFFIC_PATTERN_LAB } from '../constants';
import type { TrafficPatternLabItem } from '../types';

interface TrafficPatternLabProps {
  activePatternId?: string;
  onPatternChange?: (patternId: string) => void;
}

const PATTERN_ACCENTS: Record<string, { border: string; bg: string; text: string; chip: string }> = {
  'all-reduce': {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    chip: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  },
  'all-to-all': {
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    chip: 'bg-violet-500/15 text-violet-300 border-violet-500/20',
  },
  'parameter-server': {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    chip: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  },
  'moe-dispatch': {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    chip: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  },
  'checkpoint-burst': {
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    chip: 'bg-rose-500/15 text-rose-300 border-rose-500/20',
  },
};

function accentFor(pattern: TrafficPatternLabItem) {
  return PATTERN_ACCENTS[pattern.id] || PATTERN_ACCENTS['all-reduce'];
}

const TrafficPatternLab: React.FC<TrafficPatternLabProps> = ({ activePatternId: controlledPatternId, onPatternChange }) => {
  const [uncontrolledPatternId, setUncontrolledPatternId] = useState(TRAFFIC_PATTERN_LAB[0]?.id ?? 'all-reduce');
  const activePatternId = controlledPatternId ?? uncontrolledPatternId;

  const activePattern = useMemo(
    () => TRAFFIC_PATTERN_LAB.find((item) => item.id === activePatternId) || TRAFFIC_PATTERN_LAB[0],
    [activePatternId]
  );

  if (!activePattern) return null;

  const accent = accentFor(activePattern);

  return (
    <div className="mb-20">
      <div className="mb-10">
        <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-violet-500">
          Traffic Pattern Lab
        </div>
        <h3 className="mb-4 text-2xl font-bold text-white">
          See what the workload is actually asking the network to do
        </h3>
        <p className="max-w-3xl text-slate-400">
          Start with the traffic behavior, not the protocol name. These patterns are the reason the
          fabric needs different load-balancing, congestion, and storage posture in the first place.
        </p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-5">
        {TRAFFIC_PATTERN_LAB.map((pattern) => {
          const isActive = pattern.id === activePattern.id;
          const cardAccent = accentFor(pattern);
          return (
            <button
              key={pattern.id}
              onClick={() => {
                if (!controlledPatternId) {
                  setUncontrolledPatternId(pattern.id);
                }
                onPatternChange?.(pattern.id);
              }}
              className={`rounded-2xl border p-4 text-left transition-all ${
                isActive
                  ? `${cardAccent.border} ${cardAccent.bg}`
                  : 'border-white/5 bg-[#161b22] hover:border-white/15'
              }`}
            >
              <div className={`mb-2 text-xs font-mono uppercase tracking-[0.18em] ${
                isActive ? cardAccent.text : 'text-slate-500'
              }`}>
                Pattern
              </div>
              <h4 className="mb-2 text-base font-bold text-white">{pattern.title}</h4>
              <p className="text-sm leading-relaxed text-slate-400">{pattern.summary}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 md:p-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <div className={`mb-2 text-xs font-mono uppercase tracking-[0.22em] ${accent.text}`}>
                Guided Visual
              </div>
              <h4 className="text-2xl font-bold text-white">{activePattern.title}</h4>
            </div>
            <div className={`rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-[0.18em] ${accent.chip}`}>
              {activePattern.dominantDirection}
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-white/5 bg-[#0d1117] p-6">
            <PatternVisual pattern={activePattern} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard label="What the traffic is doing" value={activePattern.synchronizationProfile} />
            <InfoCard label="What fails first" value={activePattern.congestionRisk} />
            <InfoCard label="What to monitor first" value={activePattern.telemetry} />
            <InfoCard label="So what this means" value={activePattern.networkMeaning} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#161b22] p-6 md:p-8">
          <div className="mb-5 text-xs font-mono uppercase tracking-[0.22em] text-violet-500">
            Interpretation
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                Beginner Summary
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{activePattern.summary}</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                Topology Sensitivity
              </div>
              <p className="text-sm leading-relaxed text-slate-300">{activePattern.topologySensitivity}</p>
            </div>

            <div className="rounded-xl border border-white/5 bg-[#0d1117] p-5">
              <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                Where To Learn Next
              </div>
              <div className="flex flex-wrap gap-2">
                {['Data Movement', 'Transport & Congestion', 'Communication Patterns'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Use this sequence after the lab: identify the traffic pattern, map how data moves,
                confirm how congestion is controlled, then choose the communication and pathing posture.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-xl border border-white/5 bg-[#111827] p-4">
    <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
      {label}
    </div>
    <p className="text-sm leading-relaxed text-slate-300">{value}</p>
  </div>
);

const PatternVisual: React.FC<{ pattern: TrafficPatternLabItem }> = ({ pattern }) => {
  switch (pattern.visualType) {
    case 'all-reduce':
      return <AllReduceVisual />;
    case 'all-to-all':
      return <AllToAllVisual />;
    case 'parameter-server':
      return <ParameterServerVisual />;
    case 'moe-dispatch':
      return <MoeDispatchVisual />;
    case 'checkpoint-burst':
      return <CheckpointBurstVisual />;
    default:
      return <AllReduceVisual />;
  }
};

const AllReduceVisual: React.FC = () => (
  <div className="relative h-72">
    <div className="mb-4 text-xs font-mono uppercase tracking-[0.18em] text-blue-400">
      Synchronized Exchange
    </div>
    <div className="relative mx-auto h-52 max-w-md">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`absolute h-4 w-4 rounded-full ${
            i === 4 ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.45)]' : 'bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
          }`}
          style={{
            top: `${50 + 38 * Math.sin(i * 1.25)}%`,
            left: `${50 + 38 * Math.cos(i * 1.25)}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      <svg className="absolute inset-0 h-full w-full opacity-50">
        <path d="M70,105 L155,40 L245,58 L250,160 L125,185 Z" stroke="#60a5fa" strokeWidth="1.2" fill="none" />
        <path d="M70,105 L245,58" stroke="#60a5fa" strokeWidth="1.2" className="animate-pulse" />
        <path d="M155,40 L250,160" stroke="#60a5fa" strokeWidth="1.2" className="animate-pulse" />
        <path d="M245,58 L125,185" stroke="#60a5fa" strokeWidth="1.2" className="animate-pulse" />
        <path d="M70,105 L250,160" stroke="#60a5fa" strokeWidth="1.2" className="animate-pulse" />
      </svg>
      <div className="absolute bottom-0 right-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
        One slow rail becomes the step-time straggler
      </div>
    </div>
  </div>
);

const AllToAllVisual: React.FC = () => (
  <div className="relative h-72">
    <div className="mb-4 text-xs font-mono uppercase tracking-[0.18em] text-violet-400">
      Dense Fan-Out / Fan-In
    </div>
    <div className="grid h-52 grid-cols-2 gap-8">
      <div className="relative rounded-xl border border-white/5 bg-[#111827] p-4">
        <div className="mb-3 text-xs text-slate-500">Senders</div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 rounded bg-violet-500/25" />
          ))}
        </div>
      </div>
      <div className="relative rounded-xl border border-white/5 bg-[#111827] p-4">
        <div className="mb-3 text-xs text-slate-500">Receivers</div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 rounded bg-violet-500/25" />
          ))}
        </div>
      </div>
      <svg className="absolute inset-0 h-full w-full opacity-55">
        {[
          [24, 70, 80, 55],
          [24, 92, 84, 82],
          [24, 114, 90, 112],
          [38, 145, 88, 138],
          [48, 168, 94, 164],
          [52, 190, 100, 192],
        ].map((line, i) => (
          <path
            key={i}
            d={`M${line[0]},${line[1]} C140,${line[1] - 18} 180,${line[3] + 12} 288,${line[3]}`}
            stroke="#a78bfa"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
        ))}
      </svg>
      <div className="absolute bottom-0 right-0 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
        Entropy and path spread matter immediately
      </div>
    </div>
  </div>
);

const ParameterServerVisual: React.FC = () => (
  <div className="relative h-72">
    <div className="mb-4 text-xs font-mono uppercase tracking-[0.18em] text-emerald-400">
      Converging On Central Targets
    </div>
    <div className="grid h-52 grid-cols-[1fr_auto_1fr] items-center gap-6">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-emerald-500/15 bg-emerald-500/10 p-3 text-center text-xs text-emerald-200">
            Worker {i + 1}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <ArrowRightLeft className="text-emerald-400" />
        <ArrowRightLeft className="text-emerald-400" />
      </div>
      <div className="space-y-4">
        <div className="rounded-xl border border-emerald-500/30 bg-[#111827] p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-300">
            <Server size={16} />
            <span className="text-sm font-bold">Aggregator A</span>
          </div>
          <div className="h-3 rounded-full bg-emerald-500/35" />
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-[#111827] p-4">
          <div className="mb-2 flex items-center gap-2 text-emerald-300">
            <Server size={16} />
            <span className="text-sm font-bold">Aggregator B</span>
          </div>
          <div className="h-3 w-2/3 rounded-full bg-emerald-500/25" />
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 right-0 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
      A small target set can dominate the fabric
    </div>
  </div>
);

const MoeDispatchVisual: React.FC = () => (
  <div className="relative h-72">
    <div className="mb-4 text-xs font-mono uppercase tracking-[0.18em] text-amber-400">
      Skew-Sensitive Expert Routing
    </div>
    <div className="grid h-52 grid-cols-[1fr_auto_1fr] items-center gap-6">
      <div className="space-y-3">
        {['Token Batch A', 'Token Batch B', 'Token Batch C'].map((label) => (
          <div key={label} className="rounded-lg border border-amber-500/15 bg-amber-500/10 p-3 text-sm text-amber-200">
            {label}
          </div>
        ))}
      </div>
      <GitBranch className="text-amber-400" />
      <div className="grid grid-cols-2 gap-3">
        <ExpertCard label="Expert 1" hot />
        <ExpertCard label="Expert 2" />
        <ExpertCard label="Expert 3" hot />
        <ExpertCard label="Expert 4" />
      </div>
    </div>
    <div className="absolute bottom-0 right-0 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
      Average utilization can look fine while a few experts melt down
    </div>
  </div>
);

const ExpertCard: React.FC<{ label: string; hot?: boolean }> = ({ label, hot = false }) => (
  <div className={`rounded-xl border p-3 ${hot ? 'border-amber-400/40 bg-amber-500/20' : 'border-white/5 bg-[#111827]'}`}>
    <div className="mb-2 flex items-center gap-2 text-sm text-white">
      <Boxes size={14} className={hot ? 'text-amber-300' : 'text-slate-400'} />
      {label}
    </div>
    <div className={`h-3 rounded-full ${hot ? 'w-full bg-amber-400/70' : 'w-1/2 bg-slate-700'}`} />
  </div>
);

const CheckpointBurstVisual: React.FC = () => (
  <div className="relative h-72">
    <div className="mb-4 text-xs font-mono uppercase tracking-[0.18em] text-rose-400">
      Periodic Writeback To Storage
    </div>
    <div className="grid h-52 grid-cols-[1fr_auto_1fr] items-center gap-6">
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-rose-500/15 bg-rose-500/10 p-3 text-sm text-rose-200">
            GPU Worker {i + 1}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center gap-2 text-rose-300">
        <Network size={18} />
        <div className="text-xs font-mono uppercase tracking-[0.18em]">burst</div>
      </div>
      <div className="rounded-2xl border border-rose-500/30 bg-[#111827] p-5">
        <div className="mb-3 flex items-center gap-2 text-rose-300">
          <Database size={16} />
          <span className="font-bold">Storage Tier</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 rounded-full bg-rose-500/70" />
          <div className="h-3 rounded-full bg-rose-500/60" />
          <div className="h-3 w-5/6 rounded-full bg-rose-500/50" />
        </div>
      </div>
    </div>
    <div className="absolute bottom-0 right-0 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
      Shared storage paths can steal time from the training fabric
    </div>
  </div>
);

export default TrafficPatternLab;
