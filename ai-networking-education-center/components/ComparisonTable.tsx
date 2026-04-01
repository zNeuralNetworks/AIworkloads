
import React from 'react';
import { useData } from '../contexts/DataContext';
import { Check, X, ShieldCheck } from 'lucide-react';

const ComparisonTable: React.FC = () => {
  const { comparisonTable } = useData();

  return (
    <section id="uec" className="py-32 bg-[#0F1117] border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
                <div className="text-emerald-500 font-mono text-xs uppercase tracking-widest mb-4">Domain · Transport Tradeoffs</div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Transport Tradeoffs</h2>
                <p className="text-slate-400 max-w-2xl">
                    Tradeoff view across transport models for reliability, ordering, and congestion behavior.
                </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span className="text-emerald-400 font-mono text-xs font-bold uppercase">UEC 1.0 Compliant</span>
            </div>
        </div>

        <div className="bg-[#161b22] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0d1117] border-b border-white/5">
                  <th className="p-6 text-slate-500 font-mono text-xs uppercase tracking-wider w-1/3">Feature Criterion</th>
                  <th className="p-6 text-red-400 font-mono text-xs uppercase tracking-wider border-l border-white/5 w-1/3">Traditional Lossless Protocols (InfiniBand)</th>
                  <th className="p-6 text-emerald-400 font-mono text-xs uppercase tracking-wider bg-emerald-500/5 border-l border-emerald-500/20 w-1/3">Ultra Ethernet (UEC)</th>
                </tr>
              </thead>
              <tbody>
                {(comparisonTable || []).map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                        <div className="text-slate-200 font-bold mb-1">{row.feature}</div>
                    </td>
                    <td className="p-6 border-l border-white/5">
                      <div className="flex items-start gap-3">
                          <div className="mt-1 w-4 h-4 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                             <X size={10} className="text-red-500" />
                          </div>
                          <span className="text-slate-400 text-sm leading-relaxed">{row.legacy}</span>
                      </div>
                    </td>
                    <td className="p-6 border-l border-emerald-500/20 bg-emerald-500/[0.02]">
                      <div className="flex items-start gap-3">
                          <div className="mt-1 w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                             <Check size={10} className="text-emerald-400" />
                          </div>
                          <span className="text-emerald-100 text-sm font-medium leading-relaxed">{row.pinnacle}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
