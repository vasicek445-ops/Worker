"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../supabase";

async function handlePostAuth(user: any, plan: string | null, isRecovery: boolean) {
  const fullName = user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || [user?.user_metadata?.given_name, user?.user_metadata?.family_name].filter(Boolean).join(" ")
    || null;
  await supabase.from("profiles").upsert({
    id: user.id,
    full_name: fullName,
    avatar_url: user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null,
  }, { onConflict: "id" });

  // Send welcome email for new users (only once)
  const welcomeSentKey = 'woker_welcome_sent';
  if (!localStorage.getItem(welcomeSentKey) && !isRecovery) {
    localStorage.setItem(welcomeSentKey, '1');
    // Initialize drip sequence in profile
    await supabase.from("profiles").update({
      user_email_step: 1,
      last_user_email_at: new Date().toISOString(),
    }).eq('id', user.id);
    // Fire and forget - don't block auth flow
    fetch('/api/email/welcome', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, name: user.user_metadata?.full_name }),
    }).catch(() => {});
  }

  if (isRecovery) { window.location.replace("/reset-heslo"); return; }
  if (plan && (plan === "monthly" || plan === "yearly")) {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planKey: plan, userId: user.id, email: user.email }),
    });
    const data = await res.json();
    if (data.url) { window.location.href = data.url; return; }
  }
  window.location.replace("/dashboard");
}

export default function AuthCallback() {
  const [status, setStatus] = useState("Přihlašuji...");
  useEffect(() => {
    const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");

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
        }).then(async ({ data, error }) => {
          if (data?.session) {
            await handlePostAuth(data.session.user, plan, isRecovery);
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
      supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
        if (data?.session) {
            await handlePostAuth(data.session.user, plan, isRecovery);
        } else {
          setStatus("Chyba code: " + (error?.message || "neznámá"));
        }
      });
      return;
    }

    // Check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        if (plan) { handlePostAuth(data.session.user, plan, false); }
        else { window.location.replace("/dashboard"); }
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
