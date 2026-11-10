import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  isAppleAuthAvailable,
  signInWithAppleNative,
  signInWithGoogleOAuth,
} from '../lib/oauth';
import { setBiometricEnabled } from '../lib/secureStorage';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  configured: boolean;
  appleAvailable: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithApple: () => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    isAppleAuthAvailable().then((ok) => {
      if (mounted) setAppleAvailable(ok);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        error:
          'Supabase is not configured. Copy .env.example to .env and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
      };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        error:
          'Supabase is not configured. Copy .env.example to .env and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.',
      };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signInWithApple = useCallback(async () => {
    return signInWithAppleNative();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    return signInWithGoogleOAuth();
  }, []);

  const signOut = useCallback(async () => {
    // Clear biometric preference so the next account isn't gated unexpectedly.
    await setBiometricEnabled(false);
    const { error } = await supabase.auth.signOut();
    return { error: error?.message ?? null };
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured.' };
    }

    const { error: fnError } = await supabase.functions.invoke('delete-account', {
      method: 'POST',
    });

    await setBiometricEnabled(false);

    if (fnError) {
      await supabase.auth.signOut();
      return {
        error:
          'Signed out. Deploy a Supabase Edge Function named "delete-account" (service role) to fully purge the auth user and related rows. See README.',
      };
    }

    await supabase.auth.signOut();
    return { error: null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured: isSupabaseConfigured,
      appleAvailable,
      signUp,
      signIn,
      signInWithApple,
      signInWithGoogle,
      signOut,
      deleteAccount,
    }),
    [
      session,
      loading,
      appleAvailable,
      signUp,
      signIn,
      signInWithApple,
      signInWithGoogle,
      signOut,
      deleteAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
