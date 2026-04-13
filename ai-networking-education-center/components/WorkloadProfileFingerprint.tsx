import React from 'react';
import { motion } from 'framer-motion';

interface WorkloadProfileFingerprintProps {
  values: Record<string, string>;
}

const LABELS: Record<string, string> = {
  synchronizationIntensity: 'Synchronization',
  latencySensitivity: 'Latency',
  storageCoupling: 'Storage',
  objective: 'Objective',
};

const SCORES: Record<string, Record<string, number>> = {
  synchronizationIntensity: { low: 1, medium: 2, high: 3 },
  latencySensitivity: { throughput: 1, balanced: 2, tail: 3 },
  storageCoupling: { low: 1, moderate: 2, high: 3 },
  objective: { throughput: 1, completion: 2, response: 3 },
};

const VALUE_LABELS: Record<string, string> = {
  high: 'HIGH', medium: 'MED', low: 'LOW',
  tail: 'TAIL', balanced: 'BAL', throughput: 'THRU',
  moderate: 'MOD', completion: 'COMPLETION', response: 'RESPONSE',
};

const WorkloadProfileFingerprint: React.FC<WorkloadProfileFingerprintProps> = ({ values }) => (
  <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-4">
    <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500">
      Behavior fingerprint
    </div>
    <div className="space-y-3.5">
      {Object.entries(LABELS).map(([key, label]) => {
        const score = SCORES[key]?.[values[key]] ?? 1;
        const valueLabel = VALUE_LABELS[values[key]] ?? (values[key] ?? '').toUpperCase();
        return (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-300">{label}</span>
              <motion.span
                key={`${key}-${values[key]}`}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="font-mono uppercase tracking-[0.14em] text-slate-500"
              >
                {valueLabel}
              </motion.span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 3 }).map((_, index) => {
                const isActive = index < score;
                return (
                  <motion.div
                    key={`${key}-${index}`}
                    initial={false}
                    animate={{
                      scaleX: isActive ? 1 : 0.55,
                      opacity: isActive ? 1 : 0.12,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 340,
                      damping: 28,
                      delay: index * 0.045,
                    }}
                    style={{
                      transformOrigin: 'left',
                      boxShadow: isActive ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
                    }}
                    className={`h-2 rounded-full ${isActive ? 'bg-indigo-400' : 'bg-white/10'}`}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default WorkloadProfileFingerprint;
