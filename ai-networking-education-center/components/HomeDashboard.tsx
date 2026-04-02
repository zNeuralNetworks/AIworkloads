import React from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Compass, Network, NotebookPen, Route, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useLearning } from '../contexts/LearningContext';
import { ICON_MAP } from '../constants';
import { smoothScrollTo } from '../utils/scroll';
import DepthPreferenceTabs from './DepthPreferenceTabs';
import ScenarioDecisionCards from './ScenarioDecisionCards';

const DIFFICULTY_STYLES = {
  Foundation: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  Intermediate: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  Advanced: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
} as const;

const MISSION_CARDS = [
  {
    title: 'Explain workload behavior',
    body: 'Start with traffic shape, synchronization, and why the workload creates fabric pressure.',
    href: '#training-vs-inference',
    icon: Compass,
  },
  {
    title: 'Choose fabric posture',
    body: 'Map the dominant lifecycle stage to the transport, queueing, and pathing posture that matters.',
    href: '#concepts',
    icon: Route,
  },
  {
    title: 'Compare transports',
    body: 'Understand where RoCEv2 discipline matters, where UET changes the model, and what does not change.',
    href: '#protocols',
    icon: Network,
  },
  {
    title: 'Troubleshoot congestion',
    body: 'Use telemetry and worked examples to see what fails first and how to respond.',
    href: '#protocols',
    icon: ShieldAlert,
  },
  {
    title: 'Translate to infrastructure implications',
    body: 'Move from transport vocabulary to operational posture, platform choices, and design tradeoffs.',
    href: '#performance',
    icon: NotebookPen,
  },
];

const HOME_ENTRY_SCENARIOS = [
  {
    title: 'Explain a training slowdown',
    prompt: 'A customer sees step-time variance and wants to know whether the issue is congestion, pathing, or a fabric mismatch.',
    dominantSignal: 'Synchronized east-west collective traffic dominates the risk',
    networkBehavior: 'Queue timing and path distribution matter more than broad “high bandwidth” claims',
    infrastructureDecision: 'Start with workload type, then inspect data movement and congestion posture',
  },
  {
    title: 'Checkpoint windows blow up job time',
    prompt: 'The environment benchmarks well, but periodic save windows turn every incident into a long recovery story.',
    dominantSignal: 'Checkpoint and restart stages dominate operational reality',
    networkBehavior: 'Storage-coupled bursts and queue isolation matter before protocol slogans',
    infrastructureDecision: 'Treat storage behavior as part of the fabric design, not a backend footnote',
  },
  {
    title: 'Translate deep networking to customer language',
    prompt: 'You need a concise explanation that is accurate for architects but usable in a customer-facing conversation.',
    dominantSignal: 'The learner needs layered depth, not one giant expert narrative',
    networkBehavior: 'Quick take first, then mental model, then design implications',
    infrastructureDecision: 'Use the guided modules in order instead of jumping directly into the deepest section',
  },
];

const HomeDashboard: React.FC = () => {
  const { appConfig, homeModules } = useData();
  const {
    selectedDepthPreference,
    setDepthPreference,
    visitedModules,
    practicedModules,
    masteredModules,
  } = useLearning();

  const progressSummary = [
    { label: 'Visited', value: visitedModules.length, icon: BookOpen },
    { label: 'Practiced', value: practicedModules.length, icon: Compass },
    { label: 'Mastered', value: masteredModules.length, icon: CheckCircle2 },
  ];

  return (
    <section id="intro" className="min-h-screen overflow-hidden bg-[#0B1020] pb-20 pt-24 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.18),transparent_38%),linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:100%_100%,56px_56px,56px_56px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="mx-auto mb-10 max-w-5xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-blue-300">
            <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.65)]" />
            {appConfig.heroLabel}
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-[1.02] tracking-tight text-white md:text-7xl">
            Learn the infrastructure decision,
            <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              not just the acronym.
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-300 md:text-xl">
            {appConfig.heroSubtitle} This redesign starts with workload and failure mode, then helps
            you move into transport, pathing, and platform decisions at the right depth.
          </p>
        </motion.div>

        <div className="mb-12 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-3xl border border-white/5 bg-[#161b22] p-6 md:p-8">
            <div className="mb-5 text-xs font-mono uppercase tracking-[0.24em] text-cyan-300">
              What Are You Trying To Understand?
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {MISSION_CARDS.map((card, index) => (
                <motion.a
                  key={card.title}
                  href={card.href}
                  onClick={(event) => smoothScrollTo(event, card.href)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.45 }}
                  className="group rounded-2xl border border-white/5 bg-[#0d1117] p-5 transition-all hover:-translate-y-1 hover:border-blue-500/20 hover:bg-[#111827]"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-300">
                      <card.icon size={18} />
                    </div>
                    <ArrowRight size={16} className="text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                  </div>
                  <h2 className="mb-2 text-lg font-semibold text-white">{card.title}</h2>
                  <p className="text-sm leading-relaxed text-slate-400">{card.body}</p>
                </motion.a>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-[#161b22] p-6">
            <div className="mb-4 text-xs font-mono uppercase tracking-[0.24em] text-emerald-300">
              Learner Orientation
            </div>
            <div className="mb-6 space-y-3">
              {progressSummary.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/5 bg-[#0d1117] p-4">
                  <div className="mb-2 flex items-center gap-2 text-slate-400">
                    <item.icon size={14} />
                    <span className="text-xs font-mono uppercase tracking-[0.18em]">{item.label}</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{item.value}</div>
                </div>
              ))}
            </div>
            <DepthPreferenceTabs value={selectedDepthPreference} onChange={setDepthPreference} />
          </div>
        </div>

        <div className="mb-12 rounded-3xl border border-white/5 bg-gradient-to-r from-[#111827] via-[#161b22] to-[#10221c] p-6 md:p-8">
          <div className="mb-5 text-xs font-mono uppercase tracking-[0.24em] text-slate-400">
            How To Use This App
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Start with the workload',
                body: 'Classify the traffic pattern and synchronization profile before choosing protocol language.',
              },
              {
                title: 'Follow the pressure points',
                body: 'Use lifecycle stage, congestion, and telemetry cues to find what actually dominates job behavior.',
              },
              {
                title: 'Use deep dives only when needed',
                body: 'Quick take for orientation, design implication for decisions, expert depth for precise technical discussion.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/5 bg-black/20 p-5">
                <div className="mb-2 text-sm font-semibold text-white">{item.title}</div>
                <p className="text-sm leading-relaxed text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-14">
          <ScenarioDecisionCards
            eyebrow="Scenario-First Learning"
            title="Use a realistic problem to enter the learning path"
            intro="The best entry point is usually not the protocol. It is the problem statement you need to explain, design around, or troubleshoot."
            scenarios={HOME_ENTRY_SCENARIOS}
          />
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 text-xs font-mono uppercase tracking-[0.24em] text-blue-300">
              Guided Reference Path
            </div>
            <h2 className="text-2xl font-bold text-white md:text-3xl">Pick the next module with intent</h2>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono uppercase tracking-[0.18em] text-slate-400 md:block">
            One shared IA, layered depth inside each module
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {homeModules.map((module, index) => {
            const Icon = ICON_MAP[module.iconKey] || ICON_MAP.Layers;
            const difficultyClass =
              module.difficulty ? DIFFICULTY_STYLES[module.difficulty] : 'border-white/10 bg-white/5 text-slate-300';

            return (
              <motion.a
                key={module.id}
                href={module.href}
                onClick={(event) => smoothScrollTo(event, module.href)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.45 }}
                className="group rounded-3xl border border-white/5 bg-[#161b22] p-6 transition-all hover:-translate-y-1 hover:border-white/15"
              >
                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-blue-300">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{module.title}</h3>
                      <p className="text-sm text-slate-400">{module.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono uppercase tracking-[0.18em]">
                    {module.estimatedMinutes && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                        {module.estimatedMinutes} min
                      </span>
                    )}
                    {module.difficulty && (
                      <span className={`rounded-full border px-3 py-1 ${difficultyClass}`}>
                        {module.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-5">
                    <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      Why this matters
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {module.whyItMatters || module.subtitle}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-5">
                    <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                      What you will be able to explain
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {module.explainOutcome || module.subtitle}
                    </p>
                  </div>
                </div>

                {module.learningObjectives && module.learningObjectives.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {module.learningObjectives.map((objective) => (
                      <span
                        key={objective}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                      >
                        {objective}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-[0.18em] text-slate-500">
                    Guided next step
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    Open module
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomeDashboard;
