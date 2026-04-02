import React, { createContext, useContext, useEffect, useState } from 'react';
import type { LearningDepth, LearningState } from '../types';
import { loadState } from '../utils/loadState';
import { safeSetItem } from '../utils/safeStorage';

const LEARNING_STATE_VERSION = '1.0';
const LEARNING_STATE_KEY = 'app_learning_state';

const DEFAULT_LEARNING_STATE: LearningState = {
  visitedModules: [],
  practicedModules: [],
  masteredModules: [],
  completedChecks: {},
  bookmarkedConcepts: [],
  selectedDepthPreference: 'how',
  selfRatedConfidence: {},
};

interface LearningContextType extends LearningState {
  markVisited: (moduleId: string) => void;
  markPracticed: (moduleId: string) => void;
  toggleMastered: (moduleId: string) => void;
  completeCheck: (checkId: string, optionId: string, moduleId?: string) => void;
  toggleBookmarkedConcept: (conceptId: string) => void;
  setDepthPreference: (depth: LearningDepth) => void;
  setConfidence: (moduleId: string, confidence: number) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

const unique = (items: string[]) => Array.from(new Set(items));

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<LearningState>(() =>
    loadState(LEARNING_STATE_KEY, DEFAULT_LEARNING_STATE, LEARNING_STATE_VERSION)
  );

  useEffect(() => {
    safeSetItem(LEARNING_STATE_KEY, JSON.stringify(state));
  }, [state]);

  const markVisited = (moduleId: string) => {
    setState((prev) => ({ ...prev, visitedModules: unique([...prev.visitedModules, moduleId]) }));
  };

  const markPracticed = (moduleId: string) => {
    setState((prev) => ({
      ...prev,
      practicedModules: unique([...prev.practicedModules, moduleId]),
      visitedModules: unique([...prev.visitedModules, moduleId]),
    }));
  };

  const toggleMastered = (moduleId: string) => {
    setState((prev) => {
      const isMastered = prev.masteredModules.includes(moduleId);
      return {
        ...prev,
        masteredModules: isMastered
          ? prev.masteredModules.filter((id) => id !== moduleId)
          : unique([...prev.masteredModules, moduleId]),
      };
    });
  };

  const completeCheck = (checkId: string, optionId: string, moduleId?: string) => {
    setState((prev) => ({
      ...prev,
      completedChecks: { ...prev.completedChecks, [checkId]: optionId },
      practicedModules: moduleId ? unique([...prev.practicedModules, moduleId]) : prev.practicedModules,
      visitedModules: moduleId ? unique([...prev.visitedModules, moduleId]) : prev.visitedModules,
    }));
  };

  const toggleBookmarkedConcept = (conceptId: string) => {
    setState((prev) => ({
      ...prev,
      bookmarkedConcepts: prev.bookmarkedConcepts.includes(conceptId)
        ? prev.bookmarkedConcepts.filter((id) => id !== conceptId)
        : unique([...prev.bookmarkedConcepts, conceptId]),
    }));
  };

  const setDepthPreference = (depth: LearningDepth) => {
    setState((prev) => ({ ...prev, selectedDepthPreference: depth }));
  };

  const setConfidence = (moduleId: string, confidence: number) => {
    setState((prev) => ({
      ...prev,
      selfRatedConfidence: { ...prev.selfRatedConfidence, [moduleId]: confidence },
    }));
  };

  return (
    <LearningContext.Provider
      value={{
        ...state,
        markVisited,
        markPracticed,
        toggleMastered,
        completeCheck,
        toggleBookmarkedConcept,
        setDepthPreference,
        setConfidence,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = (): LearningContextType => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};
