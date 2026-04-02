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

  const mainModules = MODULE_REGISTRY.filter(m => m.page === 'main');
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
          className="fixed top-0 left-0 right-0 z-40 bg-[#0F1117]/90 backdrop-blur-md border-b border-white/5"
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <div className="container mx-auto px-6 h-10 flex items-center gap-3">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Module {String(activeModule!.order).padStart(2, '0')}
            </span>
            <span className="text-slate-700 text-xs">·</span>
            <span className="text-sm font-semibold text-slate-200">{activeModule!.title}</span>
            {activeModule!.subtitle && (
              <>
                <span className="hidden sm:block text-slate-700 text-xs">—</span>
                <span className="hidden sm:block text-xs text-slate-500 truncate">{activeModule!.subtitle}</span>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyModuleHeader;
