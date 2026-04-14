"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";

/* ─── SEO handled via generateMetadata in layout or head ─── */
// Note: metadata export not possible in 'use client' — see layout.tsx

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

/* ─── Job data ─── */
const ALL_JOBS = [
  { title: "Skladník", location: "Zürich", company: "Emmi AG", salary: "CHF 4 200", tag: "Nové" as const },
  { title: "Elektrikář", location: "Bern", company: "ABB Schweiz", salary: "CHF 5 100", tag: "Hot" as const },
  { title: "Svářeč", location: "Winterthur", company: "Sulzer AG", salary: "CHF 5 400", tag: "Nové" as const },
  { title: "Kuchař", location: "Luzern", company: "SV Group", salary: "CHF 4 500", tag: "" as const },
  { title: "Řidič", location: "Aargau", company: "Planzer AG", salary: "CHF 4 800", tag: "Hot" as const },
  { title: "Čistič", location: "Basel", company: "ISS Facility", salary: "CHF 3 800", tag: "" as const },
  { title: "Malíř", location: "St. Gallen", company: "Malerbetrieb Huber", salary: "CHF 4 600", tag: "Nové" as const },
  { title: "Instalatér", location: "Zug", company: "Meier Haustechnik", salary: "CHF 5 200", tag: "" as const },
  { title: "CNC operátor", location: "Schaffhausen", company: "Georg Fischer", salary: "CHF 5 000", tag: "Hot" as const },
  { title: "Soustružník", location: "Thurgau", company: "Bühler AG", salary: "CHF 4 900", tag: "Nové" as const },
  { title: "Pomocný dělník", location: "Solothurn", company: "Strabag AG", salary: "CHF 3 900", tag: "" as const },
  { title: "Tesař", location: "Graubünden", company: "Uffer AG", salary: "CHF 5 300", tag: "Hot" as const },
];

/* ─── Animated Job Feed ─── */
function AnimatedJobFeed() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setOffset((prev) => (prev + 1) % ALL_JOBS.length);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const visible: typeof ALL_JOBS = [];
  for (let i = 0; i < 5; i++) {
    visible.push(ALL_JOBS[(offset + i) % ALL_JOBS.length]);
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {visible.map((job) => (
          <motion.div
            key={`${job.title}-${job.company}`}
            layout
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 sm:px-5 sm:py-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm sm:text-base truncate">
                  {job.title}
                </p>
                {job.tag && (
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      job.tag === "Nové"
                        ? "bg-[#39ff6e]/20 text-[#39ff6e]"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {job.tag}
                  </span>
                )}
              </div>
              <p className="text-white/40 text-xs mt-0.5">
                {job.location} &middot; {job.company}
              </p>
            </div>
            <span className="text-[#39ff6e] font-bold text-sm whitespace-nowrap ml-3">
              {job.salary}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
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
export default function PracePage() {
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Najdi práci{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39ff6e] to-[#32e060]">
                ve Švýcarsku
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-5 text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Aktuální nabídky práce pro české a slovenské pracovníky.
              Nové pozice každý den od ověřených agentur.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Job feed */}
      <section className="px-4 sm:px-6 pb-4">
        <div className="max-w-3xl mx-auto">
          <FadeIn delay={0.2}>
            <AnimatedJobFeed />
          </FadeIn>
        </div>
      </section>

      {/* Blur overlay + CTA */}
      <section className="px-4 sm:px-6">
        <div className="max-w-3xl mx-auto relative">
          {/* Blurred fake jobs behind */}
          <div className="space-y-3 select-none pointer-events-none" aria-hidden="true">
            {[
              { t: "Zámečník — Bern", c: "Rychiger AG", s: "CHF 5 100" },
              { t: "Lakýrník — Aargau", c: "Aebi Schmidt", s: "CHF 4 700" },
              { t: "Truhlář — Zürich", c: "Stutz AG", s: "CHF 4 900" },
            ].map((fake) => (
              <div
                key={fake.t}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-5 py-4 blur-[6px]"
              >
                <div>
                  <p className="text-white font-semibold text-sm">{fake.t}</p>
                  <p className="text-white/40 text-xs mt-0.5">{fake.c}</p>
                </div>
                <span className="text-[#39ff6e] font-bold text-sm">{fake.s}</span>
              </div>
            ))}
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/90 to-transparent rounded-2xl">
            <p className="text-white font-bold text-lg sm:text-xl text-center px-4 mb-5">
              Zaregistruj se zdarma a získej přístup ke všem nabídkám
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
              <p className="text-2xl sm:text-3xl font-extrabold text-white">Každý den</p>
              <p className="text-white/50 text-sm mt-1">nové nabídky</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">0 EUR</p>
              <p className="text-white/50 text-sm mt-1">žádné poplatky</p>
            </div>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}
