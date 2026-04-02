import React, { useState } from 'react';
import { AlertTriangle, BookCheck, Check, ChevronDown, ChevronRight, ClipboardList, Copy, Gauge, Network, Terminal, Workflow } from 'lucide-react';
import {
  OPERATIONS_RUNBOOKS,
  OPERATIONS_PRINCIPLES,
  OPERATIONS_MIGRATION_ROWS,
  OPERATIONS_CHECKS,
} from '../constants';

const SEVERITY_STYLES: Record<string, string> = {
  Critical: 'bg-red-500/10 text-red-300 border-red-500/20',
  'High Priority': 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  'Medium Priority': 'bg-blue-500/10 text-blue-300 border-blue-500/20',
};

const SEVERITY_FILTER_STYLES: Record<string, string> = {
  All: 'bg-slate-700 text-slate-200',
  Critical: 'bg-red-500/20 text-red-300 border-red-500/30',
  'High Priority': 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'Medium Priority': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

/** Extract the CLI command text before the " — " description separator. */
const extractCommand = (text: string): string => {
  const sep = text.indexOf(' — ');
  return sep >= 0 ? text.slice(0, sep) : text;
};

const OperationsPlaybooksSection: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = (command: string, key: string) => {
    navigator.clipboard.writeText(command).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const filteredRunbooks = OPERATIONS_RUNBOOKS.filter(
    b => severityFilter === 'All' || b.severity === severityFilter,
  );

  const severityOrder: Record<string, number> = { Critical: 0, 'High Priority': 1, 'Medium Priority': 2 };
  const sortedRunbooks = [...filteredRunbooks].sort(
    (a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3),
  );

  return (
    <section id="operations" className="py-32 bg-[#0F1117] border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start gap-6">
          <div>
            <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4">Domain · Operational Runbooks</div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Operations Playbooks</h2>
            <p className="text-slate-400 max-w-3xl">
              Turn networking concepts into repeatable day-2 operations with vendor-neutral design principles,
              incident runbooks, and migration decision guidance.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-blue-300 text-xs font-mono uppercase tracking-wide whitespace-nowrap">
            <BookCheck size={14} /> Implementation Ready
          </div>
        </div>

        {/* Design Principles */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          {OPERATIONS_PRINCIPLES.map((item) => (
            <div key={item.title} className="bg-[#161b22] border border-white/5 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-blue-300 mb-3">
                <Network size={14} />
                <span className="text-xs font-mono uppercase">Vendor-Neutral Principle</span>
              </div>
              <h3 className="text-lg text-white font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Severity Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider mr-1">Filter:</span>
          {(['All', 'Critical', 'High Priority', 'Medium Priority'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-full text-xs font-mono border transition-all ${
                severityFilter === sev
                  ? `${SEVERITY_FILTER_STYLES[sev]} border-current`
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500 font-mono">{sortedRunbooks.length} runbook{sortedRunbooks.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Runbooks — collapsed quick-reference cards, expand on click */}
        <div className="space-y-4 mb-10">
          {sortedRunbooks.map((book) => {
            const isExpanded = expandedIds.has(book.id);
            return (
              <article key={book.id} className="bg-[#161b22] border border-white/5 rounded-2xl overflow-hidden">
                {/* Quick-reference header — always visible */}
                <button
                  onClick={() => toggleExpanded(book.id)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-white/3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`shrink-0 text-[10px] font-mono uppercase px-2 py-1 rounded-full border ${
                        SEVERITY_STYLES[book.severity] ?? 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                      }`}
                    >
                      {book.severity}
                    </span>
                    <h3 className="text-white font-semibold text-sm truncate">{book.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:block text-xs text-slate-500 max-w-[240px] truncate">
                      {book.symptom.slice(0, 80)}{book.symptom.length > 80 ? '…' : ''}
                    </span>
                    {isExpanded
                      ? <ChevronDown size={16} className="text-slate-500" />
                      : <ChevronRight size={16} className="text-slate-500" />
                    }
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-4 text-sm">
                    <p className="text-slate-300">
                      <span className="text-blue-300 font-semibold inline-flex items-center gap-1">
                        <AlertTriangle size={12} /> Symptom:
                      </span>{' '}
                      {book.symptom}
                    </p>

                    <p className="text-slate-400">
                      <span className="text-purple-300 font-semibold">Root Cause: </span>
                      {book.rootCause}
                    </p>

                    <div>
                      <p className="text-blue-300 font-semibold inline-flex items-center gap-1 mb-2">
                        <Gauge size={12} /> Telemetry to Inspect:
                      </p>
                      <ul className="space-y-2">
                        {book.inspect.map((item, i) => {
                          const copyKey = `${book.id}-${i}`;
                          const command = extractCommand(item.text);
                          const isCopied = copiedKey === copyKey;
                          return (
                            <li key={i} className="flex items-start gap-2 text-slate-400">
                              {item.eosSpecific ? (
                                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                                  <span
                                    className="inline-flex items-center gap-1 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                    title="Arista EOS-specific CLI"
                                  >
                                    <Terminal size={8} /> EOS
                                  </span>
                                  <button
                                    onClick={() => handleCopy(command, copyKey)}
                                    title="Copy command"
                                    className={`inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all ${
                                      isCopied
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-white/5 text-slate-500 border-white/10 hover:text-slate-300 hover:border-white/20'
                                    }`}
                                  >
                                    {isCopied ? <><Check size={8} /> Copied!</> : <><Copy size={8} /> Copy</>}
                                  </button>
                                </div>
                              ) : (
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                              )}
                              <span>{item.text}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div>
                      <p className="text-emerald-300 font-semibold inline-flex items-center gap-1 mb-2">
                        <Workflow size={12} /> Corrective Actions:
                      </p>
                      <ol className="space-y-1.5 text-slate-400 list-none">
                        {book.actions.map((action, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="shrink-0 text-emerald-500 font-mono text-xs mt-0.5">{i + 1}.</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Migration Decision Matrix */}
        <div className="bg-[#161b22] border border-white/5 rounded-2xl p-6 mb-10 overflow-x-auto">
          <h3 className="text-xl text-white font-semibold mb-4 inline-flex items-center gap-2">
            <ClipboardList size={18} /> Migration Decision Matrix
          </h3>
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left border-b border-white/10 text-slate-300">
                <th className="py-3 pr-4">Current Profile</th>
                <th className="py-3 pr-4">Recommended Path</th>
                <th className="py-3">Why</th>
              </tr>
            </thead>
            <tbody>
              {OPERATIONS_MIGRATION_ROWS.map((row) => (
                <tr key={row.profile} className="border-b last:border-b-0 border-white/5 text-slate-400 align-top">
                  <td className="py-3 pr-4">{row.profile}</td>
                  <td className="py-3 pr-4 text-slate-200">{row.recommendation}</td>
                  <td className="py-3">{row.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Module Check */}
        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-3">Module Check (Quick Self-Assessment)</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            {OPERATIONS_CHECKS.map((check) => (
              <li key={check} className="flex gap-2">
                <span className="text-emerald-400">✓</span>
                {check}
              </li>
            ))}
          </ul>
        </div>

        {/* Handoff CTA */}
        <div className="mt-8 bg-[#0d1117] border border-emerald-500/20 rounded-2xl p-6">
          <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 mb-2">Planner Handoff</div>
          <p className="text-sm text-slate-300 leading-relaxed">
            After validating operational implications and risk posture, proceed to Optics Master /
            AI Cluster Planner for quantitative implementation outputs and sizing.
          </p>
        </div>
      </div>
    </section>
  );
};

export default OperationsPlaybooksSection;
