"use client";
import { useState } from "react";
import { supabase } from "../supabase";

export default function ResetHeslo() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError("Heslo musí mít minimálně 6 znaků"); return; }
    if (password !== confirm) { setError("Hesla se neshodují"); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
  }

  return (
    <main style={{
      minHeight: "100vh", background: "#0a0a12",
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "12px",
            background: "linear-gradient(135deg, #39ff6e, #2bcc58)",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontWeight: 800, fontSize: "20px", color: "#0a0a12", marginBottom: "16px",
          }}>W</div>
          <h1 style={{
            fontSize: "24px", fontWeight: 800, color: "white", marginBottom: "8px",
          }}>Nové heslo</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
            Zadej své nové heslo pro přihlášení
          </p>
        </div>

        <div style={{
          background: "#111120", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px", padding: "32px",
        }}>
          {done ? (
            <div style={{
              background: "rgba(57,255,110,0.1)", border: "1px solid rgba(57,255,110,0.2)",
              color: "#39ff6e", fontSize: "14px", borderRadius: "12px", padding: "16px",
              textAlign: "center",
            }}>
              ✅ Heslo změněno! Přesměrovávám na dashboard...
            </div>
          ) : (
            <form onSubmit={handleReset} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                type="password" placeholder="Nové heslo" value={password}
                onChange={(e) => setPassword(e.target.value)} required minLength={6}
                style={{
                  width: "100%", background: "#1a1a30", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px", padding: "14px 16px", color: "white", fontSize: "14px",
                  fontFamily: "inherit", outline: "none",
                }}
              />
              <input
                type="password" placeholder="Potvrdit heslo" value={confirm}
                onChange={(e) => setConfirm(e.target.value)} required minLength={6}
                style={{
                  width: "100%", background: "#1a1a30", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px", padding: "14px 16px", color: "white", fontSize: "14px",
                  fontFamily: "inherit", outline: "none",
                }}
              />
              {error && (
                <div style={{
                  background: "rgba(255,59,59,0.1)", border: "1px solid rgba(255,59,59,0.2)",
                  color: "#ff6b6b", fontSize: "13px", borderRadius: "12px", padding: "12px 16px",
                }}>{error}</div>
              )}
              <button type="submit" disabled={loading} style={{
                width: "100%", background: "linear-gradient(135deg, #39ff6e, #2bcc58)",
                color: "#0a0a12", border: "none", padding: "14px", borderRadius: "12px",
                fontSize: "15px", fontWeight: 700, cursor: loading ? "wait" : "pointer",
                fontFamily: "inherit", opacity: loading ? 0.6 : 1,
                boxShadow: "0 4px 20px rgba(57,255,110,0.2)", marginTop: "4px",
              }}>
                {loading ? "..." : "Změnit heslo"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
