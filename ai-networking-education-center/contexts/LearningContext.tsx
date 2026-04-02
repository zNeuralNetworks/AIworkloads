import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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

  const markVisited = useCallback((moduleId: string) => {
    setState((prev) => {
      if (prev.visitedModules.includes(moduleId)) {
        return prev;
      }

      return { ...prev, visitedModules: unique([...prev.visitedModules, moduleId]) };
    });
  }, []);

  const markPracticed = useCallback((moduleId: string) => {
    setState((prev) => {
      const alreadyPracticed = prev.practicedModules.includes(moduleId);
      const alreadyVisited = prev.visitedModules.includes(moduleId);

      if (alreadyPracticed && alreadyVisited) {
        return prev;
      }

      return {
        ...prev,
        practicedModules: unique([...prev.practicedModules, moduleId]),
        visitedModules: unique([...prev.visitedModules, moduleId]),
      };
    });
  }, []);

  const toggleMastered = useCallback((moduleId: string) => {
    setState((prev) => {
      const isMastered = prev.masteredModules.includes(moduleId);
      return {
        ...prev,
        masteredModules: isMastered
          ? prev.masteredModules.filter((id) => id !== moduleId)
          : unique([...prev.masteredModules, moduleId]),
      };
    });
  }, []);

  const completeCheck = useCallback((checkId: string, optionId: string, moduleId?: string) => {
    setState((prev) => ({
      ...prev,
      completedChecks: { ...prev.completedChecks, [checkId]: optionId },
      practicedModules: moduleId ? unique([...prev.practicedModules, moduleId]) : prev.practicedModules,
      visitedModules: moduleId ? unique([...prev.visitedModules, moduleId]) : prev.visitedModules,
    }));
  }, []);

  const toggleBookmarkedConcept = useCallback((conceptId: string) => {
    setState((prev) => ({
      ...prev,
      bookmarkedConcepts: prev.bookmarkedConcepts.includes(conceptId)
        ? prev.bookmarkedConcepts.filter((id) => id !== conceptId)
        : unique([...prev.bookmarkedConcepts, conceptId]),
    }));
  }, []);

  const setDepthPreference = useCallback((depth: LearningDepth) => {
    setState((prev) => {
      if (prev.selectedDepthPreference === depth) {
        return prev;
      }

      return { ...prev, selectedDepthPreference: depth };
    });
  }, []);

  const setConfidence = useCallback((moduleId: string, confidence: number) => {
    setState((prev) => {
      if (prev.selfRatedConfidence[moduleId] === confidence) {
        return prev;
      }

      return {
        ...prev,
        selfRatedConfidence: { ...prev.selfRatedConfidence, [moduleId]: confidence },
      };
    });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      markVisited,
      markPracticed,
      toggleMastered,
      completeCheck,
      toggleBookmarkedConcept,
      setDepthPreference,
      setConfidence,
    }),
    [
      state,
      markVisited,
      markPracticed,
      toggleMastered,
      completeCheck,
      toggleBookmarkedConcept,
      setDepthPreference,
      setConfidence,
    ]
  );

  return (
    <LearningContext.Provider value={value}>
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
