"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaymentSuccess() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a12",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "fixed",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          filter: "blur(140px)",
          pointerEvents: "none",
          opacity: 0.3,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(57,255,110,0.25), transparent 70%)",
        }}
      />

      <div
        style={{
          textAlign: "center",
          maxWidth: "480px",
          position: "relative",
          zIndex: 1,
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Success checkmark */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #39ff6e, #2bcc58)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 0 60px rgba(57,255,110,0.3)",
            fontSize: "36px",
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M10 20L17 27L30 13"
              stroke="#0a0a12"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          style={{
            color: "white",
            fontSize: "28px",
            fontWeight: 800,
            marginBottom: "12px",
          }}
        >
          Platba proběhla!
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "16px",
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          Tvůj prémiový přístup je aktivní. Máš přístup ke všem 1 007 kontaktům, AI nástrojům a průvodci.
        </p>

        {/* What's next */}
        <div
          style={{
            background: "#111120",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "28px",
            textAlign: "left",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "16px",
            }}
          >
            Co dál?
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { icon: "🔍", text: "Prohlédni si kontakty na firmy a agentury" },
              { icon: "📝", text: "Vytvoř si CV pomocí AI šablony" },
              { icon: "📧", text: "Pošli email přímo zaměstnavateli" },
              { icon: "🤖", text: "Zeptej se AI asistenta na cokoliv" },
            ].map((item) => (
              <div
                key={item.text}
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/dashboard"
          style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #39ff6e, #2bcc58)",
            color: "#0a0a12",
            padding: "16px 40px",
            borderRadius: "14px",
            fontSize: "16px",
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 4px 24px rgba(57,255,110,0.25)",
            transition: "all 0.2s",
          }}
        >
          Začít hledat práci
        </Link>

        <p
          style={{
            color: "rgba(255,255,255,0.25)",
            fontSize: "12px",
            marginTop: "16px",
          }}
        >
          Potvrzení bylo odesláno na tvůj email
        </p>
      </div>
    </main>
  );
}
