
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import GlossaryTerm from './GlossaryTerm';
import { motion, AnimatePresence } from 'framer-motion';
import { ICON_MAP } from '../constants';
import { Network } from 'lucide-react';

const protocolColor = (color: string) => {
  if (color === 'blue') return { tab: 'bg-blue-600', badge: 'bg-blue-900/30 text-blue-400', icon: 'bg-blue-500/10 text-blue-400' };
  if (color === 'purple') return { tab: 'bg-purple-600', badge: 'bg-purple-900/30 text-purple-400', icon: 'bg-purple-500/10 text-purple-400' };
  return { tab: 'bg-green-600', badge: 'bg-green-900/30 text-green-400', icon: 'bg-green-500/10 text-green-400' };
};

const ProtocolsSection: React.FC = () => {
  const { protocolConcepts } = useData();
  const [activeTab, setActiveTab] = useState('roce');

  return (
    <section id="protocols" className="py-24 bg-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(30,58,138,0.1),transparent_50%)] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4">Domain · Transport & Congestion</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Transport & Congestion</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Compare transport and flow-control behavior for RoCEv2 and emerging Ultra Ethernet Transport (UET) workflows.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center mb-12">
          <div className="bg-slate-800 p-1 rounded-full border border-slate-700 flex relative z-10" role="tablist">
            {protocolConcepts.map((protocol) => {
              const Icon = ICON_MAP[protocol.iconKey] || Network;
              return (
              <button
                key={protocol.id}
                role="tab"
                aria-selected={activeTab === protocol.id}
                onClick={() => setActiveTab(protocol.id)}
                className={`relative px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 z-10 ${
                   activeTab !== protocol.id ? 'text-slate-400 hover:text-white' : 'text-white'
                }`}
              >
                {activeTab === protocol.id && (
                  <motion.div
                    layoutId="protocol-tab-bg"
                    className={`absolute inset-0 rounded-full ${protocolColor(protocol.color).tab} shadow-lg`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <Icon size={16} />
                  {protocol.title}
                </span>
              </button>
            )})}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            {protocolConcepts.map((protocol) => (
               protocol.id === activeTab ? (
                <motion.div 
                    key={protocol.id}
                    role="tabpanel"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid md:grid-cols-2 gap-12 items-center"
                >
                    {/* Left: Description */}
                    <div>
                        <motion.div
                           initial={{ opacity: 0, y: 10 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: 0.1 }}
                           className={`inline-block px-3 py-1 rounded mb-4 text-xs font-bold uppercase tracking-wide ${protocolColor(protocol.color).badge}`}>
                            {protocol.subtitle}
                        </motion.div>
                        <h3 className="text-3xl font-bold text-white mb-4">{protocol.title}</h3>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                            {protocol.description}
                        </p>
                        
                        <div className="space-y-4">
                            {protocol.mechanisms.map((mech: any, idx: number) => {
                                const MechIcon = ICON_MAP[mech.iconKey] || Network;
                                return (
                                <motion.div 
                                    key={idx} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (idx * 0.1) }}
                                    className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-slate-500 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 p-2 rounded-md ${protocolColor(protocol.color).icon}`}>
                                            <MechIcon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold mb-1">{mech.name}</h4>
                                            <p className="text-slate-400 text-sm">{mech.desc}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )})}
                        </div>
                    </div>

                    {/* Right: Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-800 rounded-2xl p-8 border border-slate-700 h-full flex items-center justify-center relative overflow-hidden"
                        role="img"
                        aria-label={
                            protocol.id === 'roce'
                            ? "Visual representation of RoCE traffic. Packets flow in a single ordered line from source to destination. A red 'PAUSE' indicator flashes, demonstrating Priority Flow Control blocking the path when congested."
                            : protocol.id === 'load-balancing'
                            ? "Visual representation of load balancing. Four paths are shown with different traffic volumes, illustrating ECMP, DLB, CLB and Packet Spraying distributing flows."
                            : "Visual representation of UET traffic. Green packets are sprayed across multiple paths simultaneously from source to destination, demonstrating high bandwidth utilization and out-of-order delivery."
                        }
                    >
                         {/* Abstract Flow Visual */}
                         {protocol.id === 'roce' ? (
                             <div className="relative w-full h-64 flex items-center justify-between px-8">
                                <div className="absolute inset-0 bg-blue-900/5 z-0"></div>
                                {/* Sender */}
                                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-blue-500 z-10">
                                    <span className="text-xs text-white">Source</span>
                                </div>
                                
                                {/* Path - In Order */}
                                <div className="flex-1 mx-4 h-2 bg-slate-700 rounded relative overflow-hidden">
                                    <div className="absolute top-0 left-0 h-full w-1/3 bg-blue-500 animate-[moveRight_2s_linear_infinite]"></div>
                                    <div className="absolute top-0 left-1/2 h-full w-1/3 bg-blue-500 animate-[moveRight_2s_linear_infinite_0.5s]"></div>
                                </div>
                                
                                {/* PFC Pause Signal */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 flex flex-col items-center animate-pulse">
                                    <span className="text-red-500 font-bold text-xs"><GlossaryTerm term="PFC">PAUSE</GlossaryTerm></span>
                                    <div className="w-0.5 h-8 bg-red-500"></div>
                                </div>

                                {/* Receiver */}
                                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-blue-500 z-10">
                                    <span className="text-xs text-white">Dest</span>
                                </div>
                             </div>
                         ) : protocol.id === 'load-balancing' ? (
                             <div className="relative w-full h-64 flex flex-col justify-center gap-3 px-8">
                                 <div className="absolute inset-0 bg-purple-900/5 z-0"></div>
                                 <div className="text-xs font-mono text-purple-400 uppercase mb-2 z-10">Path Utilization</div>
                                 {[
                                   { label: 'ECMP', pct: '72%', w: 'w-[72%]', note: 'hash collision risk' },
                                   { label: 'DLB', pct: '95%', w: 'w-[95%]', note: 'rebalanced' },
                                   { label: 'CLB', pct: '91%', w: 'w-[91%]', note: 'coordinated' },
                                   { label: 'Spraying', pct: '99%', w: 'w-[99%]', note: 'all paths used' },
                                 ].map((row, i) => (
                                   <div key={i} className="flex items-center gap-3 z-10">
                                     <span className="text-xs font-mono text-slate-400 w-16 shrink-0">{row.label}</span>
                                     <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                                       <div
                                         className="h-full bg-purple-500/70 rounded-full relative overflow-hidden"
                                         style={{ width: row.pct }}
                                       >
                                         <div className="absolute inset-0 animate-[moveRight_2s_linear_infinite] w-1/4 bg-purple-300/20 blur-sm" style={{ animationDelay: `${i * 0.3}s` }}></div>
                                       </div>
                                     </div>
                                     <span className="text-xs text-slate-500 w-24 shrink-0">{row.note}</span>
                                   </div>
                                 ))}
                             </div>
                         ) : (
                             <div className="relative w-full h-64 flex items-center justify-between px-8">
                                 <div className="absolute inset-0 bg-green-900/5 z-0"></div>
                                {/* Sender */}
                                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-green-500 z-10">
                                    <span className="text-xs text-white">Source</span>
                                </div>
                                
                                {/* Path - Sprayed */}
                                <div className="flex-1 mx-4 flex flex-col gap-2">
                                    <div className="h-1 bg-slate-700 w-full rounded relative overflow-hidden">
                                         <div className="absolute h-full w-4 bg-green-500 rounded animate-[moveRight_1s_linear_infinite]"></div>
                                    </div>
                                    <div className="h-1 bg-slate-700 w-full rounded relative overflow-hidden">
                                         <div className="absolute h-full w-4 bg-green-500 rounded animate-[moveRight_1.2s_linear_infinite_0.2s]"></div>
                                    </div>
                                    <div className="h-1 bg-slate-700 w-full rounded relative overflow-hidden">
                                         <div className="absolute h-full w-4 bg-green-500 rounded animate-[moveRight_0.9s_linear_infinite_0.5s]"></div>
                                    </div>
                                </div>

                                {/* Receiver */}
                                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-green-500 z-10">
                                    <span className="text-xs text-white">Dest</span>
                                </div>
                             </div>
                         )}
                    </motion.div>
                </motion.div>
               ) : null
            ))}
          </AnimatePresence>
        </div>
        
        {/* Style for custom animation keyframes if needed */}
        <style>{`
          @keyframes moveRight {
            0% { left: -20%; }
            100% { left: 120%; }
          }
        `}</style>

      </div>
    </section>
  );
};

export default ProtocolsSection;
