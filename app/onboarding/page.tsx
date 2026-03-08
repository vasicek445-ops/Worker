"use client";

import { useState } from "react";
import Link from "next/link";

const steps = [
  {
    icon: "👋",
    title: "Vítej ve Wokeru!",
    desc: "Jsme tu, abys našel práci ve Švýcarsku rychle a bez zbytečných prostředníků.",
  },
  {
    icon: "🔍",
    title: "1 007 kontaktů",
    desc: "Máme přímé kontakty na švýcarské agentury a zaměstnavatele. Žádný prostředník, žádné poplatky.",
  },
  {
    icon: "🤖",
    title: "10 AI nástrojů",
    desc: "Vytvoř si CV, motivační dopis, email pro HR, připrav se na pohovor — vše automaticky s AI.",
  },
  {
    icon: "📖",
    title: "Průvodce od A do Z",
    desc: "Povolení, pojištění, daně, bydlení — vše vysvětlené jednoduše, krok za krokem.",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  function handleNext() {
    if (isLast) {
      localStorage.setItem("woker_onboarded", "1");
      window.location.href = "/dashboard";
    } else {
      setStep(step + 1);
    }
  }

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
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          filter: "blur(120px)",
          pointerEvents: "none",
          opacity: 0.25,
          top: "-100px",
          left: "-100px",
          background: "radial-gradient(circle, rgba(57,255,110,0.2), transparent 70%)",
        }}
      />

      <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
        {/* Progress dots */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            marginBottom: "48px",
          }}
        >
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? "24px" : "8px",
                height: "8px",
                borderRadius: "100px",
                background:
                  i === step
                    ? "linear-gradient(135deg, #39ff6e, #2bcc58)"
                    : i < step
                    ? "rgba(57,255,110,0.3)"
                    : "rgba(255,255,255,0.1)",
                transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div
          key={step}
          style={{
            animation: "fadeSlide 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "24px" }}>{current.icon}</div>
          <h1
            style={{
              color: "white",
              fontSize: "26px",
              fontWeight: 800,
              marginBottom: "14px",
              lineHeight: 1.2,
            }}
          >
            {current.title}
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "16px",
              lineHeight: 1.6,
              marginBottom: "48px",
            }}
          >
            {current.desc}
          </p>
        </div>

        {/* Actions */}
        <button
          onClick={handleNext}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #39ff6e, #2bcc58)",
            color: "#0a0a12",
            border: "none",
            padding: "16px",
            borderRadius: "14px",
            fontSize: "16px",
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 4px 24px rgba(57,255,110,0.25)",
            transition: "all 0.2s",
          }}
        >
          {isLast ? "Začít používat Woker" : "Pokračovat"}
        </button>

        {!isLast && (
          <button
            onClick={() => {
              localStorage.setItem("woker_onboarded", "1");
              window.location.href = "/dashboard";
            }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.3)",
              fontSize: "13px",
              cursor: "pointer",
              fontFamily: "inherit",
              marginTop: "16px",
              padding: "8px",
            }}
          >
            Přeskočit
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </main>
  );
}
