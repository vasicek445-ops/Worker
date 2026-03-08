"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { SkeletonPage } from "./Skeleton";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Check if first-time user needs onboarding
        if (!localStorage.getItem("woker_onboarded")) {
          localStorage.setItem("woker_onboarded", "1");
          window.location.href = "/onboarding";
          return;
        }
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
    return <SkeletonPage />;
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
