"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

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

/* ─── Navbar dropdown data ─── */
const NAV_PRACE = [
  {
    label: "Nabídky práce",
    desc: "Aktuální pozice ve Švýcarsku",
    href: "/prace",
  },
  {
    label: "Smart Matching",
    desc: "AI ti vybere nabídky podle tvých skillů",
    href: "/prace",
  },
  {
    label: "Kontakty na agentury",
    desc: "1 007 ověřených agentur s telefonem",
    href: "/kontakty-preview",
  },
];

const NAV_BYDLENI = [
  {
    label: "Byty & WG",
    desc: "Klasické pronájmy",
    href: "/bydleni-preview",
  },
  {
    label: "Penziony & B&B",
    desc: "Měsíční ubytování v penzionech",
    href: "/bydleni-preview",
  },
  {
    label: "Pro pracující",
    desc: "Pokoje od CHF 417/měsíc blízko práce",
    href: "/bydleni-preview",
  },
  {
    label: "Hostely & ubytovny",
    desc: "Levné alternativy",
    href: "/bydleni-preview",
  },
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
                key={item.href}
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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          <DropdownTrigger label="Práce" id="prace" items={NAV_PRACE} />
          <DropdownTrigger label="Bydlení" id="bydleni" items={NAV_BYDLENI} />
          <Link
            href="/dokumenty-preview"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Dokumenty
          </Link>
          <Link
            href="/cenik"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Plány
          </Link>
          <Link
            href="/zdarma"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Přihlásit se
          </Link>
          <Link
            href="/zdarma"
            className="ml-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 transition-all"
          >
            Registrace
          </Link>
        </div>

        {/* Mobile hamburger */}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a12]/95 backdrop-blur-xl border-t border-white/[0.06] px-4 pb-6 pt-2">
          <p className="text-xs text-white/40 uppercase tracking-wider mt-3 mb-1 px-2">
            Práce
          </p>
          {NAV_PRACE.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-2 py-2 text-sm text-white/70 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <p className="text-xs text-white/40 uppercase tracking-wider mt-4 mb-1 px-2">
            Bydlení
          </p>
          {NAV_BYDLENI.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-2 py-2 text-sm text-white/70 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-white/[0.06] mt-4 pt-4 flex flex-col gap-2">
            <Link
              href="/dokumenty-preview"
              className="px-2 py-2 text-sm text-white/70 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Dokumenty
            </Link>
            <Link
              href="/cenik"
              className="px-2 py-2 text-sm text-white/70 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Plány
            </Link>
            <Link
              href="/zdarma"
              className="px-2 py-2 text-sm text-white/70 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              Přihlásit se
            </Link>
            <Link
              href="/zdarma"
              className="mt-2 block text-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12]"
              onClick={() => setMobileOpen(false)}
            >
              Registrace
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
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${job.tag === "Nové" ? "bg-[#39ff6e]/20 text-[#39ff6e]" : "bg-amber-500/20 text-amber-400"}`}>
                {job.tag}
              </span>
            )}
            <span className="text-[#39ff6e] text-[11px] font-bold whitespace-nowrap">{job.salary}</span>
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
              accent === "green" ? "bg-[#39ff6e]" : "bg-cyan-400"
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
                accent === "green" ? "text-[#39ff6e]" : "text-cyan-400"
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
    { label: "Cena", woker: "Od 0 EUR", agentura: "~600 EUR", sam: "0 EUR" },
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
            <th className="text-left py-3 px-4 text-[#39ff6e] font-bold">Woker</th>
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

/* ─── Footer ─── */
function Footer() {
  const cols = [
    {
      title: "Práce",
      links: [
        { label: "Nabídky práce", href: "/dashboard/nabidky-prace" },
        { label: "Smart Matching", href: "/dashboard/smart-matching" },
        { label: "Kontakty", href: "/dashboard/kontakty" },
      ],
    },
    {
      title: "Bydlení",
      links: [
        { label: "Byty & WG", href: "/dashboard/bydleni" },
        { label: "Penziony", href: "/dashboard/bydleni?typ=penziony" },
        { label: "Pro pracující", href: "/dashboard/bydleni?typ=pracujici" },
        { label: "Hostely", href: "/dashboard/bydleni?typ=hostely" },
      ],
    },
    {
      title: "Dokumenty",
      links: [
        { label: "Životopis", href: "/dokumenty" },
        { label: "Motivační dopis", href: "/dokumenty" },
        { label: "Bewerbung", href: "/dokumenty" },
      ],
    },
    {
      title: "O nás",
      links: [
        { label: "Podmínky", href: "/podminky" },
        { label: "Ochrana dat", href: "/ochrana-udaju" },
        { label: "Kontakt", href: "/kontakty" },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/[0.06] bg-[#0a0a12]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/40 hover:text-white/70 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.06] pt-8">
          <p className="text-xl font-extrabold tracking-tight text-white mb-3">WOKER</p>
          <p className="text-xs text-white/30">
            &copy; 2026 Woker &middot; Práce a bydlení ve Švýcarsku
          </p>
          <p className="text-xs text-white/20 mt-1">
            Žádné skryté poplatky. Tvá data nikdy neprodáváme.
          </p>
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
      className="min-h-screen bg-[#0a0a12] text-white overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-4 sm:px-6 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#39ff6e]/[0.04] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-400/[0.03] blur-[120px] pointer-events-none" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <FadeIn>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              4 600 ubytování.
              <br />
              1 007 agentur.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39ff6e] to-cyan-400">
                Vše česky.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-8 leading-relaxed">
              Práce, bydlení a dokumenty v němčině pro Čechy, Slováky a Poláky
              &mdash; na jednom místě, od 0 EUR.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-sm text-white/30 mb-10">
              <Counter target={4600} /> ubytování &middot;{" "}
              <Counter target={1007} /> agentur &middot; 50+ úspěšných
              přestěhování
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/zdarma"
                className="px-8 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 hover:scale-[1.02] transition-all shadow-lg shadow-[#39ff6e]/20"
              >
                Začít zdarma &rarr;
              </Link>
              <Link
                href="/zdarma"
                className="px-8 py-3.5 rounded-xl text-base font-medium border border-white/[0.15] text-white hover:bg-white/[0.05] hover:border-white/[0.25] transition-all"
              >
                Prohlédnout nabídky
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── EMPATHY ── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-2xl sm:text-3xl font-bold text-white mb-8">
              Taky jsme tam stáli. Na letišti. Se dvěma kuframa.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {[
                "Googlíš německy a nerozumíš ani nadpisům",
                "Zahraniční zprostředkovatelé chtějí 600 EUR jen za kontakt na firmu",
                "Na byt v Zürichu odpovídá 200 lidí. Ty jsi 201.",
                "Nevíš jestli ti ten chlap na Facebooku fakt sežene práci",
              ].map((pain) => (
                <div
                  key={pain}
                  className="rounded-xl bg-white/[0.03] border border-white/[0.06] px-5 py-3 text-sm text-white/50"
                >
                  {pain}
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-lg font-bold text-white">
              Woker existuje, protože jsme to zažili sami.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── BENTO GRID ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#111128]/40">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Vše co potřebuješ. Na jednom místě.
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <BentoCard
              large
              headline="1 007 agentur. Telefon, email, adresa."
              text="Zeptej se přímo. Žádný prostředník, žádný poplatek za číslo. Filtruj podle kantonu, jazyka nebo oboru."
              cta="Hledat práci &rarr;"
              href="/zdarma"
              accent="green"
              delay={0.05}
              imagePlaceholder="jobs"
            />
            <BentoCard
              large
              headline="4 600 ubytování. Od CHF 417/měsíc."
              text="Penziony, byty, ubytovny, WG — s cenou a přímým kontaktem. Nastěhuj se dřív než začneš pracovat."
              cta="Hledat bydlení &rarr;"
              href="/zdarma"
              accent="cyan"
              delay={0.1}
              imagePlaceholder="housing"
            />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <BentoCard
              headline="Německý životopis za 90 sekund"
              text="Zadej česky, dostaneš německý Bewerbungsdossier. Hotovo dřív než dopíješ kafe."
              cta="Vyzkoušet &rarr;"
              href="/zdarma"
              accent="green"
              delay={0.15}
            />
            <BentoCard
              headline="Volej přímo zaměstnavateli"
              text="Každá nabídka má telefon nebo email. Žádné formuláře, žádné čekání."
              cta="Zobrazit &rarr;"
              href="/zdarma"
              accent="cyan"
              delay={0.2}
            />
            <BentoCard
              headline="Povolení, pojištění, daně — česky"
              text="Co je L-povolení? Kde se přihlásíš na Gemeinde? Krok za krokem, bez úřadničiny."
              cta="Číst &rarr;"
              href="/zdarma"
              accent="green"
              delay={0.25}
            />
            <BentoCard
              headline="Komunita lidí co už tam žijou"
              text="Zeptej se něco v komunitě. Odpoví ti skladník z Zürichu, ne chatbot."
              cta="Vstoupit &rarr;"
              href="/zdarma"
              accent="cyan"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
              3 kroky. 5 minut. Hotovo.
            </h2>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            {[
              {
                num: "1",
                title: "Zaregistruj se za 2 minuty",
                desc: "Žádná kreditka. Žádný závazek. Stačí email.",
              },
              {
                num: "2",
                title: "Řekni nám co hledáš",
                desc: "Práci v Zürichu? Byt v Bernu? Životopis německy? Klikni a máš to.",
              },
              {
                num: "3",
                title: "Zavolej a domluv se",
                desc: "Vidíš telefon, vidíš cenu. Žádný prostředník. Zvedneš a mluvíš.",
              },
            ].map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.1}>
                <div className="text-center sm:text-left">
                  <span className="inline-block text-5xl font-extrabold text-[#39ff6e]/20 mb-3">
                    {step.num}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div className="text-center mt-12">
              <Link
                href="/zdarma"
                className="inline-block px-8 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 hover:scale-[1.02] transition-all shadow-lg shadow-[#39ff6e]/20"
              >
                Zaregistrovat se zdarma &rarr;
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#111128]/40">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Nemusíš nám věřit. Poslechni si je.
            </h2>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.05}>
            <div className="grid grid-cols-3 gap-4 mb-14">
              {[
                { target: 4600, label: "ubytování v databázi" },
                { target: 1007, label: "ověřených agentur" },
                { target: 50, label: "přestěhování díky Wokeru", suffix: "+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-white">
                    <Counter target={stat.target} suffix={stat.suffix} />
                  </p>
                  <p className="text-sm text-white/40 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Testimonials */}
          <div className="grid sm:grid-cols-3 gap-4">
            <TestimonialCard
              quote="Přistál jsem v Zürichu v neděli. V pondělí ráno jsem přes Woker volal do agentury. Ve středu jsem nastoupil na sklad. 3 týdny od registrace — práce i byt."
              name="Martin"
              role="skladník"
              origin="Česko &rarr; Zürich"
              delay={0.1}
            />
            <TestimonialCard
              quote="Agentúra mi chcela účtovať 600 EUR len za číslo na zamestnávateľa. Na Wokeri som si ho našla sama. Zadarmo. Za 10 minút."
              name="Katarína"
              role="upratovačka"
              origin="Slovensko &rarr; Bern"
              delay={0.15}
            />
            <TestimonialCard
              quote="Napsal jsem česky co umím. Za 90 sekund mi vypadl německý Bewerbungsdossier. Lepší než to co mi za 200 EUR napsala agentura."
              name="Tomek"
              role="stavbař"
              origin="Polsko &rarr; Basel"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Woker vs. agentura vs. na vlastní pěst
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
              <ComparisonTable />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#111128]/40">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Cena jednoho oběda. Nebo 600 EUR zprostředkovateli.
            </h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <FadeIn delay={0.05}>
              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 sm:p-8 h-full flex flex-col">
                <h3 className="text-lg font-bold text-white mb-1">Zdarma</h3>
                <p className="text-3xl font-extrabold text-white mb-6">
                  0 EUR
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Hledání práce a základní filtry",
                    "Základní nabídky bydlení",
                    "Průvodce krok za krokem",
                    "Přístup do komunity",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                      <svg
                        className="w-4 h-4 text-white/30 mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/zdarma"
                  className="block text-center px-6 py-3 rounded-xl text-sm font-semibold border border-white/[0.15] text-white hover:bg-white/[0.05] transition-all"
                >
                  Začít zdarma
                </Link>
              </div>
            </FadeIn>

            {/* Premium */}
            <FadeIn delay={0.1}>
              <div className="relative rounded-2xl bg-white/[0.03] border-2 border-[#39ff6e]/40 p-6 sm:p-8 h-full flex flex-col">
                <span className="absolute -top-3 left-6 px-3 py-0.5 text-xs font-bold bg-[#39ff6e] text-[#0a0a12] rounded-full">
                  Nejoblíbenější
                </span>
                <h3 className="text-lg font-bold text-white mb-1">Premium</h3>
                <p className="text-3xl font-extrabold text-white mb-1">
                  19,99 EUR
                  <span className="text-base font-normal text-white/40">
                    /měsíc
                  </span>
                </p>
                <p className="text-xs text-white/30 mb-6">
                  = cena jednoho oběda. Zprostředkovatelé účtují ~600 EUR.
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Vše z Free +",
                    "4 600 ubytování s telefonem a emailem",
                    "1 007 agentur s přímým kontaktem",
                    "Německý životopis a Bewerbung za 90s",
                    "AI Smart Matching — práce podle tvých skillů",
                    "Prioritní podpora",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                      <svg
                        className="w-4 h-4 text-[#39ff6e] mt-0.5 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {f}
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
                  Bez závazku. Zrušíš kdykoliv jedním klikem.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#39ff6e]/[0.03] blur-[150px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
              Zítra v tuhle dobu můžeš mít práci v Zürichu.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-white/50 mb-8">
              Martin to zvládl za 3 týdny. Katarína za 10 minut našla co zprostředkovatel za 600 EUR.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <Link
              href="/zdarma"
              className="inline-block px-10 py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 hover:scale-[1.02] transition-all shadow-lg shadow-[#39ff6e]/20"
            >
              Začít zdarma &rarr;
            </Link>
            <p className="text-xs text-white/30 mt-4">
              2 minuty. Žádná kreditka. Žádný závazek.
            </p>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
