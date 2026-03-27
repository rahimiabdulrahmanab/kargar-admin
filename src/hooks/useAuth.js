// src/hooks/useAuth.js
// Provides current Supabase auth session to the whole app.

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session ?? null)
    );

    return () => subscription.unsubscribe();
  }, []);

  return { session, loading: session === undefined };
}
