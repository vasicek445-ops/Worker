"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: 'https://www.gowoker.com/auth/callback',
      },
    });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) setError(error.message);
      else setMessage("Zkontroluj svůj email pro potvrzení registrace!");
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else window.location.href = "/dashboard";
    }
    setLoading(false);
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      `}</style>
      <main style={{
        minHeight: '100vh',
        background: '#0a0a12',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px',
      }}>
        {/* Background effects */}
        <div style={{
          position: 'fixed', width: '500px', height: '500px', borderRadius: '50%',
          filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0, opacity: 0.35,
          top: '-150px', left: '-100px',
          background: 'radial-gradient(circle, rgba(57,255,110,0.15), transparent 70%)',
        }} />
        <div style={{
          position: 'fixed', width: '500px', height: '500px', borderRadius: '50%',
          filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0, opacity: 0.3,
          bottom: '-200px', right: '-150px',
          background: 'radial-gradient(circle, rgba(100,60,255,0.1), transparent 70%)',
        }} />

        {/* Grid */}
        <div style={{
          position: 'fixed', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 10 }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                marginBottom: '16px',
              }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #39ff6e, #2bcc58)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '20px', color: '#0a0a12',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>W</div>
              </div>
            </Link>
            <h1 style={{
              fontSize: '28px', fontWeight: 800, marginBottom: '8px',
              background: 'linear-gradient(135deg, #39ff6e, #2bcc58)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Woker</h1>
            <p style={{
              color: 'rgba(255,255,255,0.45)', fontSize: '14px',
            }}>Najdi práci ve Švýcarsku bez agentury</p>
          </div>

          {/* Card */}
          <div style={{
            background: '#111120',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '20px',
            padding: '32px',
          }}>
            {/* Google Button */}
            <button
              onClick={handleGoogle}
              style={{
                width: '100%',
                background: 'white',
                color: '#1a1a2e',
                fontWeight: 700,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.2s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Pokračovat s Google
            </button>

            {/* Divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              margin: '24px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>nebo</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmail} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: '#1a1a30',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(57,255,110,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <input
                type="password"
                placeholder="Heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  background: '#1a1a30',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  color: 'white',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'rgba(57,255,110,0.4)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />

              {error && (
                <div style={{
                  background: 'rgba(255,59,59,0.1)',
                  border: '1px solid rgba(255,59,59,0.2)',
                  color: '#ff6b6b',
                  fontSize: '13px',
                  borderRadius: '12px',
                  padding: '12px 16px',
                }}>
                  {error}
                </div>
              )}
              {message && (
                <div style={{
                  background: 'rgba(57,255,110,0.1)',
                  border: '1px solid rgba(57,255,110,0.2)',
                  color: '#39ff6e',
                  fontSize: '13px',
                  borderRadius: '12px',
                  padding: '12px 16px',
                }}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #39ff6e, #2bcc58)',
                  color: '#0a0a12',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 20px rgba(57,255,110,0.2)',
                  marginTop: '4px',
                }}
              >
                {loading ? "..." : isRegister ? "Vytvořit účet" : "Přihlásit se"}
              </button>
            </form>

            {/* Toggle */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => { setIsRegister(!isRegister); setError(""); setMessage(""); }}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.4)', fontSize: '13px',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#39ff6e'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.4)'}
              >
                {isRegister ? "Už máš účet? Přihlas se" : "Nemáš účet? Zaregistruj se"}
              </button>
            </div>
          </div>

          {/* Footer */}
          <p style={{
            textAlign: 'center', marginTop: '24px',
            color: 'rgba(255,255,255,0.2)', fontSize: '12px',
          }}>
            🔒 Bezpečné přihlášení přes Supabase Auth
          </p>
        </div>
      </main>
    </>
  );
}