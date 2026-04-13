import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveSection } from '../hooks/useActiveSection';
import { MODULE_REGISTRY } from '../app/moduleRegistry';

/**
 * StickyModuleHeader
 *
 * A thin fixed bar that slides down from the top of the viewport once the user
 * has scrolled past the hero area. Shows the current section's module number
 * and title based on IntersectionObserver active section detection.
 *
 * Only rendered on the main page (via MainPage.tsx).
 */
const StickyModuleHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  const mainModules = MODULE_REGISTRY
    .filter((m) => m.page === 'main')
    .sort((a, b) => a.order - b.order);
  const anchorIds = mainModules.map(m => m.anchorId);
  const activeId = useActiveSection(anchorIds);

  const activeModule = mainModules.find(m => m.anchorId === activeId);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const visible = scrolled && !!activeModule;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-module-header"
          className="fixed top-0 left-0 right-0 z-[60] bg-[#0F1117]/92 backdrop-blur-md border-b border-white/5"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <div className="container mx-auto grid min-h-12 grid-cols-[minmax(7rem,auto)_minmax(0,1fr)] items-center gap-3 px-5 py-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4 md:px-6 md:py-0">
            <div className="min-w-0 text-xs font-bold leading-tight tracking-tight text-white md:text-base">
              Scientific Workflow Architecture
            </div>
            <div className="flex min-w-0 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 md:gap-3 md:px-4">
              <span className="hidden text-[10px] font-mono text-slate-500 uppercase tracking-widest sm:inline">
                Module {String(activeModule!.order).padStart(2, '0')}
              </span>
              <span className="hidden text-slate-700 text-xs sm:inline">·</span>
              <span className="truncate text-sm font-semibold text-slate-100">{activeModule!.title}</span>
              {activeModule!.subtitle && (
                <>
                  <span className="hidden lg:block text-slate-700 text-xs">—</span>
                  <span className="hidden max-w-[38rem] truncate text-xs text-slate-500 lg:block">
                    {activeModule!.subtitle}
                  </span>
                </>
              )}
            </div>
            <div className="hidden md:block" aria-hidden="true" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyModuleHeader;
