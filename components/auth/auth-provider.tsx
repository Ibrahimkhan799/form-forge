"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import {
  ensureSupabaseUser,
  getSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { useFormsStore } from "@/lib/store/forms-store";
import { useSubmissionsStore } from "@/lib/store/submissions-store";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setUser(data.user);
        setLoading(false);
      }
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const syncAccount = useCallback(async () => {
    await useFormsStore.getState().syncRemote();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase authentication is not configured");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      useFormsStore.getState().resetForAccount(false);
      useSubmissionsStore.getState().resetForAccount(false);
      setUser(data.user);
      await syncAccount();
    },
    [syncAccount]
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error("Supabase authentication is not configured");
      const current = (await supabase.auth.getUser()).data.user;
      if (current?.is_anonymous) {
        const { data, error } = await supabase.auth.updateUser({
          email,
          password,
          data: { display_name: name },
        });
        if (error) throw error;
        setUser(data.user);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo:
              typeof window === "undefined" ? undefined : window.location.origin,
          },
        });
        if (error) throw error;
        setUser(data.user);
      }
      await syncAccount();
    },
    [syncAccount]
  );

  const continueAsGuest = useCallback(async () => {
    const guest = await ensureSupabaseUser();
    setUser(guest);
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    useFormsStore.getState().resetForAccount();
    useSubmissionsStore.getState().resetForAccount();
    const guest = await ensureSupabaseUser().catch(() => null);
    setUser(guest);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) throw new Error("Supabase authentication is not configured");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window === "undefined"
          ? undefined
          : `${window.location.origin}/auth/update-password`,
    });
    if (error) throw error;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      configured,
      isGuest: Boolean(user?.is_anonymous),
      signIn,
      signUp,
      signOut,
      continueAsGuest,
      sendPasswordReset,
    }),
    [
      configured,
      continueAsGuest,
      loading,
      sendPasswordReset,
      signIn,
      signOut,
      signUp,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
