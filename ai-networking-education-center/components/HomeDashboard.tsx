import React from 'react';
import { ArrowRight, Zap, Network, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { ICON_MAP } from '../constants';
import { smoothScrollTo } from '../utils/scroll';

// Static color lookups for Tailwind classes
const COLOR_VARIANTS: Record<string, { bg: string, border: string, text: string, glow: string, ring: string, hoverBg: string }> = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'bg-blue-500/10', ring: 'text-blue-500', hoverBg: 'group-hover:bg-blue-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'bg-purple-500/10', ring: 'text-purple-500', hoverBg: 'group-hover:bg-purple-500' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', glow: 'bg-indigo-500/10', ring: 'text-indigo-500', hoverBg: 'group-hover:bg-indigo-500' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400', glow: 'bg-red-500/10', ring: 'text-red-500', hoverBg: 'group-hover:bg-red-500' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', glow: 'bg-cyan-500/10', ring: 'text-cyan-500', hoverBg: 'group-hover:bg-cyan-500' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'bg-emerald-500/10', ring: 'text-emerald-500', hoverBg: 'group-hover:bg-emerald-500' },
};

const DashboardCard: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ElementType;
  progress: number;
  href: string;
  color: string;
  index: number;
}> = ({ title, subtitle, icon: Icon, progress, href, color, index }) => {
  const styles = COLOR_VARIANTS[color] || COLOR_VARIANTS.blue;

  return (
    <motion.a 
      href={href}
      onClick={(e) => smoothScrollTo(e, href)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-[#161b22] border border-white/5 rounded-2xl p-6 overflow-hidden flex flex-col justify-between h-64 shadow-lg hover:shadow-2xl transition-shadow cursor-pointer z-20"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-colors duration-500 ${styles.glow} group-hover:bg-opacity-20`} />
      
      <div>
        <motion.div 
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border ${styles.bg} ${styles.border}`}
        >
          {Icon && <Icon className={styles.text} size={24} />}
        </motion.div>
        
        <h3 className="text-xl font-bold text-slate-100 mb-2 tracking-tight group-hover:text-white transition-colors">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed font-medium group-hover:text-slate-300 transition-colors">{subtitle}</p>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
              <svg className="w-full h-full transform -rotate-90">
                  <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-800" />
                  <motion.circle 
                    cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" 
                    initial={{ strokeDasharray: 88, strokeDashoffset: 88 }}
                    animate={{ strokeDashoffset: 88 - (88 * progress) / 100 }}
                    transition={{ duration: 1.5, delay: 0.5 + (index * 0.1), ease: "easeOut" }}
                    className={styles.ring} 
                  />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-slate-500">
                  {progress}%
              </span>
          </div>
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Decision Lens</span>
        </div>
        <motion.div 
          whileHover={{ x: 3 }}
          className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center transition-colors duration-300 ${styles.hoverBg}`}
        >
          <ArrowRight size={14} className="text-slate-400 group-hover:text-white transition-colors" />
        </motion.div>
      </div>
    </motion.a>
  );
};

const HomeDashboard: React.FC = () => {
  const { appConfig, homeModules } = useData();

  return (
    <section id="intro" className="min-h-screen bg-[#0F1117] pt-20 pb-20 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none" 
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            {appConfig.heroLabel}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            {appConfig.heroTitle} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">{appConfig.heroHighlight}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            {appConfig.heroSubtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {homeModules.map((mod, idx) => (
             <DashboardCard 
               key={mod.id}
               index={idx}
               title={mod.title}
               subtitle={mod.subtitle}
               icon={ICON_MAP[mod.iconKey] || ICON_MAP.Layers}
               progress={mod.progress}
               href={mod.href}
               color={mod.color}
             />
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-20 text-center border-t border-white/5 pt-10 relative z-30"
        >
           <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-500">
              <a href="#performance" onClick={(e) => smoothScrollTo(e, '#performance')} className="flex items-center gap-2 hover:text-blue-400 transition-colors cursor-pointer z-30">
                <Zap size={16} /> Latency & Tail Risk
              </a>
              <a href="#protocols" onClick={(e) => smoothScrollTo(e, '#protocols')} className="flex items-center gap-2 hover:text-indigo-400 transition-colors cursor-pointer z-30">
                <Network size={16} /> Lossless Control Loops
              </a>
              <a href="#etherlink" onClick={(e) => smoothScrollTo(e, '#etherlink')} className="flex items-center gap-2 hover:text-cyan-400 transition-colors cursor-pointer z-30">
                <Activity size={16} /> Topology & Path Symmetry
              </a>
           </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HomeDashboard;
