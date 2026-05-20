"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";

const CONSENT_KEY = "woker_cookie_consent";

export default function CookieConsent() {
  // undefined = ještě nenačteno z localStorage (nic nezobrazuj — kvůli hydrataci)
  const [choice, setChoice] = useState<"all" | "essential" | null | undefined>(
    () => {
      if (typeof window === "undefined") return undefined;
      try {
        const stored = localStorage.getItem(CONSENT_KEY);
        return stored === "all" || stored === "essential" ? stored : null;
      } catch {
        return null;
      }
    },
  );

  const decide = (value: "all" | "essential") => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {}
    setChoice(value);
  };

  return (
    <>
      {choice === "all" && (
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
          (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','1450061966530469');fbq('track','PageView');
        `}</Script>
      )}
      {choice === null && (
        <div className="fixed bottom-0 inset-x-0 z-[100] bg-[#111120] border-t border-white/[0.1] shadow-[0_-8px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-[13px] text-white/70 leading-relaxed sm:flex-1">
              Používáme cookies, aby Woker fungoval (přihlášení, chod webu) a
              abychom ho mohli zlepšovat. Kliknutím na „Přijmout vše&quot; souhlasíš
              i s cookies pro měření návštěvnosti. Více v{" "}
              <Link
                href="/ochrana-udaju"
                className="text-[#fb923c] hover:underline"
              >
                zásadách ochrany osobních údajů
              </Link>
              .
            </p>
            <div className="flex gap-2.5 shrink-0">
              <button
                onClick={() => decide("all")}
                className="px-5 py-2.5 rounded-lg bg-[#fb923c] text-[#0a0a12] font-bold text-sm hover:bg-[#f97316] transition-all whitespace-nowrap"
              >
                Přijmout vše
              </button>
              <button
                onClick={() => decide("essential")}
                className="px-5 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-white font-semibold text-sm hover:bg-white/[0.1] transition-all whitespace-nowrap"
              >
                Jen nezbytné
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
