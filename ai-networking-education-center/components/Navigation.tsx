
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { NAVIGATION } from '../constants';
import type { NavItem } from '../constants/navigation';
import { useActiveSection } from '../hooks/useActiveSection';
import { motion, AnimatePresence } from 'framer-motion';
import { smoothScrollTo } from '../utils/scroll';

/**
 * Global Navigation Component
 *
 * Renders a top-left brand indicator and a floating bottom dock.
 * - On md+: existing floating pill dock with all nav items.
 * - On <md: single circular button opens a full-width bottom-sheet overlay.
 * - href-based nav items (e.g. Ops Playbooks, Glossary, Deep Dive) use <Link>.
 * - id-based nav items use scroll anchors + smoothScrollTo.
 * - On subpages (/operations, /glossary, /deep-dive), brand area shows "← Back".
 */

interface NavigationProps {
  onSearchClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onSearchClick }) => {
  const { pathname } = useLocation();
  const isOnSubpage = pathname !== '/';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const scrollIds = NAVIGATION.filter(n => !n.href).map(n => n.id);
  const scrollActiveId = useActiveSection(scrollIds);

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) {
      return pathname === item.href;
    }
    // Scroll-based active state only applies on the main page
    if (pathname !== '/') return false;
    return (scrollActiveId || 'intro') === item.id;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const renderNavItem = (item: NavItem, onSelect?: () => void) => {
    const isActive = isItemActive(item);
    const commonClass = "group relative px-3.5 py-2.5 rounded-full transition-colors flex items-center justify-center shrink-0 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1117]";

    const iconContent = (
      <>
        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 bg-blue-600 rounded-full -z-10"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <item.icon
          size={20}
          className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}
        />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-1.5 bg-[#0d1117] border border-white/10 text-xs font-mono font-bold text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl transform scale-95 group-hover:scale-100 origin-bottom">
          {item.label}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0d1117]"></div>
        </div>
      </>
    );

    if (item.href) {
      return (
        <Link
          key={item.id}
          to={item.href}
          className={commonClass}
          aria-label={item.label}
          onClick={onSelect}
        >
          {iconContent}
        </Link>
      );
    }

    return (
      <a
        key={item.id}
        href={`#${item.id}`}
        onClick={(e) => { smoothScrollTo(e, `#${item.id}`); onSelect?.(); }}
        className={commonClass}
        aria-label={item.label}
      >
        {iconContent}
      </a>
    );
  };

  const renderMobileSheetItem = (item: NavItem) => {
    const isActive = isItemActive(item);
    const commonClass = "flex flex-col items-center gap-2 rounded-xl p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70";
    const activeClass = isActive ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5";

    const inner = (
      <>
        <item.icon size={24} />
        <span className="text-xs font-mono">{item.label}</span>
      </>
    );

    if (item.href) {
      return (
        <Link
          key={item.id}
          to={item.href}
          className={`${commonClass} ${activeClass}`}
          aria-label={item.label}
          onClick={() => setMobileOpen(false)}
        >
          {inner}
        </Link>
      );
    }

    return (
      <a
        key={item.id}
        href={`#${item.id}`}
        onClick={(e) => { smoothScrollTo(e, `#${item.id}`); setMobileOpen(false); }}
        className={`${commonClass} ${activeClass}`}
        aria-label={item.label}
      >
        {inner}
      </a>
    );
  };

  return (
    <>
      {/* 1. Minimalist Top-Left Brand Indicator */}
      {isOnSubpage ? (
        <Link
          to="/"
          className="fixed top-6 left-6 z-[70] mix-blend-difference pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
        >
          <div className="text-xl font-bold tracking-tighter text-white hover:opacity-80 transition-opacity">
            ← Back
          </div>
        </Link>
      ) : !scrolled ? (
        <motion.a
          href="#intro"
          onClick={(e) => smoothScrollTo(e, '#intro')}
          className="fixed top-6 left-6 z-[70] mix-blend-difference pointer-events-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="text-xl font-bold tracking-tighter text-white hover:opacity-80 transition-opacity">
            Scientific Workflow Architecture
          </div>
        </motion.a>
      ) : null}

      {/* 2a. Floating Bottom Dock — md+ only */}
      <motion.div
        className="group/nav hidden md:block fixed bottom-[calc(env(safe-area-inset-bottom)+0.25rem)] left-1/2 z-50 w-auto max-w-[90vw] pointer-events-auto"
        initial={{ y: 100, x: "-50%", opacity: 0 }}
        animate={{ y: 0, x: "-50%", opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
      >
        <div className="translate-y-9 scale-[0.92] bg-[#161b22]/78 opacity-60 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl flex items-center gap-1.5 overflow-x-auto hide-scrollbar transition-[transform,opacity,background-color] duration-200 ease-out group-hover/nav:translate-y-0 group-hover/nav:scale-100 group-hover/nav:opacity-100 group-focus-within/nav:translate-y-0 group-focus-within/nav:scale-100 group-focus-within/nav:opacity-100 group-hover/nav:bg-[#161b22]/92 group-focus-within/nav:bg-[#161b22]/92">
          {NAVIGATION.map((item) => renderNavItem(item))}
          {onSearchClick && (
            <>
              <div className="w-px h-6 bg-white/10 shrink-0 mx-1" />
              <button
                onClick={onSearchClick}
                className="group relative px-3 py-2 rounded-full transition-colors flex items-center gap-1.5 text-slate-400 hover:text-white shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F1117]"
                aria-label="Search (⌘K)"
              >
                <Search size={16} />
                <kbd className="text-[10px] font-mono bg-white/5 px-1 rounded border border-white/10 text-slate-500">⌘K</kbd>
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* 2b. Mobile: single hamburger button — <md only */}
      <motion.button
        className="md:hidden fixed bottom-[calc(env(safe-area-inset-bottom)-2.15rem)] left-1/2 -translate-x-1/2 z-50 h-12 w-16 rounded-t-2xl rounded-b-none bg-[#161b22]/82 backdrop-blur-xl border border-b-0 border-white/10 shadow-2xl flex items-start justify-center pt-1.5 pointer-events-auto focus-visible:bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] focus-visible:rounded-full focus-visible:border-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={22} className="text-slate-300" />
      </motion.button>

      {/* 2c. Mobile bottom-sheet overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="md:hidden fixed inset-0 z-[60] bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Sheet */}
            <motion.div
              className="md:hidden fixed inset-x-0 bottom-0 z-[61] max-h-[78svh] overflow-y-auto overscroll-contain bg-[#161b22] border-t border-white/10 rounded-t-2xl p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] shadow-2xl"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-mono text-slate-400">Navigate</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70"
                  aria-label="Close navigation"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {NAVIGATION.map((item) => renderMobileSheetItem(item))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
