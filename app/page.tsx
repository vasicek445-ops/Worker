"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import TrustpilotWidget from "./components/TrustpilotWidget";

/* ─── Handle auth redirects (recovery, email confirm) ─── */
function useAuthRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      window.location.replace("/auth/callback" + hash);
    } else if (hash && hash.includes("access_token")) {
      window.location.replace("/auth/callback" + hash);
    }
  }, []);
}

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

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1600;
    const step = Math.ceil(target / (duration / 16));
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        start = target;
        clearInterval(id);
      }
      setVal(start);
    }, 16);
    return () => clearInterval(id);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {val.toLocaleString("cs-CZ")}
      {suffix}
    </span>
  );
}

/* ─── Navbar links ─── */
const NAV_LINKS = [
  { label: "Funkce", href: "/#funkce" },
  { label: "O nás", href: "/o-nas" },
  { label: "Ceník", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

/* ─── Navbar — Flixy style: white bg, logo left, links center, auth right ─── */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a12]/90 backdrop-blur-xl border-b border-white/[0.06]"
          : "bg-[#0a0a12]"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center">
        {/* Logo — left */}
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Woker" className="h-8 w-auto" />
          <span className="text-xl font-extrabold tracking-tight text-white">WOKER</span>
        </Link>

        {/* Desktop nav — center, pushed right */}
        <div className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 hover:text-white transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth — right */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white transition-colors font-medium"
          >
            Přihlásit se
          </Link>
          <Link
            href="/login?tab=register"
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#fb923c] text-[#0a0a12] hover:bg-[#f97316] transition-all"
          >
            Začni ZDARMA
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/70 hover:text-white ml-auto"
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a12]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 pb-6 pt-2">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-2 py-2.5 text-sm text-white/70 hover:text-white font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-white/[0.06] mt-3 pt-3 flex flex-col gap-2">
            <Link
              href="/login"
              className="px-2 py-2.5 text-sm text-white/70 hover:text-white font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Přihlásit se
            </Link>
            <Link
              href="/login?tab=register"
              className="mt-1 block text-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#fb923c] text-[#0a0a12]"
              onClick={() => setMobileOpen(false)}
            >
              Začni ZDARMA
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Bento Card ─── */
/* ─── Animated Feed: Jobs ─── */
function AnimatedJobsFeed() {
  const allJobs = [
    { title: "Skladník — Zürich", company: "Emmi AG", salary: "CHF 4 200", tag: "Nové" },
    { title: "Elektrikář — Bern", company: "ABB Schweiz", salary: "CHF 5 100", tag: "Hot" },
    { title: "Čistič — Basel", company: "ISS Facility", salary: "CHF 3 800", tag: "" },
    { title: "Svářeč — Winterthur", company: "Sulzer AG", salary: "CHF 5 400", tag: "Nové" },
    { title: "Kuchař — Luzern", company: "SV Group", salary: "CHF 4 500", tag: "" },
    { title: "Řidič — Aargau", company: "Planzer AG", salary: "CHF 4 800", tag: "Hot" },
    { title: "Malíř — St. Gallen", company: "Malerbetrieb Huber", salary: "CHF 4 600", tag: "Nové" },
    { title: "Instalatér — Zug", company: "Meier Haustechnik", salary: "CHF 5 200", tag: "" },
    { title: "Pomocný dělník — Schaffhausen", company: "Strabag AG", salary: "CHF 3 900", tag: "" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % (allJobs.length - 2)), 2500);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const visible = allJobs.slice(idx, idx + 3);

  return (
    <div className="mb-5 rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 overflow-hidden">
      {visible.map((job, i) => (
        <motion.div
          key={job.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.08 }}
          className={`flex items-center justify-between py-2.5 ${i < 2 ? "border-b border-white/[0.06]" : ""}`}
        >
          <div>
            <p className="text-white text-xs font-semibold m-0">{job.title}</p>
            <p className="text-white/30 text-[10px] m-0">{job.company}</p>
          </div>
          <div className="flex items-center gap-2">
            {job.tag && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${job.tag === "Nové" ? "bg-[#fb923c]/20 text-[#fb923c]" : "bg-amber-500/20 text-amber-400"}`}>
                {job.tag}
              </span>
            )}
            <span className="text-[#fb923c] text-[11px] font-bold whitespace-nowrap">{job.salary}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Animated Feed: Housing ─── */
function AnimatedHousingFeed() {
  const allHousing = [
    { title: "Pension Susanna — Luzern", price: "CHF 850", type: "Penzion", phone: "+41 76 541 43 04" },
    { title: "SMART DEPART — Zug", price: "CHF 654", type: "Pro pracující", phone: "+41 79 950 06 47" },
    { title: "TomoDomo Coliving — Basel", price: "CHF 574", type: "Ubytovna", phone: "" },
    { title: "Hotel Sternen — Aargau", price: "CHF 990", type: "Penzion", phone: "+41 56 616 90 16" },
    { title: "Il Castagno — Ticino", price: "CHF 417", type: "Komunita", phone: "+41 91 611 40 50" },
    { title: "Gästehaus Koller — Appenzell", price: "CHF 780", type: "Penzion", phone: "+41 71 787 02 22" },
    { title: "Casa Fortuna — Suhr", price: "CHF 1 620", type: "Penzion", phone: "+41 76 325 89 20" },
    { title: "flexy.motel — Aargau", price: "CHF 600", type: "Pro pracující", phone: "" },
    { title: "Lake Lucerne Apt — Nidwalden", price: "CHF 1 107", type: "Byty", phone: "+41 41 620 73 73" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % (allHousing.length - 2)), 3000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const visible = allHousing.slice(idx, idx + 3);

  return (
    <div className="mb-5 rounded-xl bg-white/[0.02] border border-white/[0.06] p-3 overflow-hidden">
      {visible.map((h, i) => (
        <motion.div
          key={h.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.08 }}
          className={`flex items-center justify-between py-2.5 ${i < 2 ? "border-b border-white/[0.06]" : ""}`}
        >
          <div>
            <p className="text-white text-xs font-semibold m-0">{h.title}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] bg-cyan-500/20 text-cyan-400 font-bold px-1.5 py-0.5 rounded">{h.type}</span>
              {h.phone && <span className="text-[9px] text-white/30">📞</span>}
            </div>
          </div>
          <span className="text-cyan-400 text-[11px] font-bold whitespace-nowrap">{h.price}/měs.</span>
        </motion.div>
      ))}
    </div>
  );
}

function BentoCard({
  headline,
  text,
  cta,
  href,
  accent = "green",
  large = false,
  delay = 0,
  imagePlaceholder,
}: {
  headline: string;
  text: string;
  cta: string;
  href: string;
  accent?: "green" | "cyan";
  large?: boolean;
  delay?: number;
  imagePlaceholder?: string;
}) {
  return (
    <FadeIn delay={delay} className={large ? "md:col-span-1" : ""}>
      <Link href={href} className="block h-full group">
        <div
          className={`relative h-full rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 ${
            large ? "sm:p-8" : "sm:p-6"
          } transition-all duration-300 hover:border-white/[0.12] hover:scale-[1.01] overflow-hidden`}
        >
          {imagePlaceholder === "jobs" && large && <AnimatedJobsFeed />}
          {imagePlaceholder === "housing" && large && <AnimatedHousingFeed />}
          <div
            className={`absolute left-0 ${large ? "top-6 bottom-6" : "top-6 bottom-6"} w-[3px] rounded-full ${
              accent === "green" ? "bg-[#fb923c]" : "bg-cyan-400"
            }`}
          />
          <div className="pl-4">
            <h3
              className={`font-bold text-white ${
                large ? "text-xl sm:text-2xl" : "text-lg"
              } mb-2`}
            >
              {headline}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed mb-4">{text}</p>
            <span
              className={`text-sm font-medium ${
                accent === "green" ? "text-[#fb923c]" : "text-cyan-400"
              } group-hover:underline`}
            >
              {cta}
            </span>
          </div>
        </div>
      </Link>
    </FadeIn>
  );
}

/* ─── Comparison Table ─── */
function ComparisonTable() {
  const rows = [
    { label: "Cena", woker: "19,99 EUR/měs", agentura: "~600 EUR", sam: "0 EUR" },
    {
      label: "Nabídky práce",
      woker: "AI ti vybere za 5 minut",
      agentura: "Co zrovna mají",
      sam: "Scrolluješ hodiny sám",
    },
    { label: "Bydlení", woker: "4 600 nabídek s telefonem", agentura: "Neřešíme", sam: "Hledáš na německých webech" },
    {
      label: "Dokumenty",
      woker: "Německy za 90 sekund",
      agentura: "Word šablona",
      sam: "Google Translate",
    },
    {
      label: "Jazyk",
      woker: "Česky, slovensky, polsky",
      agentura: "Německy",
      sam: "Německy",
    },
    {
      label: "Podpora",
      woker: "Komunita lidí co tam žijou",
      agentura: "Až po zaplacení",
      sam: "Nikdo",
    },
    {
      label: "Rychlost",
      woker: "Pod 5 minut",
      agentura: "2-6 týdnů",
      sam: "Týdny googlení",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.08]">
            <th className="text-left py-3 px-4 text-white/40 font-medium" />
            <th className="text-left py-3 px-4 text-[#fb923c] font-bold">Woker</th>
            <th className="text-left py-3 px-4 text-white/40 font-medium">Agentura</th>
            <th className="text-left py-3 px-4 text-white/40 font-medium">Sám</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-3 px-4 text-white/60 font-medium">{row.label}</td>
              <td className="py-3 px-4 text-white font-medium">{row.woker}</td>
              <td className="py-3 px-4 text-white/40">{row.agentura}</td>
              <td className="py-3 px-4 text-white/40">{row.sam}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── VS Card ─── */
function VSCard() {
  const items = [
    { label: "Najde nabídku práce ve Švýcarsku", left: true, right: true },
    { label: "Mluví česky / slovensky", left: true, right: true },
    { label: "Bewerbung v němčině šitý na pozici", left: false, right: true },
    { label: "Byt s přímým kontaktem na majitele", left: false, right: true },
    { label: "Příprava na pohovor + Lohnvorstellung", left: false, right: true },
    { label: "Nezávislá kontrola smlouvy", left: false, right: true },
    { label: "Dostupné 24/7 a návod na povolení / AHV", left: false, right: true },
  ];

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/[0.08]">
      <div className="grid grid-cols-2">
        {/* LEFT — Zprostředkovatel */}
        <div className="bg-white/[0.04] p-5 sm:p-7 pr-7 sm:pr-10 flex flex-col">
          <h3 className="font-extrabold text-white/70 text-[10px] sm:text-xs uppercase tracking-wider mb-6 sm:mb-8 text-center leading-tight pt-4">
            Zprostředkovatel<br />
            <span className="text-white/40">(ČR / SK)</span>
          </h3>
          <ul className="space-y-3.5 sm:space-y-4">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className={`flex-shrink-0 mt-0.5 text-sm sm:text-base font-bold ${
                    item.left ? "text-[#fb923c]" : "text-red-400"
                  }`}
                >
                  {item.left ? "✓" : "✕"}
                </span>
                <span className="text-white/60 text-xs sm:text-sm font-medium leading-snug">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4 border-t border-white/[0.08] flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/illustrations/cost/worried.png" alt="" className="w-7 h-7 sm:w-9 sm:h-9 object-contain flex-shrink-0" />
            <span className="text-white/70 text-xs sm:text-sm font-bold">~600 EUR</span>
          </div>
        </div>

        {/* RIGHT — Woker */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 sm:p-7 pl-7 sm:pl-10 text-white flex flex-col">
          <h3 className="font-extrabold text-white text-[10px] sm:text-xs uppercase tracking-wider mb-6 sm:mb-8 text-center leading-tight pt-4">
            Woker
          </h3>
          <ul className="space-y-3.5 sm:space-y-4">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0 mt-0.5 text-sm sm:text-base font-bold text-white">✓</span>
                <span className="text-white text-xs sm:text-sm font-medium leading-snug">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-4 border-t border-white/30 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/illustrations/cost/happy.png" alt="" className="w-7 h-7 sm:w-9 sm:h-9 object-contain flex-shrink-0" />
            <span className="text-white text-xs sm:text-sm font-extrabold">9 CHF / měs.</span>
          </div>
        </div>
      </div>

      {/* VS badge */}
      <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0a0a12] border-2 border-white/15 flex items-center justify-center shadow-lg">
        <span className="text-white font-extrabold text-[11px] sm:text-xs tracking-wider">VS</span>
      </div>
    </div>
  );
}

/* ─── Footer ─── */
export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0a0a12]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Woker" className="h-7 w-auto" />
            <span className="text-xl font-extrabold tracking-tight text-white">WOKER</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/50 hover:text-white transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-white/[0.06] mt-8 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-xs text-white/30">
              Woker &copy; Copyright 2026, Všechna práva vyhrazena
            </p>
            <p className="text-xs text-white/20 mt-1">
              Žádné skryté poplatky. Tvá data nikdy neprodáváme.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
              <Link href="/podminky" className="text-xs text-white/35 hover:text-white/70 transition-colors">
                Obchodní podmínky
              </Link>
              <Link href="/ochrana-udaju" className="text-xs text-white/35 hover:text-white/70 transition-colors">
                Ochrana osobních údajů
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com/vasicenko" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/35 hover:text-[#fb923c] transition-colors">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="https://tiktok.com/@vasicenko" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="text-white/35 hover:text-[#fb923c] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
            <a href="https://www.facebook.com/vasicenko" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/35 hover:text-[#fb923c] transition-colors">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Testimonial Card ─── */
function TestimonialCard({
  quote,
  name,
  role,
  origin,
  delay,
}: {
  quote: string;
  name: string;
  role: string;
  origin: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay}>
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 h-full">
        <p className="text-white/70 text-sm leading-relaxed mb-4">
          &ldquo;{quote}&rdquo;
        </p>
        <div className="text-sm">
          <span className="text-white font-medium">{name}</span>
          <span className="text-white/40">
            , {role} &middot; {origin}
          </span>
        </div>
      </div>
    </FadeIn>
  );
}

/* ━━━ MAIN PAGE ━━━ */
export default function MarketingPage() {
  // Auth hash redirect (recovery, email confirmation)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes("type=recovery") || hash.includes("access_token"))) {
      window.location.replace("/auth/callback" + hash);
    }
  }, []);
  return (
    <div
      className="min-h-screen bg-[#0a0a12] text-white overflow-x-hidden overflow-y-auto"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: "100vw" }}
    >
      <Navbar />

      {/* ── HERO — Flixy style: text left, graphic right ── */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_auto] gap-8 items-center">
          {/* Left — text */}
          <div className="max-w-xl">
            <FadeIn>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] mb-6">
                <span>🚀</span>
                <span className="text-sm text-white/60">Ušetři čas, peníze i nervy při stěhování do Švýcarska</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.05}>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6 text-white">
                Začni <span className="text-[#fb923c]">vydělávat</span> ve Švýcarsku už <span className="text-[#fb923c]">do 30 dní</span>.
              </h1>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-base sm:text-lg text-white font-semibold mb-8 leading-relaxed">
                <strong className="text-[#fb923c]">#1 AI powered platforma</strong> co za tebe vyřeší celý proces během <strong className="text-[#fb923c]">10 minut</strong>.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <ul className="space-y-3 mb-8">
                {[
                  <><span className="text-[#fb923c]">1 007 Temporärbüro</span> s přímými kontakty — <span className="text-[#fb923c]">nejrychlejší start</span> ve Švýcarsku</>,
                  <><span className="text-[#fb923c]">4 000+ ubytování</span> s přímými kontakty — byty, WG, Gasthaus — <span className="text-[#fb923c]">od 400 CHF/měsíc</span> podle kantonu</>,
                  <><span className="text-[#fb923c]">AI nástroje</span> co za tebe napíšou životopis, motivační dopis, zkontrolují smlouvy a mnohem víc — <span className="text-[#fb923c]">na pár kliknutí</span></>,
                  <><span className="text-[#fb923c]">Smart Matching</span> — vyplníš profil, AI najde Temporärbüro co hledají přesně tebe a odešle přihlášku <span className="text-[#fb923c]">jedním kliknutím</span></>,
                  <><span className="text-[#fb923c]">Kompletní průvodce</span> pojištěním, daněmi a pracovním povolením ve Švýcarsku</>,
                  <><span className="text-[#fb923c]">Spoj se s lidmi</span> co už ve Švýcarsku jsou nebo se tam chystají — <span className="text-[#fb923c]">tak jako právě ty</span></>,
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white font-semibold">
                    <svg className="w-5 h-5 text-[#fb923c] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/login?tab=register"
                  className="px-7 py-3.5 rounded-xl text-base font-bold bg-[#fb923c] text-[#0a0a12] hover:bg-[#f97316] transition-all shadow-lg shadow-[#fb923c]/20"
                >
                  Zaregistruj se a prozkoumej Woker &rarr;
                </Link>
                <Link
                  href="/#funkce"
                  className="flex items-center gap-2 px-4 py-3.5 text-base font-medium text-white/70 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Jak to funguje
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Right — MacBook mockup, overflow right edge like Flixy */}
          <FadeIn delay={0.25}>
            <div className="hidden md:block relative">
              <img
                src="/images/macbook-mockup.png"
                alt="Woker platforma"
                className="w-[550px] max-w-none drop-shadow-2xl"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── AI TOOLS MARQUEE ── */}
      <div className="relative overflow-hidden border-y border-blue-500/20 bg-blue-950/30 py-4">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, copy) => (
            <div key={copy} className="flex items-center gap-8 px-4">
              {[
                "🤖 AI Životopis v němčině",
                "📝 AI Motivační dopis",
                "🎯 Smart Matching",
                "📄 AI Analýza inzerátu",
                "📧 AI Email pro HR",
                "🗣️ AI Příprava na pohovor",
                "📋 AI Analýza smlouvy",
                "💬 AI Asistent Wooky",
                "🏠 AI Hledání bydlení",
                "🇩🇪 AI Němčina pro práci",
              ].map((tool) => (
                <span key={tool} className="text-sm font-medium text-white/50 flex items-center gap-2">
                  {tool}
                  <span className="text-white/10">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
        `}</style>
      </div>

      {/* ── 3 STEPS ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-16 text-white">
              Získej práci ve Švýcarsku ve{" "}
              <span className="text-[#fb923c]">3 krocích:</span>
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left — steps */}
            <div className="space-y-6">
              {[
                {
                  num: "1",
                  title: "Vyplň profil",
                  desc: <>Řekni nám <span className="text-[#fb923c]">co umíš</span>, kde chceš pracovat a <span className="text-[#fb923c]">jakou máš němčinu</span>.</>,
                  icon: "/illustrations/steps/01-profile.png?v=3",
                },
                {
                  num: "2",
                  title: "AI vyřeší zbytek",
                  desc: <>Woker ti <span className="text-[#fb923c]">najde Temporärbüro</span>, napíše životopis v němčině a <span className="text-[#fb923c]">odešle přihlášky</span>.</>,
                  icon: "/illustrations/steps/02-ai.png?v=3",
                },
                {
                  num: "3",
                  title: "Začni vydělávat",
                  desc: <>Nastoupíš do práce <span className="text-[#fb923c]">ve Švýcarsku</span>. Průměrně <span className="text-[#fb923c]">do 30 dní</span>.</>,
                  icon: "/illustrations/steps/03-earning.png?v=3",
                },
              ].map((step, i) => (
                <FadeIn key={step.num} delay={i * 0.1}>
                  <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-7 sm:p-8 flex items-start gap-6">
                    <div className="w-20 h-20 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={step.icon} alt={step.title} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-2">{step.title}</h3>
                      <p className="text-white text-base leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            {/* Right — mockup placeholder */}
            <FadeIn delay={0.3}>
              <div className="hidden md:flex justify-center">
                <img
                  src="/images/macbook-mockup.png"
                  alt="Woker platforma"
                  className="w-[480px] max-w-none drop-shadow-2xl"
                />
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.4}>
            <div className="flex justify-center mt-12">
              <Link
                href="/login?tab=register"
                className="px-7 py-3.5 rounded-xl text-base font-bold bg-[#fb923c] text-[#0a0a12] hover:bg-[#f97316] transition-all shadow-lg shadow-[#fb923c]/20"
              >
                Zaregistruj se a prozkoumej Woker &rarr;
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── VALUE PROP ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left — phone mockup */}
          <FadeIn>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-[280px] h-[560px] rounded-[40px] border-[6px] border-white/10 bg-[#111128] overflow-hidden shadow-2xl shadow-[#fb923c]/5">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-[#0a0a12] rounded-b-2xl" />
                  <img
                    src="/images/macbook-mockup.png"
                    alt="Woker app"
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full bg-[#fb923c]/5 blur-3xl" />
              </div>
            </div>
          </FadeIn>

          {/* Right — headline + features */}
          <div>
            <FadeIn delay={0.1}>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-6">
                Celá tvá cesta za prací ve Švýcarsku v{" "}
                <span className="text-[#fb923c]">1 AI nástroji</span>
              </h2>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 mb-6">
                <p className="text-white/60 text-base leading-relaxed italic">
                  &ldquo;Měsíc jsem googlil Temporärbüro, psal emaily německy přes Google Translate a nikdo neodpovídal. Přes Woker jsem za večer měl hotový životopis v němčině, seznam Temporärbüro v mém kantonu a tři přihlášky odeslané. Za 3 týdny jsem nastoupil.&rdquo;
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <img src="/images/testimonial-martin.png" alt="Martin K." className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-white font-semibold text-sm">Martin K.</p>
                    <p className="text-white/40 text-xs">Elektrikář, kanton Zürich</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-[#fb923c] text-lg">★</span>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <span className="text-[#fb923c]">↗</span>
                <span>AI asistent, životopis, Temporärbüro — vše na jednom místě</span>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS HEADLINE ── */}
      <section className="pt-12 sm:pt-16 pb-2 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
              Připoj Gmail a Woker za tebe osloví{" "}
              <span className="text-orange-400">
                švýcarské firmy, 1007 Temporärbüro a majitele bytů
              </span>{" "}
              na míru tvé situaci:
            </h2>
          </FadeIn>
        </div>
      </section>

      {/* ── FEATURE CARDS (Flixy-style) ── */}
      <section id="funkce" className="scroll-mt-20 py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {[
              {
                image: "/illustrations/cards/01-outreach.png?v=3",
                tag: "Smart Apply",
                title: "Chytrá žádost o práci i bydlení",
                desc: "Připoj Gmail a Woker za tebe napíše profesionální německé zprávy zaměstnavatelům, Temporärbüro i na bydlení — dle švýcarských standardů. Ty klikneš send a emaily vypadají, jako bys je napsal sám — nejsou generické a odcházejí z tvé schránky. Odpovědi chodí přímo tobě.",
              },
              {
                image: "/illustrations/cards/02-prace.png?v=3",
                tag: "Smart Jobs",
                title: "1007 Temporärbüro a stovky švýcarských firem",
                desc: "Volej rovnou tomu, kdo rozhoduje — manuálně nebo přes Smart Apply. Filtruj podle kantonu, jazyka i oboru; u každé najdeš telefon, e-mail i adresu. Temporärbüro jsou nejrychlejší cesta do práce — nástup během několika dní. Firmy jsou pro ty, co přes Temporärbüro pracují delší dobu a chtějí se posunout.",
              },
              {
                image: "/illustrations/cards/03-bydleni.png?v=3",
                tag: "Smart Housing",
                title: "Woker za tebe najde cenově dostupné bydlení",
                desc: "S přímým kontaktem na majitele, neustále zajišťujeme v reálném čase cenu a dostupnost bydlení — tak abys přijel přímo do svého ubytování, než začneš pracovat. Ceny i dostupnost pravidelně aktualizujeme. Průměrný nájem ve Švýcarsku: 400–900+ CHF pro jednotlivce podle kantonu. Pro dvojice či skupiny je to vždy výhodnější — na osobu to vychází průměrně 600–750 CHF na měsíc.",
              },
              {
                image: "/illustrations/cards/04-cv.png?v=4",
                tag: "Smart AI",
                title: "Tvůj AI tým na hledání práce ve Švýcarsku",
                desc: "Životopis, motivační dopis, Bewerbungsdossier, analýza inzerátu, analýza smlouvy i příprava na pohovor — každý nástroj je trénovaný na švýcarský trh a otestovaný švýcarskými náboráři tak, abys dostal nejvyšší možnou kvalitu připravenou k odeslání. Zadáš nám pár jednoduchých informací o sobě, zbytek si AI vezme z tvého profilu — a dřív než si stihneš vypít kafe, máš v ruce životopis nebo motivační dopis na míru, který Švýcaři okamžitě poznají jako svůj.",
              },
              {
                image: "/illustrations/cards/05-pohovor.png?v=2",
                tag: "Smart Interview",
                title: "Nauč se rozumět tomu, co se tě v pohovoru ptají — a odpověz správně",
                desc: "10 otázek šitých na tvou pozici a obor, vzorové odpovědi v němčině podle tvé úrovně (A1-C1), 5 varování, 10 klíčových frází i tip na Lohnvorstellung. AI co si nevymýšlí — pracuje jen s tím, co o sobě napíšeš. Většina lidí ve Švýcarsku začíná bez jazyka — tohle ti dá konkurenční výhodu. A i generické HR otázky ('Hast du Auto?', 'Wann kannst du anfangen?') tě nezaseknou, když je čekáš.",
              },
              {
                image: "/images/3d/wooky-wave.png",
                tag: "Smart Wooky",
                title: "Máš otázky k povolení, daním nebo pojištění? Wooky ti rád odpoví — 24/7.",
                desc: "Wooky je vyladěný na švýcarský trh a je tu, aby ti odpověděl na veškeré otázky od povolení přes daně, pomůže i s pojištěním a registrací na Gemeinde. Najdeš ho zdarma tady na webu i uvnitř Wokeru, kde tě provede celým procesem. Stačí se ho zeptat.",
              },
            ].map((card, i) => (
              <FadeIn key={card.title} delay={i * 0.05}>
                <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 sm:p-8 h-full">
                  <div className="text-orange-400 text-xs sm:text-sm font-semibold uppercase tracking-wide mb-4">
                    {card.tag}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 leading-tight">
                    {card.title}
                    {" "}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={card.image}
                      alt=""
                      className="inline-block w-10 h-10 sm:w-12 sm:h-12 align-middle object-contain"
                    />
                  </h3>
                  <p className="text-white/60 leading-relaxed text-sm sm:text-base">
                    {card.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SET & FORGET ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12 sm:gap-16 items-center">
            <FadeIn>
              <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-6">
                <span className="text-orange-400">Jednou</span> si vyplníš profil a zbytek procesu jede <span className="text-orange-400">automatizovaně</span>.
              </h2>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed">
                Myslím si, že Woker je navržený <span className="text-orange-400 font-semibold">blbuvzdorně</span>
                {" "}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/illustrations/blbuvzdorne.png" alt="" className="inline-block w-7 h-7 sm:w-8 sm:h-8 align-middle object-contain" />
                {" "}
                — stačí si doslova <span className="text-orange-400 font-semibold">jednou vyplnit profil</span> a algoritmus z něj vezme údaje a automaticky ti předvyplní všechno ostatní. Nemusíš nic dalšího vyplňovat a <span className="text-orange-400 font-semibold">šetříš si drahocenný čas</span>.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <div className="relative aspect-[4/5] rounded-3xl bg-gradient-to-br from-orange-500/[0.08] to-white/[0.02] border border-white/[0.06] flex items-center justify-center overflow-hidden">
                <p className="text-white/30 text-sm">Obrázek/mockup sem</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── COST REPLACEMENT ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <FadeIn>
            <div className="rounded-3xl bg-white/[0.03] border border-white/[0.06] p-6 sm:p-10">
              <ul className="space-y-5 sm:space-y-6">
                {[
                  { icon: "/illustrations/cost/apply.png", title: "Smart Apply — auto-žádost o práci i bydlení", replaces: ["Sonara", "LoopCV"], price: 29 },
                  { icon: "/illustrations/cost/cv.png", title: "Smart CV & Bewerbungsdossier", replaces: ["Canva Pro", "Rezi"], price: 34 },
                  { icon: "/illustrations/cost/letter.png?v=2", title: "AI motivační dopisy a komunikace", replaces: ["ChatGPT Plus"], price: 16 },
                  { icon: "/illustrations/cost/interview.png", title: "Smart Interview — AI příprava na pohovor", replaces: ["Yoodli Pro"], price: 6 },
                  { icon: "/illustrations/cost/housing.png", title: "Smart Housing — hledání bytu", replaces: ["Homegate"], price: 30 },
                  { icon: "/illustrations/cost/translation.png", title: "Překlady DE/EN ↔ CZ", replaces: ["DeepL Pro"], price: 8 },
                  { icon: "/illustrations/cost/outreach.png?v=2", title: "Smart Outreach — kontakt na firmy", replaces: ["Lemlist"], price: 62 },
                  { icon: "/illustrations/cost/tracking.png?v=2", title: "Sledování přihlášek", replaces: ["Huntr"], price: 31 },
                ].map((row) => (
                  <li key={row.title} className="flex items-start gap-4 sm:gap-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={row.icon} alt="" className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 object-contain" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base sm:text-lg leading-tight">{row.title}</h3>
                      <p className="text-white/40 text-xs sm:text-sm mt-1">
                        Nahrazuje:{" "}
                        <span className="text-white/60 font-medium">{row.replaces.join(", ")}</span>
                      </p>
                    </div>
                    <div className="text-white font-semibold text-base sm:text-lg whitespace-nowrap">
                      CHF {row.price}
                    </div>
                  </li>
                ))}

                <li className="flex items-start gap-4 sm:gap-5 pt-4 mt-2 border-t border-white/[0.05] opacity-80">
                  <span className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center text-2xl sm:text-3xl" aria-hidden="true">🔗</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white/85 font-medium text-sm sm:text-base leading-tight">
                      Čestná zmínka: Herohero / Patreon influenceři
                    </h3>
                    <p className="text-white/40 text-xs sm:text-sm mt-1">
                      Co dostaneš:{" "}
                      <span className="text-white/60 font-medium">jen sdílené odkazy</span>
                    </p>
                  </div>
                  <div className="text-white/70 font-medium text-sm sm:text-base whitespace-nowrap">
                    CHF 6–15+
                  </div>
                </li>
              </ul>

              <div className="border-t border-white/[0.08] mt-8 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-white/60">
                    <span className="text-red-400 text-lg leading-none">✕</span>
                    <span className="text-sm sm:text-base">Co bys normálně zaplatil</span>
                  </div>
                  <div className="text-red-400/80 line-through font-semibold text-base sm:text-lg">
                    CHF 216 / měs.
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/illustrations/penize.png" alt="" className="w-7 h-7 sm:w-8 sm:h-8 object-contain" />
                    <span className="text-white font-bold text-base sm:text-lg">S Wokerem</span>
                  </div>
                  <div className="text-orange-400 font-extrabold text-xl sm:text-2xl whitespace-nowrap">
                    CHF 9 / měs.
                  </div>
                </div>
              </div>
            </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-6">
                Ušetři <span className="text-orange-400">stovky CHF měsíčně</span>{" "}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/illustrations/penize.png" alt="" className="inline-block w-10 h-10 sm:w-14 sm:h-14 align-middle object-contain" />
                {" "}za jiné aplikace
              </h2>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed">
                Woker nahradí <span className="text-orange-400 font-semibold">auto-apply nástroje, AI CV buildery a 7+ dalších aplikací</span>. Jednodušší, levnější a nakonfigurováno pro švýcarský pracovní trh — místo <span className="text-orange-400 font-semibold">216 CHF měsíčně</span> za 8 různých předplatných máš všechno v jedné appce.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <FadeIn>
              <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-6 text-white">
                Tvoje získání práce ve Švýcarsku <span className="text-orange-400">na automat</span>{" "}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/illustrations/text/automat.png" alt="" className="inline-block w-9 h-9 sm:w-12 sm:h-12 align-middle object-contain" />
                {" "}a <span className="text-orange-400">bez práce</span>.
              </h2>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-4">
                Zachoval jsem <span className="text-orange-400 font-semibold">jasný krok po kroku</span>, aby ses neztratil v celém procesu. A zároveň jsem přidal <span className="text-orange-400 font-semibold">AI, která tě tím procesem provede</span> — tak, aby ses na ničem nezasekl.
              </p>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-8">
                Celý systém je navržený tak, <span className="text-orange-400 font-semibold">abys tím prošel během pár desítek minut</span>{" "}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/illustrations/text/watch.png" alt="" className="inline-block w-7 h-7 sm:w-9 sm:h-9 align-middle object-contain" />
                . Jediné, co nedokážu plně automatizovat, je odezva firmy nebo Temporärbüro.
              </p>
              <Link
                href="/login?tab=register"
                className="inline-block px-7 py-3.5 rounded-xl text-base font-bold bg-[#fb923c] text-[#0a0a12] hover:bg-[#f97316] transition-all shadow-lg shadow-[#fb923c]/20"
              >
                Zaregistruj se a prozkoumej Woker &rarr;
              </Link>
            </FadeIn>

            <FadeIn delay={0.15}>
              <VSCard />
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── RECENZE ── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-center mb-4 text-white leading-tight">
              Co říkají <span className="text-[#fb923c]">lidé</span>
            </h2>
            <p className="text-white/50 text-center mb-14 max-w-2xl mx-auto text-base sm:text-lg">
              Reálná zpětná vazba od lidí, kterým Woker pomohl.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-5 items-start mb-5">
            <FadeIn>
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/reviews/recenze-1.jpg" alt="Recenze od člena Wokeru" className="w-full rounded-xl block" />
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/reviews/recenze-2.jpg" alt="Recenze od člena Wokeru" className="w-full rounded-xl block" />
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-[#fb923c]/20 bg-gradient-to-br from-[#fb923c]/[0.08] to-transparent p-8 sm:p-10 text-center">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
                Máš zkušenost s Wokerem?
              </h3>
              <p className="text-white/55 text-sm sm:text-base mb-6 max-w-lg mx-auto leading-relaxed">
                Ohodnoť nás na Trustpilotu — tvoje zpětná vazba nám pomáhá zlepšovat poskytované služby.
              </p>
              <div className="max-w-md mx-auto">
                <TrustpilotWidget />
              </div>
              <p className="text-white/40 text-xs sm:text-sm mt-7">
                Nebo mi svoji recenzi pošli osobně na:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3">
                <a href="https://instagram.com/vasicenko" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/70 font-medium text-xs hover:text-white hover:bg-white/[0.09] transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                  Instagram
                </a>
                <a href="https://www.facebook.com/vasicenko" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/70 font-medium text-xs hover:text-white hover:bg-white/[0.09] transition-all">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                  Facebook
                </a>
                <a href="https://tiktok.com/@vasicenko" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/70 font-medium text-xs hover:text-white hover:bg-white/[0.09] transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                  TikTok
                </a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
