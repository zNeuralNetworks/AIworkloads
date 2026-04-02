import React from 'react';
import type { LearningScenario } from '../types';

interface ScenarioDecisionCardsProps {
  eyebrow?: string;
  title: string;
  intro: string;
  scenarios: LearningScenario[];
}

const ScenarioDecisionCards: React.FC<ScenarioDecisionCardsProps> = ({
  eyebrow = 'Scenario Entry',
  title,
  intro,
  scenarios,
}) => {
  return (
    <div className="rounded-3xl border border-white/5 bg-[#161b22] p-6 md:p-8">
      <div className="mb-6">
        <div className="mb-2 text-xs font-mono uppercase tracking-[0.24em] text-violet-400">
          {eyebrow}
        </div>
        <h3 className="mb-3 text-2xl font-bold text-white">{title}</h3>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-400">{intro}</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {scenarios.map((scenario) => (
          <article key={scenario.title} className="rounded-2xl border border-white/5 bg-[#0d1117] p-5">
            <div className="mb-3 text-xs font-mono uppercase tracking-[0.18em] text-violet-400">
              Decision Episode
            </div>
            <h4 className="mb-3 text-lg font-bold text-white">{scenario.title}</h4>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">{scenario.prompt}</p>
            <div className="space-y-3 text-sm">
              <DecisionLine label="Traffic pattern">{scenario.dominantSignal}</DecisionLine>
              <DecisionLine label="Network behavior">{scenario.networkBehavior}</DecisionLine>
              <DecisionLine label="Infrastructure decision">{scenario.infrastructureDecision}</DecisionLine>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

const DecisionLine: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="rounded-xl border border-white/5 bg-white/5 p-3">
    <div className="mb-1 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">{label}</div>
    <div className="text-slate-200">{children}</div>
  </div>
);

export default ScenarioDecisionCards;
