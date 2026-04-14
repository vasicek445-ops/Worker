"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

/* ─── Animation helpers ─── */
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

/* ─── Navbar dropdown data ─── */
const NAV_PRACE = [
  { label: "Nabídky práce", desc: "Aktuální pozice ve Švýcarsku", href: "/prace" },
  { label: "Smart Matching", desc: "Najde ti práci podle toho co umíš", href: "/prace" },
  { label: "Kontakty na agentury", desc: "1007 ověřených agentur", href: "/kontakty-preview" },
];

const NAV_BYDLENI = [
  { label: "Byty & WG", desc: "Klasické pronájmy", href: "/bydleni-preview" },
  { label: "Penziony & B&B", desc: "Měsíční ubytování v penzionech", href: "/bydleni-preview" },
  { label: "Pro pracující", desc: "Levné pokoje blízko práce", href: "/bydleni-preview" },
  { label: "Hostely & ubytovny", desc: "Levné alternativy", href: "/bydleni-preview" },
];

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  function DropdownTrigger({
    label,
    id,
    items,
  }: {
    label: string;
    id: string;
    items: typeof NAV_PRACE;
  }) {
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    return (
      <div
        className="relative"
        onMouseEnter={() => {
          clearTimeout(timeoutRef.current);
          setOpenDropdown(id);
        }}
        onMouseLeave={() => {
          timeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
        }}
      >
        <button
          className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors"
          onClick={() => setOpenDropdown(openDropdown === id ? null : id)}
        >
          {label}
          <svg
            className={`w-3.5 h-3.5 transition-transform ${openDropdown === id ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {openDropdown === id && (
          <div className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-[#111128]/95 backdrop-blur-xl border border-white/[0.08] p-2 shadow-2xl z-50">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block rounded-lg px-3 py-2.5 hover:bg-white/[0.06] transition-colors"
                onClick={() => setOpenDropdown(null)}
              >
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="text-xs text-white/40 mt-0.5">{item.desc}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a12]/90 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-white">
          WOKER
        </Link>

        <div className="hidden md:flex items-center gap-7">
          <DropdownTrigger label="Práce" id="prace" items={NAV_PRACE} />
          <DropdownTrigger label="Bydlení" id="bydleni" items={NAV_BYDLENI} />
          <Link href="/dokumenty-preview" className="text-sm text-white/70 hover:text-white transition-colors">
            Dokumenty
          </Link>
          <Link href="/cenik" className="text-sm text-white/70 hover:text-white transition-colors">
            Plány
          </Link>
          <Link href="/zdarma" className="text-sm text-white/70 hover:text-white transition-colors">
            Přihlásit se
          </Link>
          <Link
            href="/zdarma"
            className="ml-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 transition-all"
          >
            Začít zdarma
          </Link>
        </div>

        <button
          className="md:hidden text-white/70 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Zavřít menu" : "Otevřít menu"}
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a12]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 pb-6 pt-2">
          <p className="text-xs text-white/40 uppercase tracking-wider mt-3 mb-1 px-2">Práce</p>
          {NAV_PRACE.map((item) => (
            <Link key={item.label} href={item.href} className="block px-2 py-2 text-sm text-white/70 hover:text-white" onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
          <p className="text-xs text-white/40 uppercase tracking-wider mt-4 mb-1 px-2">Bydlení</p>
          {NAV_BYDLENI.map((item) => (
            <Link key={item.label} href={item.href} className="block px-2 py-2 text-sm text-white/70 hover:text-white" onClick={() => setMobileOpen(false)}>
              {item.label}
            </Link>
          ))}
          <div className="border-t border-white/[0.06] mt-4 pt-4 flex flex-col gap-2">
            <Link href="/dokumenty-preview" className="px-2 py-2 text-sm text-white/70 hover:text-white" onClick={() => setMobileOpen(false)}>
              Dokumenty
            </Link>
            <Link href="/cenik" className="px-2 py-2 text-sm text-white/70 hover:text-white" onClick={() => setMobileOpen(false)}>
              Plány
            </Link>
            <Link href="/zdarma" className="px-2 py-2 text-sm text-white/70 hover:text-white" onClick={() => setMobileOpen(false)}>
              Přihlásit se
            </Link>
            <Link
              href="/zdarma"
              className="mt-2 block text-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12]"
              onClick={() => setMobileOpen(false)}
            >
              Začít zdarma
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── CV Text for typing animation ─── */
const CV_LINES = [
  "LEBENSLAUF",
  "",
  "Persönliche Daten",
  "Name: Martin Novák",
  "Geburtsdatum: 15.03.1990",
  "Adresse: Zürich, Schweiz",
  "",
  "Berufserfahrung",
  "2020-2024 | Skladník | Emmi AG, Zürich",
  "- Warenannahme und Qualitätskontrolle",
  "- Bedienung von Gabelstaplern",
  "- Kommissionierung und Versand",
  "",
  "2017-2020 | Lagerarbeiter | DHL, Praha",
  "- Sortierung und Verpackung",
  "- Inventarverwaltung",
  "",
  "Ausbildung",
  "2014 | Střední odborné učiliště, Praha",
  "",
  "Sprachkenntnisse",
  "Deutsch: B1 | Tschechisch: Muttersprache",
];

/* ─── Typing Demo ─── */
function TypingDemo() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [phase, setPhase] = useState<"form" | "typing" | "done" | "reset">("form");

  useEffect(() => {
    if (phase === "form") {
      const timer = setTimeout(() => setPhase("typing"), 2000);
      return () => clearTimeout(timer);
    }

    if (phase === "typing") {
      if (currentLine >= CV_LINES.length) {
        const timer = setTimeout(() => setPhase("done"), 50);
        return () => clearTimeout(timer);
      }

      const line = CV_LINES[currentLine];

      if (line === "") {
        const timer = setTimeout(() => {
          setDisplayedLines((prev) => [...prev, ""]);
          setCurrentLine((prev) => prev + 1);
          setCurrentChar(0);
        }, 100);
        return () => clearTimeout(timer);
      }

      if (currentChar < line.length) {
        const timer = setTimeout(() => {
          setDisplayedLines((prev) => {
            const next = [...prev];
            if (next.length <= currentLine) {
              next.push(line.substring(0, currentChar + 1));
            } else {
              next[currentLine] = line.substring(0, currentChar + 1);
            }
            return next;
          });
          setCurrentChar((prev) => prev + 1);
        }, 25 + Math.random() * 20);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setCurrentLine((prev) => prev + 1);
          setCurrentChar(0);
        }, 80);
        return () => clearTimeout(timer);
      }
    }

    if (phase === "done") {
      const timer = setTimeout(() => setPhase("reset"), 3000);
      return () => clearTimeout(timer);
    }

    if (phase === "reset") {
      const timer = setTimeout(() => {
        setDisplayedLines([]);
        setCurrentLine(0);
        setCurrentChar(0);
        setPhase("form");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [phase, currentLine, currentChar]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Form fields */}
      <motion.div
        animate={{ opacity: phase === "form" ? 1 : 0.3, height: phase === "form" ? "auto" : 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden mb-6"
      >
        <div className="space-y-3">
          {[
            { label: "Jméno", value: "Martin Novák" },
            { label: "Pozice", value: "Skladník" },
            { label: "Zkušenosti", value: "7 let v logistice" },
          ].map((field) => (
            <div key={field.label} className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-4 py-3">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">{field.label}</p>
              <p className="text-white text-sm">{field.value}</p>
            </div>
          ))}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-center text-white/40 text-xs mt-2"
          >
            Generuji životopis...
          </motion.div>
        </div>
      </motion.div>

      {/* CV preview */}
      <motion.div
        animate={{ opacity: phase === "typing" || phase === "done" ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 sm:p-8 font-mono text-sm leading-relaxed min-h-[360px]"
      >
        {displayedLines.map((line, i) => (
          <div key={i} className={`${i === 0 ? "text-[#39ff6e] font-bold text-lg mb-3" : line.startsWith("-") ? "text-white/50 pl-4" : line === "" ? "h-3" : line.match(/^(Persönliche|Berufserfahrung|Ausbildung|Sprachkenntnisse)/) ? "text-white font-semibold mt-2 mb-1" : "text-white/70"}`}>
            {line}
          </div>
        ))}
        {phase === "typing" && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="inline-block w-2 h-4 bg-[#39ff6e] ml-0.5 -mb-0.5"
          />
        )}
      </motion.div>
    </div>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-24 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
        <Link href="/" className="hover:text-white transition-colors">
          &larr; Zpět na hlavní stránku
        </Link>
        <p>&copy; {new Date().getFullYear()} Woker</p>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function DokumentyPreviewPage() {
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Dokumenty v němčině{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39ff6e] to-[#32e060]">
                za minutu
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-5 text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Zadej česky, dostaneš profesionální dokumenty v němčině.
              AI vygeneruje životopis, motivační dopis i celé Bewerbungsdossier.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Typing demo */}
      <section className="px-4 sm:px-6 pb-8">
        <FadeIn delay={0.2}>
          <TypingDemo />
        </FadeIn>
      </section>

      {/* Document types */}
      <section className="px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "Profesionální životopis", desc: "Lebenslauf podle švýcarských standardů", icon: "CV" },
                { title: "Motivační dopis", desc: "Bewerbungsschreiben na míru pozici", icon: "MD" },
                { title: "Bewerbungsdossier", desc: "Kompletní balíček pro zaměstnavatele", icon: "BD" },
              ].map((doc) => (
                <div key={doc.title} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 text-center hover:border-white/[0.12] transition-all">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-[#39ff6e]/10 flex items-center justify-center">
                    <span className="text-[#39ff6e] font-bold text-sm">{doc.icon}</span>
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{doc.title}</h3>
                  <p className="text-white/40 text-xs">{doc.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-12">
        <FadeIn>
          <div className="max-w-2xl mx-auto text-center rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 sm:p-12">
            <p className="text-white font-bold text-lg sm:text-xl mb-2">
              Vyzkoušej zdarma
            </p>
            <p className="text-white/50 text-sm mb-6">
              První dokument je na nás.
            </p>
            <Link
              href="/zdarma"
              className="inline-block px-8 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 transition-all shadow-lg shadow-[#39ff6e]/20"
            >
              Vytvořit životopis
            </Link>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}
