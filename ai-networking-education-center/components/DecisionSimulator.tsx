import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DecisionSimulatorPrompt, DecisionSimulatorResult } from '../types';
import CompactDisclosure from './CompactDisclosure';

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
  renderResultHero?: (result: DecisionSimulatorResult) => React.ReactNode;
  resultSummaryTags?: Array<{ label: string; value: string; tone?: 'blue' | 'violet' | 'emerald' | 'amber' }>;
  reasonChange?: React.ReactNode;
  interactionMode?: 'default' | 'guided';
  collapseSecondaryDetails?: boolean;
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
  renderResultHero,
  resultSummaryTags = [],
  reasonChange,
  interactionMode = 'default',
  collapseSecondaryDetails = false,
  children,
}) => {
  const [activePromptIndex, setActivePromptIndex] = React.useState(0);

  const guidedPrompt = prompts[activePromptIndex] || prompts[0];
  const selectedPromptSummary = prompts
    .map((prompt) => {
      const value = selectedValues[prompt.id];
      const option = prompt.options.find((item) => item.id === value);
      return option ? { id: prompt.id, title: prompt.title, label: option.label } : null;
    })
    .filter(Boolean) as Array<{ id: string; title: string; label: string }>;

  const handlePromptChange = (promptId: string, optionId: string) => {
    onChange(promptId, optionId);
    const promptIndex = prompts.findIndex((prompt) => prompt.id === promptId);
    if (interactionMode === 'guided' && promptIndex >= 0) {
      setActivePromptIndex(Math.min(promptIndex + 1, prompts.length - 1));
    }
  };

  return (
    <div className="rounded-xl border border-white/5 bg-[#161b22] p-6 md:p-8">
      <div className="mb-6">
        <div className="mb-2 text-xs font-mono uppercase tracking-[0.16em] text-blue-400">{eyebrow}</div>
        <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-400">{intro}</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          {interactionMode === 'guided' ? (
            <>
              <div className="rounded-2xl border border-white/5 bg-[#0d1117] p-5">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">
                    Guided classifier
                  </div>
                  <div className="text-xs text-slate-500">
                    {selectedPromptSummary.length}/{prompts.length} traits selected
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {prompts.map((prompt, index) => {
                    const isActiveStep = index === activePromptIndex;
                    const selected = selectedPromptSummary.find((item) => item.id === prompt.id);
                    return (
                      <button
                        key={prompt.id}
                        type="button"
                        onClick={() => setActivePromptIndex(index)}
                        className={`relative rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 ${
                          isActiveStep
                            ? 'border-violet-500/30'
                            : 'border-white/5 bg-white/5 hover:border-white/15'
                        }`}
                      >
                        {isActiveStep && (
                          <motion.div
                            layoutId="step-glow"
                            className="absolute inset-0 rounded-xl bg-violet-500/10"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                        <div className="relative z-10">
                          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">
                            Step {index + 1}
                          </div>
                          <div className="mt-1 text-sm font-semibold text-white">{prompt.title}</div>
                          {selected ? (
                            <div className="mt-1 text-xs text-slate-400">{selected.label}</div>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {guidedPrompt && (
                <div key={guidedPrompt.id} className="rounded-2xl border border-white/5 bg-[#0d1117] p-5">
                  <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-violet-300">
                    Choose traits
                  </div>
                  <div className="mb-2 text-lg font-bold text-white">{guidedPrompt.title}</div>
                  <p className="mb-4 text-sm leading-relaxed text-slate-300">{guidedPrompt.prompt}</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {guidedPrompt.options.map((option) => {
                      const isActive = selectedValues[guidedPrompt.id] === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          onClick={() => handlePromptChange(guidedPrompt.id, option.id)}
                          className={`rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 ${
                            isActive
                              ? 'border-violet-500/30 bg-violet-500/10 shadow-[0_0_0_1px_rgba(167,139,250,0.14)]'
                              : 'border-white/5 bg-white/5 hover:border-white/15 hover:bg-white/[0.07]'
                          }`}
                        >
                          <div className="text-sm font-semibold text-white">{option.label}</div>
                          <div className="mt-2 text-sm leading-relaxed text-slate-400">{option.description}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            prompts.map((prompt) => (
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
                        onClick={() => handlePromptChange(prompt.id, option.id)}
                        className={
                          prompt.layout === 'tiles'
                            ? `rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 ${
                                isActive
                                  ? 'border-blue-500/30 bg-blue-500/10 shadow-[0_0_0_1px_rgba(59,130,246,0.08)]'
                                  : 'border-white/5 bg-white/5 hover:border-white/15'
                              }`
                            : `rounded-full border px-3.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 ${
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
            ))
          )}

          {children}
        </div>

        <div className="rounded-xl border border-white/5 bg-[#0b1020] p-6">
          <div className="mb-5 flex flex-wrap gap-2">
            {results.map((result) => {
              const isActive = result.id === activeResult.id;
              return (
                <motion.button
                  key={result.id}
                  onClick={() => onSelectResult?.(result.id)}
                  className={`relative rounded-full border px-3 py-1.5 text-xs font-mono uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70 ${
                    isActive
                      ? 'border-blue-500/30 text-blue-300'
                      : 'border-white/10 bg-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="profile-tab-glow"
                      className="absolute inset-0 rounded-full bg-blue-500/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{result.title}</span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
          <motion.div
            key={activeResult.id}
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-blue-300">Active profile</div>
              <h4 className="text-2xl font-bold text-white">{activeResult.recommendedPosture}</h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">{activeResult.summary}</p>
              {resultSummaryTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {resultSummaryTags.map((tag) => (
                    <span
                      key={`${tag.label}-${tag.value}`}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        tag.tone === 'violet'
                          ? 'border-violet-500/20 bg-violet-500/10 text-violet-200'
                          : tag.tone === 'emerald'
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                            : tag.tone === 'amber'
                              ? 'border-amber-500/20 bg-amber-500/10 text-amber-200'
                              : 'border-blue-500/20 bg-blue-500/10 text-blue-200'
                      }`}
                    >
                      {tag.label}: {tag.value}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {renderResultHero && (
              <div className="mb-5">
                {renderResultHero(activeResult)}
              </div>
            )}

            {reasonChange ? <div className="mb-5">{reasonChange}</div> : null}

            <div className="mb-5">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-300">Explore what breaks first</div>
              <ResultBlock label="What fails first" value={activeResult.whatFailsFirst} tone="amber" />
            </div>

            {renderVisual && (
              <div className="mb-5 rounded-2xl border border-white/5 bg-[#111827] p-5">
                {renderVisual(activeResult)}
              </div>
            )}

            <CompactDisclosure
              eyebrow="Show reasoning"
              title="Open the full profile reasoning"
              summary="Why it fits, tradeoffs, and telemetry."
              defaultOpen={!collapseSecondaryDetails}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <ResultBlock label="Why it fits" value={activeResult.whyItFits} />
                <ListBlock label="Tradeoffs" items={activeResult.tradeoffs} tone="amber" />
                <ListBlock
                  label="Telemetry watchpoints"
                  items={activeResult.telemetry.map((item) => `${item.label}: ${item.signal}`)}
                  tone="cyan"
                />
              </div>
            </CompactDisclosure>

            {(activeResult.runbookLinks?.length || activeResult.plannerTrigger || activeResult.misconception || activeResult.nextSteps?.length) && (
              <div className="mt-5">
                <CompactDisclosure
                  eyebrow="Next actions"
                  title="Open the operational and planning bridges"
                  summary="Runbooks, architecture checks, and planning boundary."
                  defaultOpen={!collapseSecondaryDetails}
                >
                  <div className="grid gap-4 lg:grid-cols-2">
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
                </CompactDisclosure>
              </div>
            )}
          </motion.div>
          </AnimatePresence>
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
