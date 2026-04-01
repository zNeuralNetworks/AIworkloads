import { supabase } from '../config/supabase';
import { ProductData, ChartData, ProtocolConcept, HPCItem, ScalingConcept, ConceptData, ComparisonRow } from '../types';
import { captureException } from './sentry';

interface SyncOptions {
  onError?: (error: Error) => void;
  retries?: number;
}

const DEFAULT_RETRIES = 3;

/**
 * Sync Glossary from Supabase
 */
export async function syncGlossaryFromSupabase(options: SyncOptions = {}): Promise<Record<string, string>> {
  const { retries = DEFAULT_RETRIES } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { data, error } = await supabase.from('glossary').select('*');

      if (error) throw error;
      if (!data || data.length === 0) return {};

      const glossaryMap: Record<string, string> = {};
      data.forEach((item: { term: string; definition: string }) => {
        glossaryMap[item.term] = item.definition;
      });

      return glossaryMap;
    } catch (err) {
      if (attempt === retries - 1) {
        const error = err instanceof Error ? err : new Error('Failed to sync glossary');
        captureException(error);
        options.onError?.(error);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return {};
}

/**
 * Sync Products from Supabase
 */
export async function syncProductsFromSupabase(options: SyncOptions = {}): Promise<ProductData[]> {
  const { retries = DEFAULT_RETRIES } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      if (attempt === retries - 1) {
        const error = err instanceof Error ? err : new Error('Failed to sync products');
        captureException(error);
        options.onError?.(error);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return [];
}

/**
 * Sync HPC Checklist from Supabase
 */
export async function syncHpcChecklistFromSupabase(options: SyncOptions = {}): Promise<HPCItem[]> {
  const { retries = DEFAULT_RETRIES } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { data, error } = await supabase.from('hpc_items').select('*').order('order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      if (attempt === retries - 1) {
        const error = err instanceof Error ? err : new Error('Failed to sync HPC checklist');
        captureException(error);
        options.onError?.(error);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return [];
}

/**
 * Sync Performance Data from Supabase
 */
export async function syncPerformanceDataFromSupabase(options: SyncOptions = {}): Promise<ChartData[]> {
  const { retries = DEFAULT_RETRIES } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('performance_data')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      if (attempt === retries - 1) {
        const error = err instanceof Error ? err : new Error('Failed to sync performance data');
        captureException(error);
        options.onError?.(error);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return [];
}

/**
 * Sync Protocol Concepts from Supabase
 */
export async function syncProtocolConceptsFromSupabase(options: SyncOptions = {}): Promise<ProtocolConcept[]> {
  const { retries = DEFAULT_RETRIES } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('protocol_concepts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      if (attempt === retries - 1) {
        const error = err instanceof Error ? err : new Error('Failed to sync protocol concepts');
        captureException(error);
        options.onError?.(error);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  return [];
}

/**
 * Upload Glossary to Supabase (from admin edits)
 */
export async function uploadGlossaryToSupabase(
  glossary: Record<string, string>,
  userId: string,
  options: SyncOptions = {}
): Promise<void> {
  const { retries = DEFAULT_RETRIES } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const items = Object.entries(glossary).map(([term, definition]) => ({
        term,
        definition,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      }));

      // Upsert: insert or update based on term
      const { error } = await supabase.from('glossary').upsert(items, { onConflict: 'term' });

      if (error) throw error;
      return;
    } catch (err) {
      if (attempt === retries - 1) {
        const error = err instanceof Error ? err : new Error('Failed to upload glossary');
        captureException(error);
        options.onError?.(error);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

/**
 * Upload Products to Supabase
 */
export async function uploadProductsToSupabase(
  products: ProductData[],
  userId: string,
  options: SyncOptions = {}
): Promise<void> {
  const { retries = DEFAULT_RETRIES } = options;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const items = products.map((p) => ({
        ...p,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('products').upsert(items, { onConflict: 'id' });

      if (error) throw error;
      return;
    } catch (err) {
      if (attempt === retries - 1) {
        const error = err instanceof Error ? err : new Error('Failed to upload products');
        captureException(error);
        options.onError?.(error);
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

/**
 * Listen for real-time Glossary updates
 */
export function subscribeToGlossaryChanges(
  callback: (glossary: Record<string, string>) => void,
  onError?: (error: Error) => void
) {
  const channel = supabase
    .channel('glossary-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'glossary',
      },
      async () => {
        try {
          const updatedGlossary = await syncGlossaryFromSupabase();
          callback(updatedGlossary);
        } catch (err) {
          onError?.(err instanceof Error ? err : new Error('Glossary sync failed'));
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIPTION_ERROR') {
        onError?.(new Error('Failed to subscribe to glossary changes'));
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
