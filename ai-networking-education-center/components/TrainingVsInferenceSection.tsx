import React from 'react';
import { Cpu, BarChart2, SlidersHorizontal, AlertTriangle, ArrowRightLeft, Timer, GitBranch, Boxes, Microscope, Activity } from 'lucide-react';
import {
  WORKLOAD_PROFILES,
  WORKLOAD_DECISION_TABLE,
  WORKLOAD_DECISION_NOTES,
  WORKLOAD_MODULE_IMPLICATIONS,
  ICON_MAP,
} from '../constants';
import InfrastructureImplicationsPanel from './InfrastructureImplicationsPanel';
import SoWhatCallout from './SoWhatCallout';
import TrafficPatternLab from './TrafficPatternLab';

const FALLBACK_ICONS = {
  Activity,
  ArrowRightLeft,
  AlertTriangle,
  BarChart2,
  Boxes,
  Cpu,
  GitBranch,
  Microscope,
  SlidersHorizontal,
  Timer,
};

const TrainingVsInferenceSection: React.FC = () => {
  return (
    <section id="training-vs-inference" className="border-t border-white/5 bg-slate-900 py-32">
      <div className="container mx-auto px-6">
        <div className="mb-20 flex flex-col items-center text-center">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-violet-500">
            Domain · Workload Types
          </div>
          <h2 className="mb-6 text-3xl font-bold text-white md:text-5xl">Workload Types</h2>
          <p className="max-w-4xl text-lg leading-relaxed text-slate-400">
            The first architecture decision is not protocol selection. It is identifying what kind of
            workload the network is actually serving, because traffic direction, burst behavior, and
            failure signatures change materially across pre-training, fine-tuning, inference, and
            scientific workflow profiles.
          </p>
        </div>

        <div className="mb-10">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-violet-500">
            Profile Taxonomy
          </div>
          <h3 className="mb-8 text-2xl font-bold text-white">Choose the workload before you choose the fabric posture</h3>
        </div>

        <div className="mb-20 grid gap-6 lg:grid-cols-2">
          {WORKLOAD_PROFILES.map((profile) => {
            const Icon =
              ICON_MAP[profile.iconKey] ||
              FALLBACK_ICONS[profile.iconKey as keyof typeof FALLBACK_ICONS] ||
              Cpu;

            return (
              <div
                key={profile.id}
                className="rounded-2xl border border-white/5 bg-[#161b22] p-7 transition-colors hover:border-violet-500/20"
              >
                <div className="mb-5 flex items-start gap-4">
                  <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">{profile.title}</h4>
                    <p className="mt-1 text-xs font-mono uppercase tracking-[0.2em] text-violet-400">
                      {profile.subtitle}
                    </p>
                  </div>
                </div>

                <p className="mb-6 text-sm leading-relaxed text-slate-400">{profile.summary}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
                    <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Dominant Traffic
                    </div>
                    <p className="text-sm text-slate-300">{profile.dominantTraffic}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
                    <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Burstiness
                    </div>
                    <p className="text-sm text-slate-300">{profile.burstiness}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
                    <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Latency / Jitter
                    </div>
                    <p className="text-sm text-slate-300">{profile.latencySensitivity}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
                    <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Retransmission Tolerance
                    </div>
                    <p className="text-sm text-slate-300">{profile.retransmissionTolerance}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
                    <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Topology Sensitivity
                    </div>
                    <p className="text-sm text-slate-300">{profile.topologySensitivity}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#0d1117] p-4">
                    <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Design Posture
                    </div>
                    <p className="text-sm text-slate-300">{profile.designPosture}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-300">
                    Operational Risk
                  </div>
                  <p className="text-sm text-slate-200">{profile.operationalRisk}</p>
                </div>
              </div>
            );
          })}
        </div>

        <TrafficPatternLab />

        <div className="mb-20 overflow-x-auto">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-violet-500">
            Decision Outputs
          </div>
          <div className="min-w-[960px] overflow-hidden rounded-2xl border border-white/5">
            <div className="grid grid-cols-5 gap-px bg-white/5">
              <div className="bg-[#161b22] p-4 text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                Dimension
              </div>
              <div className="bg-[#161b22] p-4 text-sm font-bold text-blue-400">Pre-Training</div>
              <div className="bg-[#161b22] p-4 text-sm font-bold text-violet-400">Fine-Tuning</div>
              <div className="bg-[#161b22] p-4 text-sm font-bold text-emerald-400">Batch Inference</div>
              <div className="bg-[#161b22] p-4 text-sm font-bold text-teal-400">Real-Time Inference</div>
            </div>
            <div className="space-y-px bg-white/5">
              {WORKLOAD_DECISION_TABLE.map((row) => (
                <div key={row.dimension} className="grid grid-cols-5 gap-px">
                  <div className="bg-[#0d1117] p-4 text-sm font-medium text-slate-300">{row.dimension}</div>
                  <div className="bg-[#0d1117] p-4 text-sm text-slate-400">{row.preTraining}</div>
                  <div className="bg-[#0d1117] p-4 text-sm text-slate-400">{row.fineTuning}</div>
                  <div className="bg-[#0d1117] p-4 text-sm text-slate-400">{row.batchInference}</div>
                  <div className="bg-[#0d1117] p-4 text-sm text-slate-400">{row.realTimeInference}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="mb-4 text-xs font-mono uppercase tracking-[0.28em] text-violet-500">
            First Response
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {WORKLOAD_DECISION_NOTES.map((note) => {
              const Icon =
                ICON_MAP[note.iconKey] ||
                FALLBACK_ICONS[note.iconKey as keyof typeof FALLBACK_ICONS] ||
                Cpu;

              return (
                <div key={note.title} className="rounded-2xl border border-white/5 bg-[#161b22] p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-lg bg-violet-500/10 p-2 text-violet-400">
                      <Icon size={18} />
                    </div>
                    <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
                      {note.title}
                    </h4>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-400">{note.guidance}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-20">
          <InfrastructureImplicationsPanel items={WORKLOAD_MODULE_IMPLICATIONS} />
        </div>

        <SoWhatCallout body="Do not ask whether the environment is 'training or inference' and stop there. Ask which workload profile is dominant, what failure signature matters most, and which telemetry proves the fabric posture is correct before you size anything." />
      </div>
    </section>
  );
};

export default TrainingVsInferenceSection;
