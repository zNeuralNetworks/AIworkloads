import { supabase, isSupabaseConfigured } from '../config/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export const authService = {
  /**
   * Sign in with magic link (passwordless email auth)
   */
  async signInWithMagicLink(email: string): Promise<{ error: string | null }> {
    if (!supabase || !isSupabaseConfigured) {
      return { error: 'Supabase authentication is not configured for this environment' };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      return { error: error?.message ?? null };
    } catch {
      return { error: 'Failed to send magic link' };
    }
  },

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<{ error: string | null }> {
    if (!supabase || !isSupabaseConfigured) {
      return { error: 'Supabase authentication is not configured for this environment' };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      return { error: error?.message ?? null };
    } catch {
      return { error: 'Failed to sign in with Google' };
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    if (!supabase || !isSupabaseConfigured) {
      return null;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch {
      return null;
    }
  },

  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    if (!supabase || !isSupabaseConfigured) {
      return null;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch {
      return null;
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<{ error: string | null }> {
    if (!supabase || !isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message ?? null };
    } catch {
      return { error: 'Failed to sign out' };
    }
  },

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(
    callback: (state: AuthState) => void
  ): { unsubscribe: () => void } {
    if (!supabase || !isSupabaseConfigured) {
      callback({
        user: null,
        session: null,
        loading: false,
        error: null,
      });

      return {
        unsubscribe: () => undefined,
      };
    }

    const subscription = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      callback({
        user,
        session,
        loading: false,
        error: null,
      });
    });

    return {
      unsubscribe: () => subscription.data?.subscription?.unsubscribe?.(),
    };
  },
};
