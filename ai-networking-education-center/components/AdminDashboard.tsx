import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { X, Settings } from 'lucide-react';
import { 
  ConfigEditor, LayoutEditor, PerformanceEditor, ProtocolEditor, 
  HPCEditor, ProductsEditor, GlossaryEditor, FutureEditor,
  ArchitectureEditor, ConceptsEditor, ComparisonEditor
} from './admin/AdminEditors';
import AdminSidebar, { AdminTab } from './admin/AdminSidebar';
import AdminLogin from './admin/AdminLogin';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { 
    glossary, updateGlossary, 
    products, updateProducts, 
    futureImprovements, updateFutureImprovements, 
    appConfig, updateAppConfig,
    homeModules, updateHomeModules,
    performanceData, updatePerformanceData,
    failoverData, updateFailoverData,
    protocolConcepts, updateProtocolConcepts,
    hpcChecklist, updateHpcChecklist,
    scalingConcepts, updateScalingConcepts,
    coreConcepts, updateCoreConcepts,
    comparisonTable, updateComparisonTable,
    resetToDefaults 
  } = useData();
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('config');
  const isAuthenticated = Boolean(user);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] w-full max-w-7xl h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Admin Console</h2>
              {isAuthenticated && <p className="text-xs text-slate-500">Authenticated editorial console with local runtime editing</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-1 items-center justify-center bg-[#161b22] text-sm text-slate-400">
            Checking admin session...
          </div>
        ) : !isAuthenticated ? (
          <AdminLogin />
        ) : (
          <div className="flex-1 flex overflow-hidden">
            
            <AdminSidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onLogout={() => void signOut()}
              onReset={resetToDefaults}
            />

            {/* Main Editor View */}
            <div className="flex-1 bg-[#161b22] overflow-y-auto p-8 relative">
              <div className="max-w-5xl mx-auto pb-20">
                  {activeTab === 'config' && <ConfigEditor config={appConfig} onUpdate={updateAppConfig} />}
                  {activeTab === 'layout' && <LayoutEditor modules={homeModules} onUpdate={updateHomeModules} />}
                  
                  {activeTab === 'architecture' && <ArchitectureEditor concepts={scalingConcepts} onUpdate={updateScalingConcepts} />}
                  {activeTab === 'concepts' && <ConceptsEditor concepts={coreConcepts} onUpdate={updateCoreConcepts} />}
                  {activeTab === 'comparison' && <ComparisonEditor table={comparisonTable} onUpdate={updateComparisonTable} />}

                  {activeTab === 'glossary' && <GlossaryEditor glossary={glossary} onUpdate={updateGlossary} />}
                  {activeTab === 'products' && <ProductsEditor products={products} onUpdate={updateProducts} />}
                  {activeTab === 'performance' && <PerformanceEditor perfData={performanceData} failData={failoverData} onUpdatePerf={updatePerformanceData} onUpdateFail={updateFailoverData} />}
                  {activeTab === 'protocols' && <ProtocolEditor protocols={protocolConcepts} onUpdate={updateProtocolConcepts} />}
                  {activeTab === 'hpc' && <HPCEditor checklist={hpcChecklist} onUpdate={updateHpcChecklist} />}
                  {activeTab === 'future' && <FutureEditor data={futureImprovements} onUpdate={updateFutureImprovements} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
