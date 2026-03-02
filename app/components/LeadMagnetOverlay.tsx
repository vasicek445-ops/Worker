"use client";

import { useState, useEffect } from "react";

export default function LeadMagnetOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check if user already dismissed or subscribed
    const dismissed = sessionStorage.getItem("woker-overlay-dismissed");
    const subscribed = localStorage.getItem("woker-subscribed");
    if (!dismissed && !subscribed) {
      // Small delay so the page loads first, then overlay appears
      const timer = setTimeout(() => setIsVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("woker-overlay-dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Něco se pokazilo");
      }

      setStatus("success");
      localStorage.setItem("woker-subscribed", "true");

      // Auto-close after success
      setTimeout(() => setIsVisible(false), 3000);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Něco se pokazilo, zkuste to znovu.");
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "woker-fade-in 0.3s ease-out",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "440px",
          margin: "0 16px",
          backgroundColor: "#1a1a2e",
          borderRadius: "16px",
          border: "1px solid rgba(74, 222, 128, 0.2)",
          padding: "40px 32px",
          boxShadow: "0 0 60px rgba(74, 222, 128, 0.1), 0 20px 60px rgba(0, 0, 0, 0.5)",
          animation: "woker-scale-in 0.3s ease-out",
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            color: "#888",
            fontSize: "24px",
            cursor: "pointer",
            padding: "4px 8px",
            lineHeight: 1,
            borderRadius: "8px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#888";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label="Zavřít"
        >
          ✕
        </button>

        {/* Logo */}
        <div
          style={{
            textAlign: "center",
            fontSize: "28px",
            fontWeight: 800,
            color: "#4ade80",
            letterSpacing: "3px",
            marginBottom: "24px",
          }}
        >
          WOKER
        </div>

        {status === "success" ? (
          /* Success state */
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎉</div>
            <h2
              style={{
                color: "#fff",
                fontSize: "22px",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              Průvodce letí do mailu!
            </h2>
            <p style={{ color: "#aaa", fontSize: "15px" }}>
              Zkontrolujte svou e-mailovou schránku.
            </p>
          </div>
        ) : (
          /* Form state */
          <>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🇨🇭</div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "22px",
                  fontWeight: 700,
                  marginBottom: "8px",
                  lineHeight: 1.3,
                }}
              >
                5 kroků k práci ve Švýcarsku
              </h2>
              <p
                style={{
                  color: "#aaa",
                  fontSize: "15px",
                  lineHeight: 1.5,
                }}
              >
                Zdarma průvodce — povolení, platy, bydlení a tipy od lidí, co už tam jsou.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="vas@email.cz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  fontSize: "16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  outline: "none",
                  marginBottom: "12px",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#4ade80";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                }}
              />

              <button
                type="submit"
                disabled={status === "loading"}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: 700,
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#4ade80",
                  color: "#0a0a0a",
                  cursor: status === "loading" ? "wait" : "pointer",
                  transition: "all 0.2s",
                  opacity: status === "loading" ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (status !== "loading") {
                    e.currentTarget.style.backgroundColor = "#22c55e";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#4ade80";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {status === "loading" ? "Odesílám..." : "🚀 Stáhnout průvodce zdarma"}
              </button>

              {status === "error" && (
                <p
                  style={{
                    color: "#f87171",
                    fontSize: "14px",
                    textAlign: "center",
                    marginTop: "12px",
                  }}
                >
                  {errorMsg}
                </p>
              )}
            </form>

            <p
              style={{
                color: "#666",
                fontSize: "12px",
                textAlign: "center",
                marginTop: "16px",
              }}
            >
              Žádný spam. Odhlášení jedním klikem.
            </p>
          </>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes woker-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes woker-scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
