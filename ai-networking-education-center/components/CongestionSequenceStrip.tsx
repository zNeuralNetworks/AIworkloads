import React from 'react';

interface CongestionSequenceStripProps {
  ecnActive: boolean;
  pfcActive: boolean;
  senderPaused: boolean;
  bufferLevel: number;
}

const CongestionSequenceStrip: React.FC<CongestionSequenceStripProps> = ({
  ecnActive,
  pfcActive,
  senderPaused,
  bufferLevel,
}) => {
  const endpointReacting = ecnActive && !pfcActive;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#161b22] p-6 md:p-8">
      <div className="mb-2 text-xs font-mono uppercase tracking-[0.22em] text-blue-400">
        Causal Sequence
      </div>
      <h3 className="mb-3 text-2xl font-bold text-white">Use a fixed diagnostic order</h3>
      <p className="mb-6 max-w-3xl text-sm leading-relaxed text-slate-400">
        Read the sequence in order: offered load rises, the switch marks early, endpoints react,
        and pause stays an emergency guardrail.
      </p>

      <div className="grid gap-4 lg:grid-cols-4">
        <SequenceCard
          step="1"
          title="Queue Growth"
          active={!ecnActive && !pfcActive}
          tone="blue"
          detail="Queue growth starts. The goal is not zero queue. The goal is bounded queue before rescue behavior dominates."
        />
        <SequenceCard
          step="2"
          title="ECN Marks"
          active={ecnActive}
          tone="amber"
          detail="Marks should appear before the receiver queue is exhausted so congestion is signaled while endpoints still have room to react."
        />
        <SequenceCard
          step="3"
          title="Endpoints React"
          active={endpointReacting}
          tone="emerald"
          detail="CNP and sender rate reduction should absorb the burst before the fabric depends on broad pause propagation."
        />
        <SequenceCard
          step="4"
          title="PFC Backstop"
          active={pfcActive || senderPaused}
          tone="red"
          detail="If this is the dominant visible state, the loop is already late. Pause should stay brief, local, and exceptional."
        />
      </div>

      <div className="mt-5 rounded-xl border border-white/5 bg-[#0d1117] p-4">
        <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
          Current congestion state
        </div>
        <p className="text-sm leading-relaxed text-slate-300">
          Buffer occupancy is <span className="font-semibold text-white">{Math.round(bufferLevel)}%</span>.{' '}
          {pfcActive || senderPaused
            ? 'The lab is currently in backstop mode, so the useful diagnosis is why early feedback and endpoint reaction were not enough.'
            : ecnActive
              ? 'The lab is currently showing early marking, which is where to look for sender reaction and containment.'
              : 'The lab is currently below mark threshold, which is the baseline state before meaningful congestion feedback begins.'}
        </p>
      </div>
    </div>
  );
};

const SequenceCard: React.FC<{
  step: string;
  title: string;
  detail: string;
  active: boolean;
  tone: 'blue' | 'amber' | 'emerald' | 'red';
}> = ({ step, title, detail, active, tone }) => {
  const toneClasses =
    tone === 'amber'
      ? active
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-100'
        : 'border-white/5 bg-[#0d1117] text-slate-300'
      : tone === 'emerald'
        ? active
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
          : 'border-white/5 bg-[#0d1117] text-slate-300'
        : tone === 'red'
          ? active
            ? 'border-red-500/30 bg-red-500/10 text-red-100'
            : 'border-white/5 bg-[#0d1117] text-slate-300'
          : active
            ? 'border-blue-500/30 bg-blue-500/10 text-blue-100'
            : 'border-white/5 bg-[#0d1117] text-slate-300';

  return (
    <div className={`rounded-2xl border p-5 transition-colors ${toneClasses}`}>
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-[0.18em]">
          Step {step}
        </div>
        <div className="text-sm font-semibold text-white">{title}</div>
      </div>
      <p className="text-sm leading-relaxed">{detail}</p>
    </div>
  );
};

export default CongestionSequenceStrip;
