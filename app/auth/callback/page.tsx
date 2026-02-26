"use client";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AuthCallback() {
  useEffect(() => {
    const run = async () => {
      // This picks up tokens from URL hash (#access_token=...)
      const { data, error } = await supabase.auth.getSession();
      
      if (data?.session) {
        window.location.replace("/dashboard");
        return;
      }

      // If no session yet, wait for auth state change
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session) {
            subscription.unsubscribe();
            window.location.replace("/dashboard");
          }
        }
      );

      // Fallback
      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 4000);
    };

    run();
  }, []);

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0a0a12",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "32px", marginBottom: "16px", animation: "spin 1s linear infinite" }}>⚙️</div>
        <p style={{ color: "white", fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>Přihlašuji...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}
