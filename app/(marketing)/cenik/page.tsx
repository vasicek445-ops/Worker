"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const CHECK = (
  <svg
    className="w-4 h-4 text-[#39ff6e] mt-0.5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const CROSS = (
  <svg
    className="w-4 h-4 text-white/20 mt-0.5 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const FREE_FEATURES = [
  { label: "Hledani prace", included: true },
  { label: "Zakladni nabidky bydleni", included: true },
  { label: "Pruvodce Svycarskem", included: true },
  { label: "Komunita", included: true },
  { label: "3188 ubytovani s kontakty", included: false },
  { label: "1007 agentur s kontakty", included: false },
  { label: "Dokumenty v nemcine", included: false },
  { label: "Smart Matching", included: false },
  { label: "Prioritni podpora", included: false },
];

const PREMIUM_FEATURES = [
  { label: "Vse z Free planu", included: true },
  { label: "3188 ubytovani s kontakty", included: true },
  { label: "1007 agentur s kontakty", included: true },
  { label: "Dokumenty v nemcine", included: true },
  { label: "Smart Matching", included: true },
  { label: "Prioritni podpora", included: true },
  { label: "Export do PDF", included: true },
];

const FAQ = [
  {
    q: "Musim zadat kreditku?",
    a: "Ne. Free plan je bez kreditky, bez zavazku. Premium muzes kdykoliv zrusit.",
  },
  {
    q: "Co kdyz premium nepotrebuju?",
    a: "Free plan staci na hledani prace a zakladni bydleni. Premium odemkne kontakty, dokumenty a smart matching.",
  },
  {
    q: "Kolik stoji agentura?",
    a: "Agentury typicky uctuji 500 az 2000 EUR za zprostredkovani. Woker Premium stoji 19.99 EUR mesicne a das veci si resis sam.",
  },
  {
    q: "Muzu Premium zrusit?",
    a: "Ano, kdykoliv. Zadne sankce, zadne skryte poplatky. Zrusis jednim kliknutim.",
  },
];

export default function CenikPage() {
  return (
    <div
      className="min-h-screen bg-[#0a0a12] text-white"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Simple back nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a12]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-white">
            WOKER
          </Link>
          <Link
            href="/registrace"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 transition-all"
          >
            Zacit zdarma
          </Link>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-center mb-4">
              Plany a ceny
            </h1>
          </FadeIn>
          <FadeIn delay={0.05}>
            <p className="text-center text-white/50 text-lg mb-14 max-w-xl mx-auto">
              Zacni zdarma. Upgradni, az budes potrebovat vic.
            </p>
          </FadeIn>

          {/* Pricing cards */}
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-20">
            {/* Free */}
            <FadeIn delay={0.1}>
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 sm:p-8 h-full flex flex-col">
                <h2 className="text-lg font-bold text-white mb-1">Zdarma</h2>
                <p className="text-4xl font-extrabold text-white mb-6">
                  0 EUR
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {FREE_FEATURES.map((f) => (
                    <li
                      key={f.label}
                      className={`flex items-start gap-2 text-sm ${
                        f.included ? "text-white/60" : "text-white/25"
                      }`}
                    >
                      {f.included ? CHECK : CROSS}
                      {f.label}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/registrace"
                  className="block text-center px-6 py-3 rounded-xl text-sm font-semibold border border-white/[0.15] text-white hover:bg-white/[0.05] transition-all"
                >
                  Zacit zdarma
                </Link>
              </div>
            </FadeIn>

            {/* Premium */}
            <FadeIn delay={0.15}>
              <div className="relative rounded-2xl bg-white/[0.03] border-2 border-[#39ff6e]/40 p-6 sm:p-8 h-full flex flex-col">
                <span className="absolute -top-3 left-6 px-3 py-0.5 text-xs font-bold bg-[#39ff6e] text-[#0a0a12] rounded-full">
                  Nejoblibenejsi
                </span>
                <h2 className="text-lg font-bold text-white mb-1">Premium</h2>
                <p className="text-4xl font-extrabold text-white mb-1">
                  19.99 EUR
                  <span className="text-base font-normal text-white/40">
                    /mesic
                  </span>
                </p>
                <p className="text-xs text-white/30 mb-6">
                  Agentury uctuji 500-2000 EUR
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {PREMIUM_FEATURES.map((f) => (
                    <li
                      key={f.label}
                      className="flex items-start gap-2 text-sm text-white/80"
                    >
                      {CHECK}
                      {f.label}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/registrace?plan=premium"
                  className="block text-center px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 transition-all"
                >
                  Zkusit Premium
                </Link>
                <p className="text-xs text-white/30 text-center mt-3">
                  Bez zavazku. Zrusis kdykoliv.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* FAQ */}
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
              Caste otazky
            </h2>
          </FadeIn>
          <div className="max-w-xl mx-auto space-y-4">
            {FAQ.map((item, i) => (
              <FadeIn key={item.q} delay={0.05 * i}>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5">
                  <h3 className="text-sm font-bold text-white mb-2">{item.q}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{item.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Footer minimal */}
      <footer className="border-t border-white/[0.06] py-8 px-4 text-center">
        <p className="text-xs text-white/30">
          &copy; 2026 Woker &middot; Prace a bydleni ve Svycarsku
        </p>
        <p className="text-xs text-white/20 mt-1">
          Zadne skryte poplatky. Tva data nikdy neprodavame.
        </p>
      </footer>
    </div>
  );
}
