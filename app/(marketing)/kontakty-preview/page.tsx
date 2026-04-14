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

/* ─── Agency data ─── */
const AGENCIES_VISIBLE = [
  { name: "Adecco Schweiz AG", location: "Zürich", phone: "+41 44 *** ** **" },
  { name: "Manpower AG", location: "Bern", phone: "+41 31 *** ** **" },
  { name: "Randstad Schweiz", location: "Basel", phone: "+41 61 *** ** **" },
  { name: "Kelly Services", location: "Luzern", phone: "+41 41 *** ** **" },
  { name: "Hays AG", location: "Zürich", phone: "+41 44 *** ** **" },
  { name: "Michael Page", location: "Zürich", phone: "+41 44 *** ** **" },
  { name: "Robert Half", location: "Bern", phone: "+41 31 *** ** **" },
  { name: "Temptrend AG", location: "Basel", phone: "+41 61 *** ** **" },
];

const AGENCIES_BLURRED = [
  { name: "Personal Sigma", location: "Winterthur", phone: "+41 52 *** ** **" },
  { name: "Job AG", location: "Aargau", phone: "+41 56 *** ** **" },
  { name: "Interiman Group", location: "Genf", phone: "+41 22 *** ** **" },
  { name: "Careerplus AG", location: "Bern", phone: "+41 31 *** ** **" },
  { name: "Grafton Recruitment", location: "Zürich", phone: "+41 44 *** ** **" },
  { name: "Universal Job", location: "Basel", phone: "+41 61 *** ** **" },
  { name: "Swisslog AG", location: "Luzern", phone: "+41 41 *** ** **" },
  { name: "Express Personnel", location: "St. Gallen", phone: "+41 71 *** ** **" },
];

/* ─── Scrolling Agency List ─── */
function AgencyList() {
  const visibleAgencies = AGENCIES_VISIBLE.slice(0, 8);

  return (
    <div className="space-y-2">
      {visibleAgencies.map((agency, i) => (
        <motion.div
          key={agency.name}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 sm:px-5 sm:py-4"
        >
          <div className="min-w-0 flex-1">
            <p className="text-white font-semibold text-sm sm:text-base">{agency.name}</p>
            <p className="text-white/40 text-xs mt-0.5">{agency.location}</p>
          </div>
          <span className="text-white/30 text-xs sm:text-sm font-mono whitespace-nowrap ml-3">
            {agency.phone}
          </span>
        </motion.div>
      ))}
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
export default function KontaktyPreviewPage() {
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39ff6e] to-[#32e060]">
                1 007
              </span>{" "}
              ověřených pracovních agentur
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-5 text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Přímé kontakty na švýcarské pracovní agentury.
              Telefonní čísla, e-maily, adresy. Vše na jednom místě.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Visible agencies */}
      <section className="px-4 sm:px-6 pb-4">
        <div className="max-w-3xl mx-auto">
          <FadeIn delay={0.2}>
            <AgencyList />
          </FadeIn>
        </div>
      </section>

      {/* Blurred agencies + CTA overlay */}
      <section className="px-4 sm:px-6">
        <div className="max-w-3xl mx-auto relative">
          <div className="space-y-2 select-none pointer-events-none" aria-hidden="true">
            {AGENCIES_BLURRED.map((agency) => (
              <div
                key={agency.name}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-5 py-4 blur-[6px]"
              >
                <div>
                  <p className="text-white font-semibold text-sm">{agency.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{agency.location}</p>
                </div>
                <span className="text-white/30 text-sm font-mono">{agency.phone}</span>
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/90 to-transparent rounded-2xl">
            <p className="text-white font-bold text-lg sm:text-xl text-center px-4 mb-5">
              Zaregistruj se a získej přímé kontakty na všechny agentury
            </p>
            <Link
              href="/zdarma"
              className="px-8 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 transition-all shadow-lg shadow-[#39ff6e]/20"
            >
              Začít zdarma
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="pt-20 pb-12 px-4 sm:px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#39ff6e]">1 007</p>
              <p className="text-white/50 text-sm mt-1">ověřených agentur</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">26 kantonů</p>
              <p className="text-white/50 text-sm mt-1">po celém Švýcarsku</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">Přímé kontakty</p>
              <p className="text-white/50 text-sm mt-1">telefon, email, adresa</p>
            </div>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}
