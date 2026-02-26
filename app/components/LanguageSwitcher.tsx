"use client";
import { useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { LOCALES } from "../../lib/i18n/types";
export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.code === locale);
  return (
    <div style={{ position: "relative", zIndex: 9999 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "rgba(255,255,255,0.06)", borderRadius: "10px",
          padding: "7px 10px", border: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer", color: "white", fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: "16px" }}>{current?.flag}</span>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{current?.code.toUpperCase()}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 9998 }} />
          <div style={{
            position: "fixed", right: "20px", top: "60px", zIndex: 9999,
            background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            overflow: "hidden", minWidth: "200px",
          }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>Language</span>
            </div>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLocale(l.code); setOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 14px", border: "none", cursor: "pointer",
                    background: locale === l.code ? "rgba(57,255,110,0.08)" : "transparent",
                    fontFamily: "inherit", textAlign: "left",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { if (locale !== l.code) (e.target as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { if (locale !== l.code) (e.target as HTMLElement).style.background = "transparent"; }}
                >
                  <span style={{ fontSize: "18px" }}>{l.flag}</span>
                  <span style={{ fontSize: "14px", color: "white", fontWeight: 500, flex: 1 }}>{l.name}</span>
                  {locale === l.code && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#39ff6e" }} />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
