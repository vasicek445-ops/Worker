"use client";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AuthCallback() {
  useEffect(() => {
    const handleAuth = async () => {
      // Check if already signed in
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = "/dashboard";
        return;
      }

      // Listen for auth state change (handles OAuth redirect)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          subscription.unsubscribe();
          window.location.href = "/dashboard";
        }
      });

      // Fallback - redirect after 5 seconds even if no event
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 5000);
    };

    handleAuth();
  }, []);

  return (
    <main style={{
      minHeight: '100vh',
      background: '#0a0a12',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⚙️</div>
        <p style={{ color: 'white', fontWeight: 700 }}>Přihlašuji...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}
