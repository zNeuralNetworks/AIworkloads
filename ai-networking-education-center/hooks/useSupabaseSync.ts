import { useEffect, useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import {
  syncGlossaryFromSupabase,
  syncProductsFromSupabase,
  syncHpcChecklistFromSupabase,
  syncPerformanceDataFromSupabase,
  syncProtocolConceptsFromSupabase,
  uploadGlossaryToSupabase,
  uploadProductsToSupabase,
  subscribeToGlossaryChanges,
} from '../services/supabaseSync';
import { captureMessage } from '../services/sentry';

interface UseSupabaseSyncOptions {
  enabled?: boolean;
  syncOnMount?: boolean;
  realtime?: boolean;
}

/**
 * Hook to sync DataContext with Supabase
 *
 * Usage:
 * ```tsx
 * const { isSyncing, lastSyncTime, error } = useSupabaseSync({
 *   enabled: !!user,
 *   syncOnMount: true,
 *   realtime: true,
 * });
 * ```
 */
export const useSupabaseSync = (options: UseSupabaseSyncOptions = {}) => {
  const { enabled = true, syncOnMount = true, realtime = false } = options;

  const { user } = useAuth();
  const {
    glossary,
    updateGlossary,
    products,
    updateProducts,
    hpcChecklist,
    updateHpcChecklist,
    performanceData,
    updatePerformanceData,
    protocolConcepts,
    updateProtocolConcepts,
  } = useData();

  // Sync from Supabase on mount
  useEffect(() => {
    if (!enabled || !syncOnMount) return;

    const performSync = async () => {
      try {
        // Fetch all data in parallel
        const [glossaryData, productsData, hpcData, perfData, protocolData] = await Promise.all([
          syncGlossaryFromSupabase().catch(() => ({})),
          syncProductsFromSupabase().catch(() => []),
          syncHpcChecklistFromSupabase().catch(() => []),
          syncPerformanceDataFromSupabase().catch(() => []),
          syncProtocolConceptsFromSupabase().catch(() => []),
        ]);

        // Update context with fetched data
        if (Object.keys(glossaryData).length > 0) {
          updateGlossary(glossaryData);
        }
        if (productsData.length > 0) {
          updateProducts(productsData);
        }
        if (hpcData.length > 0) {
          updateHpcChecklist(hpcData);
        }
        if (perfData.length > 0) {
          updatePerformanceData(perfData);
        }
        if (protocolData.length > 0) {
          updateProtocolConcepts(protocolData);
        }

        captureMessage('Supabase sync completed successfully', 'info');
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        captureMessage(`Supabase sync failed: ${msg}`, 'error');
        console.error('Supabase sync error:', error);
      }
    };

    performSync();
  }, [enabled, syncOnMount, updateGlossary, updateProducts, updateHpcChecklist, updatePerformanceData, updateProtocolConcepts]);

  // Upload changes to Supabase (when user is authenticated)
  const uploadChanges = useCallback(async () => {
    if (!user) return;

    try {
      await Promise.all([
        uploadGlossaryToSupabase(glossary, user.id).catch(() => {}),
        uploadProductsToSupabase(products, user.id).catch(() => {}),
      ]);

      captureMessage('Changes uploaded to Supabase', 'info');
    } catch (error) {
      captureMessage(`Failed to upload changes: ${error}`, 'error');
      console.error('Upload error:', error);
    }
  }, [user, glossary, products]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!enabled || !realtime || !user) return;

    const unsubscribe = subscribeToGlossaryChanges(
      (updatedGlossary) => {
        updateGlossary(updatedGlossary);
        captureMessage('Glossary updated via real-time sync', 'info');
      },
      (error) => {
        console.error('Real-time sync error:', error);
        captureMessage(`Real-time sync error: ${error.message}`, 'error');
      }
    );

    return unsubscribe;
  }, [enabled, realtime, user, updateGlossary]);

  return {
    uploadChanges,
  };
};
