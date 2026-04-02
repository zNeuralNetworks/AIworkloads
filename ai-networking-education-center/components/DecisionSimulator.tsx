import React from 'react';
import { motion } from 'framer-motion';
import type { DecisionSimulatorPrompt, DecisionSimulatorResult } from '../types';

interface DecisionSimulatorProps {
  eyebrow?: string;
  title: string;
  intro: string;
  prompts: DecisionSimulatorPrompt[];
  selectedValues: Record<string, string>;
  onChange: (promptId: string, optionId: string) => void;
  results: DecisionSimulatorResult[];
  activeResult: DecisionSimulatorResult;
  onSelectResult?: (resultId: string) => void;
  renderVisual?: (result: DecisionSimulatorResult) => React.ReactNode;
  children?: React.ReactNode;
}

const DecisionSimulator: React.FC<DecisionSimulatorProps> = ({
  eyebrow = 'Decision Simulator',
  title,
  intro,
  prompts,
  selectedValues,
  onChange,
  results,
  activeResult,
  onSelectResult,
  renderVisual,
  children,
}) => {
  return (
    <div className="rounded-[28px] border border-white/5 bg-[#161b22] p-6 md:p-8">
      <div className="mb-8">
        <div className="mb-2 text-xs font-mono uppercase tracking-[0.24em] text-blue-400">{eyebrow}</div>
        <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-400">{intro}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="rounded-2xl border border-white/5 bg-[#0d1117] p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                {prompt.title}
              </div>
              <p className="mb-4 text-sm leading-relaxed text-slate-300">{prompt.prompt}</p>
              <div className={prompt.layout === 'tiles' ? 'grid gap-3 sm:grid-cols-2' : 'flex flex-wrap gap-2'}>
                {prompt.options.map((option) => {
                  const isActive = selectedValues[prompt.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => onChange(prompt.id, option.id)}
                      className={
                        prompt.layout === 'tiles'
                          ? `rounded-2xl border p-4 text-left transition-all ${
                              isActive
                                ? 'border-blue-500/30 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.08)]'
                                : 'border-white/5 bg-white/5 hover:border-white/15'
                            }`
                          : `rounded-full border px-3.5 py-2 text-left transition-all ${
                              isActive
                                ? 'border-blue-500/30 bg-blue-500/10 text-blue-200'
                                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                            }`
                      }
                    >
                      <div className={`font-medium ${prompt.layout === 'tiles' ? 'text-sm text-white' : 'text-xs uppercase tracking-[0.16em]'}`}>
                        {option.label}
                      </div>
                      <div className={`${prompt.layout === 'tiles' ? 'mt-2 text-sm leading-relaxed text-slate-400' : 'mt-1 text-xs leading-relaxed text-slate-400 max-w-[18rem]'}`}>
                        {option.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {children}
        </div>

        <div className="rounded-[24px] border border-white/5 bg-[#0b1020] p-6">
          <div className="mb-5 flex flex-wrap gap-2">
            {results.map((result) => {
              const isActive = result.id === activeResult.id;
              return (
                <button
                  key={result.id}
                  onClick={() => onSelectResult?.(result.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-mono uppercase tracking-[0.18em] transition-all ${
                    isActive
                      ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                      : 'border-white/10 bg-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300'
                  }`}
                >
                  {result.title}
                </button>
              );
            })}
          </div>

          <motion.div
            key={activeResult.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="mb-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-blue-400">Recommended posture</div>
              <h4 className="text-2xl font-bold text-white">{activeResult.recommendedPosture}</h4>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{activeResult.summary}</p>
            </div>

            {renderVisual && (
              <div className="mb-5 rounded-2xl border border-white/5 bg-[#111827] p-5">
                {renderVisual(activeResult)}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <ResultBlock label="Why it fits" value={activeResult.whyItFits} />
              <ResultBlock label="What fails first" value={activeResult.whatFailsFirst} tone="amber" />
              <ListBlock label="Tradeoffs" items={activeResult.tradeoffs} tone="amber" />
              <ListBlock
                label="Telemetry watchpoints"
                items={activeResult.telemetry.map((item) => `${item.label}: ${item.signal}`)}
                tone="cyan"
              />
            </div>

            {(activeResult.runbookLinks?.length || activeResult.plannerTrigger || activeResult.misconception || activeResult.nextSteps?.length) && (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {activeResult.runbookLinks && activeResult.runbookLinks.length > 0 && (
                  <div className="rounded-2xl border border-white/5 bg-[#111827] p-5">
                    <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-emerald-300">Operational bridge</div>
                    <div className="flex flex-wrap gap-2">
                      {activeResult.runbookLinks.map((item) => (
                        <a
                          key={item.id}
                          href={`/operations#${item.id}`}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/5"
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-white/5 bg-[#111827] p-5">
                  {activeResult.nextSteps && activeResult.nextSteps.length > 0 && (
                    <>
                      <div className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">What to do next</div>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {activeResult.nextSteps.map((step) => (
                          <span
                            key={step}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300"
                          >
                            {step}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  {activeResult.misconception && (
                    <>
                      <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-violet-300">Best next explanation</div>
                      <p className="mb-4 text-sm leading-relaxed text-slate-300">{activeResult.misconception}</p>
                    </>
                  )}
                  {activeResult.plannerTrigger && (
                    <>
                      <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-blue-300">Planner trigger</div>
                      <p className="text-sm leading-relaxed text-slate-300">{activeResult.plannerTrigger}</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const ResultBlock: React.FC<{ label: string; value: string; tone?: 'blue' | 'amber' }> = ({ label, value, tone = 'blue' }) => (
  <div className={`rounded-2xl border p-5 ${tone === 'amber' ? 'border-amber-500/15 bg-amber-500/10' : 'border-white/5 bg-[#111827]'}`}>
    <div className={`mb-2 text-[11px] font-mono uppercase tracking-[0.18em] ${tone === 'amber' ? 'text-amber-300' : 'text-slate-500'}`}>{label}</div>
    <p className="text-sm leading-relaxed text-slate-300">{value}</p>
  </div>
);

const ListBlock: React.FC<{ label: string; items: string[]; tone: 'amber' | 'cyan' }> = ({ label, items, tone }) => (
  <div className="rounded-2xl border border-white/5 bg-[#111827] p-5">
    <div className={`mb-3 text-[11px] font-mono uppercase tracking-[0.18em] ${tone === 'amber' ? 'text-amber-300' : 'text-cyan-300'}`}>{label}</div>
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-300">
          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${tone === 'amber' ? 'bg-amber-400' : 'bg-cyan-400'}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default DecisionSimulator;
