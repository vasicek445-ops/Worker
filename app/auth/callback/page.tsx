"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
export default function AuthCallback() {
  const [status, setStatus] = useState("Přihlašuji...");
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);

    // Detect recovery type from hash
    const isRecovery = hash.includes("type=recovery");

    // Hash fragment flow (implicit)
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
            window.location.replace(isRecovery ? "/reset-heslo" : "/dashboard");
          } else {
            setStatus("Chyba session: " + (error?.message || "neznámá"));
          }
        });
        return;
      }
    }

    // PKCE flow (code in query)
    const code = params.get("code");
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
        if (data?.session) {
          window.location.replace(isRecovery ? "/reset-heslo" : "/dashboard");
        } else {
          setStatus("Chyba code: " + (error?.message || "neznámá"));
        }
      });
      return;
    }

    // Check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        window.location.replace("/dashboard");
      } else {
        setStatus("Žádný token. Zkus to znovu.");
      }
    });
  }, []);
  return (
    <main style={{ minHeight: "100vh", background: "#0a0a12", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
      <div style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}>⚙️</div>
      <p style={{ color: "white", fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{status}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
