"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAuthenticated(true);
      } else {
        window.location.href = "/login";
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        window.location.href = "/login";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0E0E0E] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚙️</div>
          <p className="text-white font-bold">Načítám...</p>
        </div>
      </main>
    );
  }

  if (!authenticated) return null;

  return <>{children}</>;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser()
      .then(({ data: { user }, error: err }) => {
        if (err) {
          setError(err.message);
        }
        setUser(user);
      })
      .catch((err) => {
        setError(err.message || "Failed to get user");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { user, loading, error };
}

export function signOut() {
  supabase.auth.signOut().then(() => {
    window.location.href = "/login";
  });
}
