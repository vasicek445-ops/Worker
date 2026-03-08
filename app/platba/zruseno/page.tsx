"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaymentCancelled() {
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
      }}
    >
      <div
        style={{
          textAlign: "center",
          maxWidth: "440px",
          opacity: show ? 1 : 0,
          transform: show ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "32px",
          }}
        >
          ↩
        </div>

        <h1
          style={{
            color: "white",
            fontSize: "24px",
            fontWeight: 800,
            marginBottom: "12px",
          }}
        >
          Platba zrušena
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: "15px",
            lineHeight: 1.6,
            marginBottom: "28px",
          }}
        >
          Nic se nestalo — nebyl ti nic účtován. Můžeš to zkusit znovu kdykoliv.
        </p>

        {/* Trust elements */}
        <div
          style={{
            background: "#111120",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "24px",
              color: "rgba(255,255,255,0.4)",
              fontSize: "13px",
            }}
          >
            <span>🔒 Bezpečná platba</span>
            <span>↩ Zrušíš kdykoliv</span>
            <span>💬 Podpora 24/7</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link
            href="/#pricing"
            style={{
              background: "linear-gradient(135deg, #39ff6e, #2bcc58)",
              color: "#0a0a12",
              padding: "14px 28px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Zkusit znovu
          </Link>
          <Link
            href="/dashboard"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "white",
              padding: "14px 28px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Zpět na dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
