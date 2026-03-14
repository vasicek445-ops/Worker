"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const hash = window.location.hash;

    // Recovery flow - reset password
    if (hash && hash.includes("type=recovery")) {
      window.location.replace("/auth/callback" + hash);
      return;
    }

    // Email confirmation flow
    if (hash && hash.includes("access_token")) {
      window.location.replace("/auth/callback" + hash);
      return;
    }

    // Default - go to landing
    window.location.replace("/landing.html");
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a12", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}>⚙️</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
