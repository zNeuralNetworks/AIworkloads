
import React from 'react';
import { TVI_COMPARISON, TVI_DESIGN_NOTES } from '../constants';
import { ICON_MAP } from '../constants';
import { Cpu } from 'lucide-react';

const TrainingVsInferenceSection: React.FC = () => {
  return (
    <section id="training-vs-inference" className="py-32 bg-slate-900 border-t border-white/5">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="mb-20 flex flex-col items-center text-center">
          <div className="text-violet-500 font-mono text-xs uppercase tracking-widest mb-4">
            Domain · Workload Types
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Workload Types</h2>
          <p className="text-slate-400 max-w-3xl mx-auto text-lg leading-relaxed">
            Training and inference clusters share hardware families but diverge sharply in traffic pattern,
            latency requirements, and fabric design. Getting this distinction wrong leads to over-provisioning
            or SLO misses.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="mb-20 overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-px bg-white/5 rounded-xl overflow-hidden mb-px">
              <div className="bg-[#161b22] p-4 text-xs font-mono text-slate-500 uppercase tracking-wider">
                Dimension
              </div>
              <div className="bg-[#161b22] p-4">
                <div className="text-cyan-400 font-bold text-sm">Training Cluster</div>
                <div className="text-xs text-slate-500 font-mono mt-1">All-Reduce / Collective Ops</div>
              </div>
              <div className="bg-[#161b22] p-4">
                <div className="text-violet-400 font-bold text-sm">Inference Cluster</div>
                <div className="text-xs text-slate-500 font-mono mt-1">Request Fan-in / Fan-out</div>
              </div>
            </div>

            {/* Rows */}
            <div className="space-y-px">
              {TVI_COMPARISON.map((row, i) => (
                <div key={i} className="grid grid-cols-3 gap-px bg-white/5">
                  <div className="bg-[#0d1117] p-4">
                    <span className="text-slate-400 text-sm font-medium">{row.dimension}</span>
                  </div>
                  <div className="bg-[#0d1117] p-4">
                    <span className="text-slate-300 text-sm">{row.training}</span>
                  </div>
                  <div className="bg-[#0d1117] p-4">
                    <span className="text-slate-300 text-sm">{row.inference}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Design Notes */}
        <div className="mb-12">
          <div className="text-violet-500 font-mono text-xs uppercase tracking-widest mb-4">Design Notes</div>
          <h3 className="text-2xl font-bold text-white mb-8">Key Design Decisions</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {TVI_DESIGN_NOTES.map((note, i) => {
            const Icon = ICON_MAP[note.iconKey] || Cpu;
            return (
              <div
                key={i}
                className="bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden hover:border-violet-500/20 transition-colors"
              >
                <div className="p-5 border-b border-white/5 flex items-center gap-3">
                  <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                    <Icon size={18} />
                  </div>
                  <h4 className="text-white font-bold text-sm">{note.title}</h4>
                </div>
                <div className="grid grid-cols-2 divide-x divide-white/5">
                  <div className="p-5">
                    <div className="text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">Training</div>
                    <p className="text-slate-400 text-sm leading-relaxed">{note.training}</p>
                  </div>
                  <div className="p-5">
                    <div className="text-violet-400 font-mono text-xs uppercase tracking-wider mb-2">Inference</div>
                    <p className="text-slate-400 text-sm leading-relaxed">{note.inference}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Takeaway */}
        <div className="bg-gradient-to-r from-cyan-900/10 to-violet-900/10 rounded-2xl p-12 text-center border border-white/10">
          <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest font-mono">
            The Design Principle
          </h3>
          <p className="text-2xl text-slate-200 font-serif italic max-w-4xl mx-auto leading-relaxed">
            "Training clusters optimize for collective throughput and JCT. Inference clusters optimize for
            tail latency at scale. Treat them as distinct network domains — even when they share the same
            physical infrastructure."
          </p>
        </div>

      </div>
    </section>
  );
};

export default TrainingVsInferenceSection;
