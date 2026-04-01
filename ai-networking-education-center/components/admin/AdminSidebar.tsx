
import React from 'react';
import { 
  Layout, Layers, Network, Server, Database, 
  BarChart2, FileText, Settings, RotateCcw, LogOut,
  Cpu, GitCompare, Box
} from 'lucide-react';

export type AdminTab = 'config' | 'layout' | 'glossary' | 'products' | 'performance' | 'protocols' | 'hpc' | 'future' | 'architecture' | 'concepts' | 'comparison';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onReset: () => void;
}

const NavButton: React.FC<{ label: string, icon: any, active: boolean, onClick: () => void }> = ({ label, icon: Icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-3 ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
  >
    <Icon size={18} className={active ? 'text-white' : 'text-slate-500'} />
    {label}
  </button>
);

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, onLogout, onReset }) => {
  return (
    <div className="w-72 bg-[#0d1117] border-r border-white/5 flex flex-col overflow-y-auto">
      <nav className="p-4 space-y-8 flex-1">
        
        <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase px-3 mb-2 tracking-wider">General</div>
            <NavButton icon={Layout} label="Global Config" active={activeTab === 'config'} onClick={() => setActiveTab('config')} />
            <NavButton icon={Layers} label="Home Layout" active={activeTab === 'layout'} onClick={() => setActiveTab('layout')} />
        </div>

        <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase px-3 mb-2 tracking-wider">Architecture Domains</div>
            <NavButton icon={Box} label="Architecture Patterns" active={activeTab === 'architecture'} onClick={() => setActiveTab('architecture')} />
            <NavButton icon={Cpu} label="Data Movement" active={activeTab === 'concepts'} onClick={() => setActiveTab('concepts')} />
            <NavButton icon={Network} label="Transport & Congestion" active={activeTab === 'protocols'} onClick={() => setActiveTab('protocols')} />
            <NavButton icon={GitCompare} label="Transport Tradeoffs" active={activeTab === 'comparison'} onClick={() => setActiveTab('comparison')} />
            <NavButton icon={Server} label="Platform Considerations" active={activeTab === 'products'} onClick={() => setActiveTab('products')} />
            <NavButton icon={Database} label="Scientific Workflow Context" active={activeTab === 'hpc'} onClick={() => setActiveTab('hpc')} />
        </div>

        <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase px-3 mb-2 tracking-wider">Data & Analytics</div>
            <NavButton icon={BarChart2} label="Performance Implications" active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} />
            <NavButton icon={FileText} label="Glossary Terms" active={activeTab === 'glossary'} onClick={() => setActiveTab('glossary')} />
            <NavButton icon={Settings} label="Suggested Improvements" active={activeTab === 'future'} onClick={() => setActiveTab('future')} />
        </div>

      </nav>

      <div className="p-4 border-t border-white/5 space-y-2 bg-[#0d1117]">
        <button 
          onClick={onReset}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wide text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
        >
          <RotateCcw size={14} /> Factory Reset
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wide text-slate-400 hover:bg-white/5 transition-colors"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
