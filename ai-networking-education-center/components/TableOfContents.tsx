import React from 'react';
import { useLocation } from 'react-router-dom';
import { MODULE_REGISTRY } from '../app/moduleRegistry';
import { useActiveSection } from '../hooks/useActiveSection';
import { smoothScrollTo } from '../utils/scroll';

const TableOfContents: React.FC = () => {
  const { pathname } = useLocation();
  const currentPage = pathname === '/operations' ? 'operations' : 'main';

  const tocItems = MODULE_REGISTRY.filter(
    (item) => item.tocVisible && item.page === currentPage
  ).sort((a, b) => a.order - b.order);

  const navIds = tocItems.map((item) => item.anchorId);
  const activeId = useActiveSection(navIds);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 z-40 bg-[#161b22]/50 backdrop-blur-sm p-3 rounded-2xl border border-white/5 shadow-2xl">
      {tocItems.map((item) => (
        <a
          key={item.id}
          href={`#${item.anchorId}`}
          onClick={(e) => smoothScrollTo(e, `#${item.anchorId}`)}
          className="group relative flex items-center justify-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
          aria-label={`Jump to ${item.title}`}
        >
          <span
            className={`absolute right-8 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono uppercase tracking-wider transition-all duration-200 ${
              activeId === item.anchorId
                ? 'opacity-100 translate-x-0 text-blue-400 border-blue-500/30'
                : 'opacity-0 translate-x-2 text-slate-500 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0'
            }`}
          >
            {item.title}
          </span>

          <div
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              activeId === item.anchorId
                ? 'bg-blue-500 scale-125 shadow-[0_0_10px_#3b82f6]'
                : 'bg-slate-700 group-hover:bg-slate-500'
            }`}
          />
        </a>
      ))}
    </div>
  );
};

export default TableOfContents;
