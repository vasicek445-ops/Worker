"use client";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function AuthCallback() {
  const [status, setStatus] = useState("Přihlašuji...");

  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    
    console.log("Callback URL:", window.location.href);
    console.log("Hash:", hash);
    console.log("Search:", window.location.search);

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
          console.log("setSession result:", data, error);
          if (data?.session) {
            window.location.replace("/dashboard");
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
        console.log("exchangeCode result:", data, error);
        if (data?.session) {
          window.location.replace("/dashboard");
        } else {
          setStatus("Chyba code: " + (error?.message || "neznámá"));
        }
      });
      return;
    }

    // Check existing session
    supabase.auth.getSession().then(({ data }) => {
      console.log("getSession result:", data);
      if (data?.session) {
        window.location.replace("/dashboard");
      } else {
        setStatus("Žádný token v URL. Zkontroluj Supabase redirect URL.");
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
      flexDirection: "column",
      gap: "16px",
    }}>
      <div style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}>⚙️</div>
      <p style={{ color: "white", fontWeight: 700, fontFamily: "Plus Jakarta Sans, sans-serif" }}>{status}</p>
      <p style={{ color: "#666", fontSize: "12px", fontFamily: "monospace" }}>{typeof window !== "undefined" ? window.location.href : ""}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
