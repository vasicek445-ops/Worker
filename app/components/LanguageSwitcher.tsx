"use client";
import { useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { LOCALES } from "../../lib/i18n/types";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.1] transition-colors rounded-lg px-2.5 py-1.5 border border-white/[0.08]"
      >
        <span className="text-base">{current?.flag}</span>
        <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">{current?.code.toUpperCase()}</span>
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[200]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-[201] bg-[#1a1a1e] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden min-w-[180px]">
            <div className="px-3 py-2 border-b border-white/[0.06]">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Language</span>
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLocale(l.code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors ${locale === l.code ? "bg-white/[0.04]" : ""}`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <div className="flex-1">
                    <span className="text-sm text-white font-medium">{l.name}</span>
                  </div>
                  {locale === l.code && <div className="w-2 h-2 rounded-full bg-red-500" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
