"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      setLoading(false);
    };
    fetchSession();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithGoogle: async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
        if (error) throw error;
      },
      signOutUser: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


