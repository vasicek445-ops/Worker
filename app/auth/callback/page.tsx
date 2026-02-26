"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AuthCallback() {
  const [status, setStatus] = useState("Přihlašuji...");

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    
    // If there's an access_token in hash, set session manually
    if (hash && hash.includes("access_token")) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      
      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ data, error }) => {
          if (data?.session) {
            window.location.replace("/dashboard");
          } else {
            setStatus("Chyba: " + (error?.message || "neznámá"));
          }
        });
        return;
      }
    }
    
    // If there's a code param (PKCE flow)
    const code = params.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (data?.session) {
          window.location.replace("/dashboard");
        } else {
          setStatus("Chyba: " + (error?.message || "neznámá"));
        }
      });
      return;
    }

    // Fallback - check if already logged in
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        window.location.replace("/dashboard");
      } else {
        setStatus("Nepodařilo se přihlásit. Zkuste to znovu.");
        setTimeout(() => window.location.replace("/login"), 3000);
      }
    });
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
        <p style={{ color: "white", fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{status}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );
}
