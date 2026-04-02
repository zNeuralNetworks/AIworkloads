
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { GLOSSARY_TERM_DOMAINS } from '../constants';
import { Search, BookOpen } from 'lucide-react';

interface Props {
  initialSearch?: string;
}

const DOMAINS = [
  'All',
  'Infrastructure & Topology',
  'Data Movement & Transport',
  'Congestion & Flow Control',
  'Platform & Silicon',
  'Workload Types',
] as const;

const DOMAIN_COLORS: Record<string, string> = {
  'Infrastructure & Topology': 'text-blue-300 border-blue-500/30 bg-blue-500/10',
  'Data Movement & Transport': 'text-purple-300 border-purple-500/30 bg-purple-500/10',
  'Congestion & Flow Control': 'text-blue-300 border-blue-500/30 bg-blue-500/10',
  'Platform & Silicon': 'text-teal-300 border-teal-500/30 bg-teal-500/10',
  'Workload Types': 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
};

const GlossarySection: React.FC<Props> = ({ initialSearch = '' }) => {
  const { glossary } = useData();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeDomain, setActiveDomain] = useState<string>('All');

  // Sort terms alphabetically
  const sortedTerms = Object.keys(glossary).sort();

  // Filter terms based on search and domain
  const filteredTerms = sortedTerms.filter(term => {
    const matchesSearch =
      term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      glossary[term].toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain =
      activeDomain === 'All' || GLOSSARY_TERM_DOMAINS[term] === activeDomain;
    return matchesSearch && matchesDomain;
  });

  return (
    <section id="glossary" className="py-32 bg-[#0F1117] border-t border-white/5">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <div className="text-teal-500 font-mono text-xs uppercase tracking-widest mb-4">Domain · Glossary</div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Technical Glossary</h2>
                <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
                    Reference terminology for workload behavior, transport decisions, and infrastructure implications.
                </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Search size={18} className="text-slate-500" />
                </div>
                <input
                    type="text"
                    placeholder="Search definitions (e.g. RoCE, Radix)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#161b22] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
                />
            </div>
        </div>

        {/* Domain Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {DOMAINS.map((domain) => {
            const isActive = activeDomain === domain;
            const colorClass = domain !== 'All' ? DOMAIN_COLORS[domain] : '';
            return (
              <button
                key={domain}
                onClick={() => setActiveDomain(domain)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                  isActive
                    ? domain === 'All'
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                      : `${colorClass} border-current`
                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-slate-200'
                }`}
              >
                {domain}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-slate-500 font-mono self-center">
            {filteredTerms.length} term{filteredTerms.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Terms Grid */}
        {filteredTerms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTerms.map((term) => {
                  const domain = GLOSSARY_TERM_DOMAINS[term];
                  const domainColor = domain ? DOMAIN_COLORS[domain] : '';
                  return (
                    <div
                        key={term}
                        className="bg-[#161b22] p-6 rounded-2xl border border-white/5 hover:border-teal-500/30 transition-colors group flex flex-col"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-bold text-teal-100 group-hover:text-teal-400 transition-colors">
                                {term}
                            </h3>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-teal-500/50">
                                <BookOpen size={16} />
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed flex-1">
                            {glossary[term]}
                        </p>
                        {domain && (
                          <div className="mt-3 pt-3 border-t border-white/5">
                            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${domainColor}`}>
                              {domain}
                            </span>
                          </div>
                        )}
                    </div>
                  );
                })}
            </div>
        ) : (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-500 mb-2">No terms found{searchTerm ? ` for "${searchTerm}"` : ''}{activeDomain !== 'All' ? ` in "${activeDomain}"` : ''}</p>
                <button
                    onClick={() => { setSearchTerm(''); setActiveDomain('All'); }}
                    className="text-teal-500 text-sm hover:underline"
                >
                    Clear filters
                </button>
            </div>
        )}

      </div>
    </section>
  );
};

export default GlossarySection;
