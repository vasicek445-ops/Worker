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

/* ─── Browser Chrome wrapper for mockups ─── */
function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0a0a12] shadow-2xl shadow-black/40">
      {/* Browser bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111120] border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="px-4 py-1 rounded-md bg-white/[0.06] text-[11px] text-white/30 font-mono">
            gowoker.com/dashboard
          </div>
        </div>
        <div className="w-[52px]" />
      </div>
      {/* Content */}
      <div className="p-4 sm:p-6 min-h-[340px] sm:min-h-[400px]">
        {children}
      </div>
    </div>
  );
}

/* ─── SVG Progress Ring ─── */
function ProgressRing({ progress }: { progress: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" className="shrink-0">
      <circle cx="24" cy="24" r={r} fill="none" stroke="white" strokeOpacity={0.08} strokeWidth={4} />
      <circle
        cx="24"
        cy="24"
        r={r}
        fill="none"
        stroke="#39ff6e"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 24 24)"
        className="transition-all duration-700 ease-out"
      />
      <text x="24" y="24" textAnchor="middle" dominantBaseline="central" fill="white" fontSize="11" fontWeight="bold">
        {progress}%
      </text>
    </svg>
  );
}

/* ─── Mockup 1: Dashboard Overview ─── */
function MockupDashboard() {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const CYCLE = 8000;

  useEffect(() => {
    let start = Date.now();
    let frame: ReturnType<typeof setTimeout>;

    function tick() {
      const elapsed = (Date.now() - start) % CYCLE;
      const pct = Math.min(75, Math.floor((elapsed / 3000) * 75));
      setProgress(pct);

      if (elapsed < 2000) setStep(0);
      else if (elapsed < 3500) setStep(1);
      else if (elapsed < 5500) setStep(2);
      else if (elapsed < 7000) setStep(3);
      else {
        start = Date.now();
        setStep(0);
      }

      frame = setTimeout(tick, 50);
    }
    tick();
    return () => clearTimeout(frame);
  }, []);

  const stats = [
    { label: "Práce", value: "999", gradient: "from-orange-500 to-amber-500" },
    { label: "Bydlení", value: "4 600", gradient: "from-cyan-500 to-blue-500" },
    { label: "Agentur", value: "1 007", gradient: "from-purple-500 to-pink-500" },
    { label: "Přihlášky", value: "3", gradient: "from-[#39ff6e] to-emerald-500" },
  ];

  const steps = ["Profil", "CV", "Matching", "Přihláška"];

  return (
    <div className="space-y-5">
      {/* Greeting row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-base sm:text-lg">
            Ahoj, Martin <span className="inline-block" aria-hidden="true">👋</span>
          </h3>
          <p className="text-white/40 text-xs mt-0.5">Tvůj profil je skoro hotový</p>
        </div>
        <ProgressRing progress={progress} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-[#111120] border border-white/[0.06] p-3 text-center"
          >
            <p className={`text-lg sm:text-xl font-extrabold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>
              {s.value}
            </p>
            <p className="text-white/40 text-[10px] sm:text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress stepper */}
      <div className="relative">
        {/* Connector lines */}
        <div className="absolute top-[14px] sm:top-[16px] left-[14%] right-[14%] flex gap-0" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex-1 px-1">
              <div
                className={`h-0.5 rounded-full transition-all duration-500 ${
                  i < step ? "bg-[#39ff6e]" : "bg-white/[0.06]"
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex items-start justify-between relative z-10">
          {steps.map((label, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div key={label} className="flex flex-col items-center gap-1.5" style={{ width: "25%" }}>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    done
                      ? "bg-[#39ff6e] text-[#0a0a12]"
                      : active
                      ? "bg-[#39ff6e]/20 text-[#39ff6e] ring-2 ring-[#39ff6e]/40 animate-pulse"
                      : "bg-white/[0.06] text-white/30"
                  }`}
                >
                  {done ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-[10px] sm:text-xs transition-colors text-center ${done || active ? "text-white/70" : "text-white/30"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Mockup 2: Smart Matching ─── */
function MockupMatching() {
  const [phase, setPhase] = useState<"idle" | "loading" | "results">("idle");
  const [visibleResults, setVisibleResults] = useState(0);
  const CYCLE = 10000;

  useEffect(() => {
    let start = Date.now();
    let frame: ReturnType<typeof setTimeout>;

    function tick() {
      const elapsed = (Date.now() - start) % CYCLE;

      if (elapsed < 2500) {
        setPhase("idle");
        setVisibleResults(0);
      } else if (elapsed < 4000) {
        setPhase("loading");
        setVisibleResults(0);
      } else if (elapsed < 9500) {
        setPhase("results");
        const resultTime = elapsed - 4000;
        if (resultTime < 600) setVisibleResults(1);
        else if (resultTime < 1200) setVisibleResults(2);
        else setVisibleResults(3);
      } else {
        start = Date.now();
      }

      frame = setTimeout(tick, 80);
    }
    tick();
    return () => clearTimeout(frame);
  }, []);

  const results = [
    { name: "Adecco Schweiz AG", loc: "Zürich", match: 92, color: "text-[#39ff6e] bg-[#39ff6e]/15", phone: "+41 44 123 45 67" },
    { name: "Manpower AG", loc: "Bern", match: 87, color: "text-[#39ff6e] bg-[#39ff6e]/15", phone: "+41 31 987 65 43" },
    { name: "Kelly Services", loc: "Luzern", match: 78, color: "text-cyan-400 bg-cyan-400/15", phone: "+41 41 555 12 34" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">🎯</span>
        <h3 className="text-white font-bold text-base sm:text-lg">Smart Matching</h3>
      </div>

      {/* Profile summary */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Obor", value: "Stavebnictví" },
          { label: "Pozice", value: "Elektrikář" },
          { label: "Kanton", value: "Zürich" },
          { label: "Němčina", value: "A2" },
        ].map((f) => (
          <div key={f.label} className="rounded-lg bg-[#111120] border border-white/[0.06] px-3 py-2">
            <p className="text-white/30 text-[10px] uppercase tracking-wider">{f.label}</p>
            <p className="text-white text-sm font-medium">{f.value}</p>
          </div>
        ))}
      </div>

      {/* Button / Loading / Results */}
      {phase === "idle" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-2"
        >
          <div className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] font-bold text-sm cursor-default shadow-lg shadow-[#39ff6e]/20">
            Spustit matching
          </div>
        </motion.div>
      )}

      {phase === "loading" && (
        <div className="flex flex-col items-center gap-3 py-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-8 h-8 rounded-full border-2 border-[#39ff6e]/30 border-t-[#39ff6e]"
          />
          <p className="text-white/50 text-xs">Hledám nejlepší agentury...</p>
        </div>
      )}

      {phase === "results" && (
        <div className="space-y-2">
          {results.slice(0, visibleResults).map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="flex items-center justify-between rounded-xl bg-[#111120] border border-white/[0.06] px-3 sm:px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-white font-semibold text-sm truncate">{r.name}</p>
                <p className="text-white/40 text-[11px]">{r.loc} &middot; {r.phone}</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.color}`}>
                  {r.match}%
                </span>
                <div className="hidden sm:block px-3 py-1 rounded-lg bg-white/[0.06] text-white/60 text-[11px] font-medium cursor-default hover:bg-white/[0.1] transition-colors">
                  Přihlásit se
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Mockup 3: CV Generator ─── */
function MockupCV() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const skills = [
    "Flurförderfahrzeuge",
    "Lagerverwaltungssysteme",
    "Wareneingang",
    "Bestandsverwaltung",
    "Versandvorbereitung",
    "Arbeitssicherheit",
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xl" aria-hidden="true">📄</span>
        <h3 className="text-white font-bold text-base sm:text-lg">AI Životopis</h3>
      </div>

      {/* CV Document */}
      <div className={`rounded-xl bg-white overflow-hidden transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        {/* CV Header - dark */}
        <div className="bg-[#1a1a2e] px-5 py-4 flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-gray-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-bold text-lg leading-tight">Václav Kočka</h4>
            <p className="text-white/50 text-[11px] uppercase tracking-wider mt-0.5">Lagerlogistiker / Staplerfahrer</p>
            <p className="text-white/30 text-[10px] mt-1">Hauptstrasse 15, 6004 Luzern &middot; +41 76 266 59 75</p>
          </div>
        </div>

        {/* CV Body */}
        <div className="px-5 py-4 grid grid-cols-5 gap-4 text-[10px] leading-relaxed">
          {/* Left column - 3/5 */}
          <div className="col-span-3 space-y-3">
            {/* Summary */}
            <p className="text-gray-500 text-[9px] leading-relaxed">
              Motivierter und zuverlässiger Logistiker mit praktischer Erfahrung im Lager- und Materialflussmanagement.
            </p>

            {/* Experience */}
            <div>
              <h5 className="text-red-600 font-bold text-[10px] uppercase tracking-wider border-b border-red-600/20 pb-1 mb-2">Berufserfahrung</h5>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-900 font-semibold text-[10px]">Lagerlogistiker / Staplerfahrer</p>
                  <p className="text-gray-400 text-[9px] italic">Turbo Express Logistik · Tschechien</p>
                </div>
                <span className="text-red-500 text-[9px] whitespace-nowrap">01.2023 – Aktuell</span>
              </div>
              <ul className="mt-1 space-y-0.5 text-gray-600 text-[9px]">
                <li className="flex gap-1"><span className="text-red-400">→</span> Führen von Flurförderfahrzeugen</li>
                <li className="flex gap-1"><span className="text-red-400">→</span> Organisieren von Warenbeständen</li>
                <li className="flex gap-1"><span className="text-red-400">→</span> Wareneingangs- und Ausgangsprüfungen</li>
              </ul>
            </div>

            {/* Education */}
            <div>
              <h5 className="text-red-600 font-bold text-[10px] uppercase tracking-wider border-b border-red-600/20 pb-1 mb-2">Ausbildung</h5>
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-900 font-semibold text-[9px]">Flurförderfahrzeugführerschein</p>
                  <p className="text-gray-400 text-[9px] italic">Berufsbildungszentrum für Logistik</p>
                </div>
                <span className="text-red-500 text-[9px]">2021 – 2023</span>
              </div>
            </div>
          </div>

          {/* Right column - 2/5 */}
          <div className="col-span-2 space-y-3">
            {/* Languages */}
            <div>
              <h5 className="text-red-600 font-bold text-[10px] uppercase tracking-wider border-b border-red-600/20 pb-1 mb-2">Sprachen</h5>
              <div className="space-y-1.5">
                {[["Tschechisch", "Muttersprache", "100%"], ["Deutsch", "B1", "60%"], ["Englisch", "A2", "35%"]].map(([lang, level, w]) => (
                  <div key={lang}>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-gray-800 font-medium">{lang}</span>
                      <span className="text-gray-400">{level}</span>
                    </div>
                    <div className="h-1 rounded-full bg-gray-200 mt-0.5">
                      <div className="h-full rounded-full bg-red-500/70" style={{ width: w }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h5 className="text-red-600 font-bold text-[10px] uppercase tracking-wider border-b border-red-600/20 pb-1 mb-2">Fachkenntnisse</h5>
              <div className="flex flex-wrap gap-1">
                {skills.map((s) => (
                  <span key={s} className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-700 text-[8px] font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Template switcher */}
      <div className="flex gap-2">
        {["Klasický", "Moderní", "Swiss"].map((t, i) => (
          <div
            key={t}
            className={`flex-1 text-center text-[10px] py-1.5 rounded-md cursor-default transition-all ${
              i === 0
                ? "bg-[#39ff6e]/15 text-[#39ff6e] font-bold border border-[#39ff6e]/30"
                : "bg-white/[0.04] text-white/30 border border-white/[0.06]"
            }`}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Dashboard Showcase (tabbed mockups) ─── */
function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: "Dashboard", icon: "📊" },
    { label: "Smart Matching", icon: "🎯" },
    { label: "Životopis", icon: "📄" },
  ];

  return (
    <section className="pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3">
            Podívej se jak to{" "}
            <span className="text-[#39ff6e]">funguje</span>
          </h2>
          <p className="text-white/40 text-center text-sm mb-8 max-w-lg mx-auto">
            Tohle všechno se děje automaticky. Ty jen klikneš.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          {/* Tab bar */}
          <div className="flex justify-center gap-1 sm:gap-2 mb-6" role="tablist">
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                role="tab"
                aria-selected={activeTab === i}
                onClick={() => setActiveTab(i)}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === i
                    ? "bg-[#39ff6e]/15 text-[#39ff6e] border border-[#39ff6e]/30"
                    : "bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/60 hover:border-white/[0.12]"
                }`}
              >
                <span className="mr-1.5" aria-hidden="true">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Mockup container */}
          <BrowserFrame>
            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  role="tabpanel"
                >
                  <MockupDashboard />
                </motion.div>
              )}
              {activeTab === 1 && (
                <motion.div
                  key="matching"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  role="tabpanel"
                >
                  <MockupMatching />
                </motion.div>
              )}
              {activeTab === 2 && (
                <motion.div
                  key="cv"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  role="tabpanel"
                >
                  <MockupCV />
                </motion.div>
              )}
            </AnimatePresence>
          </BrowserFrame>

          <div className="mt-8 text-center">
            <Link
              href="/zdarma"
              className="inline-block px-8 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 transition-all shadow-lg shadow-[#39ff6e]/20"
            >
              Vyzkoušet zdarma →
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
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

      {/* Automation showcase */}
      <DashboardShowcase />

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
