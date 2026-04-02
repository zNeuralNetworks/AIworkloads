import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchPalette } from '../hooks/useSearchPalette';
import { MODULE_REGISTRY } from '../app/moduleRegistry';
import { NAVIGATION } from '../constants';
import { useData } from '../contexts/DataContext';

interface SearchPaletteProps {
  palette: ReturnType<typeof useSearchPalette>;
}

type ResultItem =
  | { kind: 'section'; id: string; anchorId: string; title: string; page: string; href?: string }
  | { kind: 'glossary'; term: string; definition: string };

/**
 * SearchPalette
 *
 * Portal-rendered full-screen overlay triggered by cmd+K.
 * Searches sections (from MODULE_REGISTRY) and glossary terms.
 */
const SearchPalette: React.FC<SearchPaletteProps> = ({ palette }) => {
  const { isOpen, close, query, setQuery } = palette;
  const navigate = useNavigate();
  const { glossary } = useData();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Build results
  const sectionResults: ResultItem[] = MODULE_REGISTRY
    .filter(m =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.id.toLowerCase().includes(query.toLowerCase())
    )
    .map(m => {
      const navItem = NAVIGATION.find(n => n.id === m.id || n.id === m.anchorId);
      return {
        kind: 'section' as const,
        id: m.id,
        anchorId: m.anchorId,
        title: m.title,
        page: m.page,
        href: navItem?.href,
      };
    });

  const glossaryResults: ResultItem[] = query.trim().length > 0
    ? Object.entries(glossary)
        .filter(([term, def]) =>
          term.toLowerCase().includes(query.toLowerCase()) ||
          def.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
        .map(([term, definition]) => ({ kind: 'glossary' as const, term, definition }))
    : [];

  const allResults = [...sectionResults, ...glossaryResults];

  // Clamp focus index when results change
  useEffect(() => {
    setFocusedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSelect = useCallback((item: ResultItem) => {
    if (item.kind === 'section') {
      if (item.page === 'main') {
        // Scroll on main page — close palette and trigger scroll
        close();
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(item.anchorId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `#${item.anchorId}`);
        }, 100);
      } else {
        // Standalone page
        close();
        navigate(item.href ?? `/${item.id}`);
      }
    } else {
      // Glossary term — navigate to /glossary and pre-fill search
      sessionStorage.setItem('glossary_search', item.term);
      close();
      navigate('/glossary');
    }
  }, [close, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(i => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      const item = allResults[focusedIndex];
      if (item) handleSelect(item);
    } else if (e.key === 'Escape') {
      close();
    }
  };

  const renderItem = (item: ResultItem, index: number) => {
    const isFocused = index === focusedIndex;
    const baseClass = `w-full text-left px-4 py-3 rounded-lg flex items-start gap-3 transition-colors cursor-pointer ${
      isFocused ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5'
    }`;

    if (item.kind === 'section') {
      const navItem = NAVIGATION.find(n => n.id === item.id || n.id === item.anchorId);
      const Icon = navItem?.icon;
      return (
        <button
          key={`section-${item.id}`}
          className={baseClass}
          onClick={() => handleSelect(item)}
          onMouseEnter={() => setFocusedIndex(index)}
        >
          {Icon && <Icon size={16} className="text-slate-400 mt-0.5 shrink-0" />}
          <div>
            <div className="text-sm font-medium text-slate-200">{item.title}</div>
            <div className="text-xs text-slate-500 font-mono">
              {item.page === 'main' ? `/#${item.anchorId}` : `/${item.id}`}
            </div>
          </div>
        </button>
      );
    }

    return (
      <button
        key={`glossary-${item.term}`}
        className={baseClass}
        onClick={() => handleSelect(item)}
        onMouseEnter={() => setFocusedIndex(index)}
      >
        <div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center">
          <span className="text-slate-400 text-xs font-bold">G</span>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-slate-200">{item.term}</div>
          <div className="text-xs text-slate-500 truncate">{item.definition.slice(0, 80)}…</div>
        </div>
      </button>
    );
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* Palette */}
          <motion.div
            className="fixed inset-x-0 top-[10vh] z-[101] mx-auto max-w-xl px-4"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div
              className="bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search sections or glossary terms…"
                  className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm outline-none"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button onClick={close} className="text-slate-500 hover:text-slate-300 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {sectionResults.length > 0 && (
                  <div className="mb-2">
                    <div className="px-4 py-1.5 text-xs font-mono text-slate-500 uppercase tracking-wider">Sections</div>
                    <div className="flex flex-col gap-0.5">
                      {sectionResults.map((item, i) => renderItem(item, i))}
                    </div>
                  </div>
                )}

                {glossaryResults.length > 0 && (
                  <div>
                    <div className="px-4 py-1.5 text-xs font-mono text-slate-500 uppercase tracking-wider">Glossary</div>
                    <div className="flex flex-col gap-0.5">
                      {glossaryResults.map((item, i) => renderItem(item, i + sectionResults.length))}
                    </div>
                  </div>
                )}

                {allResults.length === 0 && query.trim().length > 0 && (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    No results for <span className="text-slate-300 font-mono">"{query}"</span>
                  </div>
                )}

                {allResults.length === 0 && query.trim().length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">
                    Start typing to search sections and glossary terms
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-xs text-slate-600">
                <span><kbd className="bg-white/5 px-1 rounded">↑↓</kbd> navigate</span>
                <span><kbd className="bg-white/5 px-1 rounded">↵</kbd> select</span>
                <span><kbd className="bg-white/5 px-1 rounded">esc</kbd> close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(content, document.body);
};

export default SearchPalette;
