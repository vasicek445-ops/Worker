"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";

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

/* ─── Housing data ─── */
const ALL_HOUSING = [
  { name: "Pension Susanna", location: "Luzern", price: "CHF 850", type: "Penzion", phone: "+41 76 541 43 04" },
  { name: "SMART DEPART", location: "Zug", price: "CHF 654", type: "Pro pracující", phone: "+41 79 950 06 47" },
  { name: "TomoDomo Coliving", location: "Basel", price: "CHF 574", type: "Ubytovna", phone: "" },
  { name: "Il Castagno", location: "Ticino", price: "CHF 417", type: "Komunita", phone: "+41 91 611 40 50" },
  { name: "Hotel Sternen", location: "Aargau", price: "CHF 990", type: "Penzion", phone: "+41 56 616 90 16" },
  { name: "Gästehaus Koller", location: "Appenzell", price: "CHF 780", type: "Penzion", phone: "+41 71 787 02 22" },
  { name: "Casa Fortuna", location: "Suhr", price: "CHF 1 620", type: "Penzion", phone: "+41 76 325 89 20" },
  { name: "flexy.motel", location: "Aargau", price: "CHF 600", type: "Pro pracující", phone: "" },
  { name: "Lake Lucerne", location: "Nidwalden", price: "CHF 1 107", type: "Byty", phone: "+41 41 620 73 73" },
];

function blurPhone(phone: string): string {
  if (!phone) return "";
  return phone.replace(/(\+41 \d{2}) (\d{3}) (\d{2}) (\d{2})/, "$1 *** ** **");
}

/* ─── Housing Card ─── */
function HousingCard({ item }: { item: typeof ALL_HOUSING[number] }) {
  const typeColors: Record<string, string> = {
    "Penzion": "bg-cyan-500/20 text-cyan-400",
    "Pro pracující": "bg-purple-500/20 text-purple-400",
    "Ubytovna": "bg-amber-500/20 text-amber-400",
    "Komunita": "bg-emerald-500/20 text-emerald-400",
    "Byty": "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 sm:p-5 hover:border-white/[0.12] transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-white font-semibold text-sm sm:text-base truncate">{item.name}</h3>
          <p className="text-white/40 text-xs mt-0.5">{item.location}</p>
        </div>
        <span className="text-cyan-400 font-bold text-sm whitespace-nowrap">{item.price}/mes.</span>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[item.type] || "bg-white/10 text-white/60"}`}>
          {item.type}
        </span>
        {item.phone && (
          <span className="text-white/30 text-xs blur-[3px] select-none">{blurPhone(item.phone)}</span>
        )}
      </div>
    </div>
  );
}

/* ─── Animated Housing Grid ─── */
function AnimatedHousingGrid() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setOffset((prev) => (prev + 2) % ALL_HOUSING.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const visible: typeof ALL_HOUSING = [];
  for (let i = 0; i < 6; i++) {
    visible.push(ALL_HOUSING[(offset + i) % ALL_HOUSING.length]);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <AnimatePresence mode="popLayout">
        {visible.map((item) => (
          <motion.div
            key={`${item.name}-${item.location}`}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <HousingCard item={item} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ─── Filter Mockup ─── */
function FilterMockup() {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-4 py-2 text-sm text-white/50 flex items-center gap-2">
        <span>Kanton</span>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <div className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-4 py-2 text-sm text-white/50 flex items-center gap-2">
        <span>Cena do</span>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <div className="rounded-lg bg-white/[0.04] border border-white/[0.08] px-4 py-2 text-sm text-white/50 flex items-center gap-2">
        <span>Typ ubytování</span>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
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
export default function BydleniPreviewPage() {
  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 sm:pt-36 pb-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <FadeIn>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Bydlení ve Švýcarsku{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">
                od prvního dne
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-5 text-white/60 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Penziony, ubytovny, byty i kláštery. Najdi si ubytování
              ještě před odletem do Švýcarska.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="px-4 sm:px-6 pb-4">
        <div className="max-w-4xl mx-auto">
          <FadeIn delay={0.15}>
            <FilterMockup />
          </FadeIn>
          <FadeIn delay={0.2}>
            <AnimatedHousingGrid />
          </FadeIn>
        </div>
      </section>

      {/* Blur overlay + CTA */}
      <section className="px-4 sm:px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none pointer-events-none" aria-hidden="true">
            {[
              { n: "Kloster Fischingen", l: "Thurgau", p: "CHF 550", t: "Komunita" },
              { n: "Pension zum Bären", l: "Luzern", p: "CHF 920", t: "Penzion" },
              { n: "City Hostel", l: "Zürich", p: "CHF 750", t: "Ubytovna" },
              { n: "Work & Stay", l: "Bern", p: "CHF 680", t: "Pro pracující" },
            ].map((fake) => (
              <div
                key={fake.n}
                className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 blur-[6px]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{fake.n}</p>
                    <p className="text-white/40 text-xs mt-0.5">{fake.l}</p>
                  </div>
                  <span className="text-cyan-400 font-bold text-sm">{fake.p}/mes.</span>
                </div>
                <span className="inline-block mt-3 text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">{fake.t}</span>
              </div>
            ))}
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/90 to-transparent rounded-2xl">
            <p className="text-white font-bold text-lg sm:text-xl text-center px-4 mb-5">
              3 188 ubytování čeká. Zaregistruj se zdarma.
            </p>
            <Link
              href="/zdarma"
              className="px-8 py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-300 text-[#0a0a12] hover:brightness-110 transition-all shadow-lg shadow-cyan-400/20"
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
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">3 188</p>
              <p className="text-white/50 text-sm mt-1">ubytování</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">26</p>
              <p className="text-white/50 text-sm mt-1">kantonů</p>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10" />
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">Penziony, ubytovny, kláštery</p>
              <p className="text-white/50 text-sm mt-1">všechny typy</p>
            </div>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </div>
  );
}
