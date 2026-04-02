import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { DataProvider } from './contexts/DataContext';
import { AuthProvider } from './contexts/AuthContext';
import { LearningProvider } from './contexts/LearningContext';
import { isSupabaseConfigured } from './config/supabase';
import { initializeSentry } from './services/sentry';
import ErrorBoundary from './components/ErrorBoundary';
import MainPage from './pages/MainPage';
import OperationsPage from './pages/OperationsPage';
import GlossaryPage from './pages/GlossaryPage';
import DeepDivePage from './pages/DeepDivePage';

/**
 * Root App Component
 *
 * Wraps the application in:
 * - ErrorBoundary for error catching
 * - Sentry for error tracking
 * - AuthProvider for authentication
 * - DataProvider for global state
 * - BrowserRouter for routing
 *
 * Routes:
 *   "/" — main scrollable page
 *   "/operations" — Operations Playbooks page
 *   "/glossary" — Glossary page
 *   "/deep-dive" — Protocol Deep Dive page
 *   "*" — catch-all redirects to "/"
 */

// Initialize Sentry on app load
initializeSentry();

const App: React.FC = () => {
  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured; admin authentication and sync are disabled');
    }
  }, []);

  return (
    <ErrorBoundary>
      <Sentry.ErrorBoundary fallback={<div>An error occurred</div>}>
        <AuthProvider>
          <LearningProvider>
            <DataProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/operations" element={<OperationsPage />} />
                  <Route path="/glossary" element={<GlossaryPage />} />
                  <Route path="/deep-dive" element={<DeepDivePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </DataProvider>
          </LearningProvider>
        </AuthProvider>
      </Sentry.ErrorBoundary>
    </ErrorBoundary>
  );
};

export default Sentry.withProfiler(App);
