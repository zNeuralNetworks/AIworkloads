import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GLOSSARY,
  PRODUCTS,
  FUTURE_IMPROVEMENTS,
  DEFAULT_APP_CONFIG,
  DEFAULT_HOME_MODULES,
  PERFORMANCE_DATA,
  FAILOVER_DATA,
  PROTOCOL_CONCEPTS,
  SCALING_CONCEPTS,
  CORE_CONCEPTS,
  COMPARISON_TABLE,
  HPC_CHECKLIST_DEFAULT,
} from '../constants';
import {
  ProductData,
  AppConfig,
  HomeModule,
  ChartData,
  FeedbackItem,
  ScalingConcept,
  ConceptData,
  ComparisonRow,
  ProtocolConcept,
  HPCItem,
} from '../types';
import { usePersistedReducer } from '../hooks/usePersistedReducer';
import { safeSetItem, safeSetItemImmediate } from '../utils/safeStorage';
import { loadState } from '../utils/loadState';

/**
 * DataContext Architecture
 *
 * This context acts as a "Client-Side CMS".
 * 1. Initialization: It loads data from LocalStorage if available.
 * 2. Fallback: If no data exists (or version mismatch), it falls back to `constants.ts`.
 * 3. Persistence: Any changes made via the Admin Dashboard are saved to LocalStorage.
 *
 * This allows the Admin to edit the site live in the browser without a real backend database.
 */

interface DataContextType {
  // Global Config
  appConfig: AppConfig;
  updateAppConfig: (config: AppConfig) => void;

  // Home Page
  homeModules: HomeModule[];
  updateHomeModules: (modules: HomeModule[]) => void;

  // Glossary Module
  glossary: Record<string, string>;
  updateGlossary: (newGlossary: Record<string, string>) => void;

  // Architecture Patterns Domain
  scalingConcepts: ScalingConcept[];
  updateScalingConcepts: (data: ScalingConcept[]) => void;

  // Data Movement Domain (RDMA / RoCEv2 / NVMe-oF)
  coreConcepts: ConceptData[];
  updateCoreConcepts: (data: ConceptData[]) => void;

  // Transport & Congestion Domain
  protocolConcepts: ProtocolConcept[];
  updateProtocolConcepts: (data: ProtocolConcept[]) => void;

  // Transport Tradeoffs Domain
  comparisonTable: ComparisonRow[];
  updateComparisonTable: (data: ComparisonRow[]) => void;

  // Performance Implications Domain
  performanceData: ChartData[];
  failoverData: ChartData[];
  updatePerformanceData: (data: ChartData[]) => void;
  updateFailoverData: (data: ChartData[]) => void;

  // Platform Considerations Domain
  products: ProductData[];
  updateProducts: (newProducts: ProductData[]) => void;

  // Scientific Workflow Context Domain
  hpcChecklist: HPCItem[];
  updateHpcChecklist: (data: HPCItem[]) => void;

  // Improvements / Roadmap Domain
  futureImprovements: typeof FUTURE_IMPROVEMENTS;
  updateFutureImprovements: (newImprovements: typeof FUTURE_IMPROVEMENTS) => void;

  // Feedback
  feedbackList: FeedbackItem[];
  submitFeedback: (item: Omit<FeedbackItem, 'id' | 'timestamp'>) => void;
  deleteFeedback: (id: string) => void;

  // System
  resetToDefaults: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);
const APP_SCHEMA_VERSION = '3.10';

type PerformanceAction =
  | { type: 'performanceDataUpdated'; payload: ChartData[] }
  | { type: 'failoverDataUpdated'; payload: ChartData[] };

type ProtocolAction = { type: 'protocolsUpdated'; payload: ProtocolConcept[] };
type HpcAction = { type: 'hpcChecklistUpdated'; payload: HPCItem[] };
type ScalingAction = { type: 'scalingConceptsUpdated'; payload: ScalingConcept[] };
type CoreConceptsAction = { type: 'coreConceptsUpdated'; payload: ConceptData[] };
type ComparisonAction = { type: 'comparisonTableUpdated'; payload: ComparisonRow[] };

interface PerformanceState {
  performanceData: ChartData[];
  failoverData: ChartData[];
}

interface ProtocolState {
  protocolConcepts: ProtocolConcept[];
}

interface HpcState {
  hpcChecklist: HPCItem[];
}

interface ScalingState {
  scalingConcepts: ScalingConcept[];
}

interface CoreConceptsState {
  coreConcepts: ConceptData[];
}

interface ComparisonState {
  comparisonTable: ComparisonRow[];
}

const performanceReducer = (
  state: PerformanceState,
  action: PerformanceAction
): PerformanceState => {
  switch (action.type) {
    case 'performanceDataUpdated':
      return { ...state, performanceData: action.payload };
    case 'failoverDataUpdated':
      return { ...state, failoverData: action.payload };
    default:
      return state;
  }
};

const protocolReducer = (state: ProtocolState, action: ProtocolAction): ProtocolState => {
  switch (action.type) {
    case 'protocolsUpdated':
      return { ...state, protocolConcepts: action.payload };
    default:
      return state;
  }
};

const hpcReducer = (state: HpcState, action: HpcAction): HpcState => {
  switch (action.type) {
    case 'hpcChecklistUpdated':
      return { ...state, hpcChecklist: action.payload };
    default:
      return state;
  }
};

const scalingReducer = (state: ScalingState, action: ScalingAction): ScalingState => {
  switch (action.type) {
    case 'scalingConceptsUpdated':
      return { ...state, scalingConcepts: action.payload };
    default:
      return state;
  }
};

const coreConceptsReducer = (
  state: CoreConceptsState,
  action: CoreConceptsAction
): CoreConceptsState => {
  switch (action.type) {
    case 'coreConceptsUpdated':
      return { ...state, coreConcepts: action.payload };
    default:
      return state;
  }
};

const comparisonReducer = (state: ComparisonState, action: ComparisonAction): ComparisonState => {
  switch (action.type) {
    case 'comparisonTableUpdated':
      return { ...state, comparisonTable: action.payload };
    default:
      return state;
  }
};


export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state using the safe loader
  const [glossary, setGlossary] = useState<Record<string, string>>(() =>
    loadState('app_glossary', GLOSSARY, APP_SCHEMA_VERSION)
  );
  const [products, setProducts] = useState<ProductData[]>(() =>
    loadState('app_products', PRODUCTS, APP_SCHEMA_VERSION)
  );
  const [futureImprovements, setFutureImprovements] = useState<typeof FUTURE_IMPROVEMENTS>(() =>
    loadState('app_future', FUTURE_IMPROVEMENTS, APP_SCHEMA_VERSION)
  );
  const [appConfig, setAppConfig] = useState<AppConfig>(() =>
    loadState('app_config', DEFAULT_APP_CONFIG, APP_SCHEMA_VERSION)
  );
  const [homeModules, setHomeModules] = useState<HomeModule[]>(() =>
    loadState('app_home_modules', DEFAULT_HOME_MODULES, APP_SCHEMA_VERSION)
  );
  const [performanceState, dispatchPerformance] = usePersistedReducer<
    PerformanceState,
    PerformanceAction
  >(
    'app_performance_state',
    performanceReducer,
    {
      performanceData: PERFORMANCE_DATA,
      failoverData: FAILOVER_DATA,
    },
    { version: APP_SCHEMA_VERSION }
  );
  const { performanceData, failoverData } = performanceState;
  const [protocolState, dispatchProtocols] = usePersistedReducer<ProtocolState, ProtocolAction>(
    'app_protocols_state',
    protocolReducer,
    { protocolConcepts: PROTOCOL_CONCEPTS },
    { version: APP_SCHEMA_VERSION }
  );
  const { protocolConcepts } = protocolState;
  const [hpcState, dispatchHpc] = usePersistedReducer<HpcState, HpcAction>(
    'app_hpc_state',
    hpcReducer,
    { hpcChecklist: HPC_CHECKLIST_DEFAULT },
    { version: APP_SCHEMA_VERSION }
  );
  const { hpcChecklist } = hpcState;
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(() =>
    loadState('app_feedback', [], APP_SCHEMA_VERSION)
  );

  // New State for Architecture, Concepts, Comparison
  const [scalingState, dispatchScaling] = usePersistedReducer<ScalingState, ScalingAction>(
    'app_scaling_state',
    scalingReducer,
    { scalingConcepts: SCALING_CONCEPTS },
    { version: APP_SCHEMA_VERSION }
  );
  const { scalingConcepts } = scalingState;
  const [coreConceptsState, dispatchCoreConcepts] = usePersistedReducer<
    CoreConceptsState,
    CoreConceptsAction
  >(
    'app_core_concepts_state',
    coreConceptsReducer,
    { coreConcepts: CORE_CONCEPTS },
    { version: APP_SCHEMA_VERSION }
  );
  const { coreConcepts } = coreConceptsState;
  const [comparisonState, dispatchComparison] = usePersistedReducer<
    ComparisonState,
    ComparisonAction
  >(
    'app_comparison_state',
    comparisonReducer,
    { comparisonTable: COMPARISON_TABLE },
    { version: APP_SCHEMA_VERSION }
  );
  const { comparisonTable } = comparisonState;

  // Persistence Effects: Save to LocalStorage on every change
  useEffect(() => {
    safeSetItem('app_glossary', JSON.stringify(glossary));
  }, [glossary]);
  useEffect(() => {
    safeSetItem('app_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    safeSetItem('app_future', JSON.stringify(futureImprovements));
  }, [futureImprovements]);
  useEffect(() => {
    safeSetItem('app_config', JSON.stringify(appConfig));
  }, [appConfig]);
  useEffect(() => {
    safeSetItem('app_home_modules', JSON.stringify(homeModules));
  }, [homeModules]);
  useEffect(() => {
    safeSetItem('app_feedback', JSON.stringify(feedbackList));
  }, [feedbackList]);

  // Set version on mount to confirm successful load for next visit
  useEffect(() => {
    safeSetItemImmediate('app_version', APP_SCHEMA_VERSION);
  }, []);

  // Update Actions
  const updateGlossary = (val: Record<string, string>) => setGlossary(val);
  const updateProducts = (val: ProductData[]) => setProducts(val);
  const updateFutureImprovements = (val: typeof FUTURE_IMPROVEMENTS) => setFutureImprovements(val);
  const updateAppConfig = (val: AppConfig) => setAppConfig(val);
  const updateHomeModules = (val: HomeModule[]) => setHomeModules(val);
  const updatePerformanceData = (data: ChartData[]) => {
    dispatchPerformance({ type: 'performanceDataUpdated', payload: data });
  };
  const updateFailoverData = (data: ChartData[]) => {
    dispatchPerformance({ type: 'failoverDataUpdated', payload: data });
  };
  const updateProtocolConcepts = (data: ProtocolConcept[]) => {
    dispatchProtocols({ type: 'protocolsUpdated', payload: data });
  };
  const updateHpcChecklist = (data: HPCItem[]) => {
    dispatchHpc({ type: 'hpcChecklistUpdated', payload: data });
  };
  const updateScalingConcepts = (data: ScalingConcept[]) => {
    dispatchScaling({ type: 'scalingConceptsUpdated', payload: data });
  };
  const updateCoreConcepts = (data: ConceptData[]) => {
    dispatchCoreConcepts({ type: 'coreConceptsUpdated', payload: data });
  };
  const updateComparisonTable = (data: ComparisonRow[]) => {
    dispatchComparison({ type: 'comparisonTableUpdated', payload: data });
  };

  const submitFeedback = (item: Omit<FeedbackItem, 'id' | 'timestamp'>) => {
    const newItem: FeedbackItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setFeedbackList((prev) => [newItem, ...prev]);
  };

  const deleteFeedback = (id: string) => {
    setFeedbackList((prev) => prev.filter((item) => item.id !== id));
  };

  /**
   * Reset System
   * Clears LocalStorage and reloads the page to restore initial 'constants.ts' state.
   */
  const resetToDefaults = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all data to factory defaults? This cannot be undone.'
      )
    ) {
      localStorage.clear();
      safeSetItemImmediate('app_version', APP_SCHEMA_VERSION);
      window.location.reload();
    }
  };

  return (
    <DataContext.Provider
      value={{
        glossary,
        updateGlossary,
        products,
        updateProducts,
        futureImprovements,
        updateFutureImprovements,
        appConfig,
        updateAppConfig,
        homeModules,
        updateHomeModules,
        performanceData,
        updatePerformanceData,
        failoverData,
        updateFailoverData,
        protocolConcepts,
        updateProtocolConcepts,
        hpcChecklist,
        updateHpcChecklist,
        scalingConcepts,
        updateScalingConcepts,
        coreConcepts,
        updateCoreConcepts,
        comparisonTable,
        updateComparisonTable,
        feedbackList,
        submitFeedback,
        deleteFeedback,
        resetToDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
