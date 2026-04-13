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
    label: "Nabidky prace",
    desc: "Aktualni pozice ve Svycarsku",
    href: "/dashboard/nabidky-prace",
  },
  {
    label: "Smart Matching",
    desc: "Najde ti praci podle toho co umis",
    href: "/dashboard/smart-matching",
  },
  {
    label: "Kontakty na agentury",
    desc: "1007 overenych agentur",
    href: "/dashboard/kontakty",
  },
];

const NAV_BYDLENI = [
  {
    label: "Byty & WG",
    desc: "Klasicke pronajmy",
    href: "/dashboard/bydleni",
  },
  {
    label: "Penziony & B&B",
    desc: "Mesicni ubytovani v penzionech",
    href: "/dashboard/bydleni?typ=penziony",
  },
  {
    label: "Pro pracujici",
    desc: "Levne pokoje blizko prace",
    href: "/dashboard/bydleni?typ=pracujici",
  },
  {
    label: "Hostely & ubytovny",
    desc: "Levne alternativy",
    href: "/dashboard/bydleni?typ=hostely",
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
          <DropdownTrigger label="Prace" id="prace" items={NAV_PRACE} />
          <DropdownTrigger label="Bydleni" id="bydleni" items={NAV_BYDLENI} />
          <Link
            href="/dokumenty"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Dokumenty
          </Link>
          <Link
            href="/cenik"
            className="text-sm text-white/70 hover:text-white transition-colors"
          >
            Plany
          </Link>
          <Link
            href="/registrace"
            className="ml-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 transition-all"
          >
            Zacit zdarma
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/70 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Zavrit menu" : "Otevrit menu"}
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
            Prace
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
            Bydleni
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
              href="/dokumenty"
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
              Plany
            </Link>
            <Link
              href="/registrace"
              className="mt-2 block text-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12]"
              onClick={() => setMobileOpen(false)}
            >
              Zacit zdarma
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ─── Bento Card ─── */
function BentoCard({
  headline,
  text,
  cta,
  href,
  accent = "green",
  large = false,
  delay = 0,
}: {
  headline: string;
  text: string;
  cta: string;
  href: string;
  accent?: "green" | "cyan";
  large?: boolean;
  delay?: number;
}) {
  return (
    <FadeIn delay={delay} className={large ? "md:col-span-1" : ""}>
      <Link href={href} className="block h-full group">
        <div
          className={`relative h-full rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 ${
            large ? "sm:p-8" : "sm:p-6"
          } transition-all duration-300 hover:border-white/[0.12] hover:scale-[1.01] overflow-hidden`}
        >
          <div
            className={`absolute left-0 top-6 bottom-6 w-[3px] rounded-full ${
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
    { label: "Cena", woker: "Od 0 EUR", agentura: "500-2000 EUR", sam: "Zdarma" },
    {
      label: "Nabidky prace",
      woker: "Matching podle tebe",
      agentura: "Omezene",
      sam: "Hledas sam",
    },
    { label: "Bydleni", woker: "3188 nabidek", agentura: "Nic", sam: "Hledas sam" },
    {
      label: "Dokumenty",
      woker: "Nemcina za minutu",
      agentura: "Sablona",
      sam: "Sam pises",
    },
    {
      label: "Jazyk",
      woker: "Cesky, slovensky, polsky",
      agentura: "Nemecky",
      sam: "Nemecky",
    },
    {
      label: "Podpora",
      woker: "Komunita",
      agentura: "Az po zaplaceni",
      sam: "Nikdo",
    },
    {
      label: "Rychlost",
      woker: "Pod 5 minut",
      agentura: "2-6 tydnu",
      sam: "Kdo vi",
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
            <th className="text-left py-3 px-4 text-white/40 font-medium">Sam</th>
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
      title: "Prace",
      links: [
        { label: "Nabidky prace", href: "/dashboard/nabidky-prace" },
        { label: "Smart Matching", href: "/dashboard/smart-matching" },
        { label: "Kontakty", href: "/dashboard/kontakty" },
      ],
    },
    {
      title: "Bydleni",
      links: [
        { label: "Byty & WG", href: "/dashboard/bydleni" },
        { label: "Penziony", href: "/dashboard/bydleni?typ=penziony" },
        { label: "Pro pracujici", href: "/dashboard/bydleni?typ=pracujici" },
        { label: "Hostely", href: "/dashboard/bydleni?typ=hostely" },
      ],
    },
    {
      title: "Dokumenty",
      links: [
        { label: "Zivotopis", href: "/dokumenty" },
        { label: "Motivacni dopis", href: "/dokumenty" },
        { label: "Bewerbung", href: "/dokumenty" },
      ],
    },
    {
      title: "O nas",
      links: [
        { label: "Podminky", href: "/podminky" },
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
            &copy; 2026 Woker &middot; Prace a bydleni ve Svycarsku
          </p>
          <p className="text-xs text-white/20 mt-1">
            Zadne skryte poplatky. Tva data nikdy neprodavame.
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
              Prace a bydleni
              <br />
              ve Svycarsku.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39ff6e] to-cyan-400">
                Jednoduse.
              </span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-8 leading-relaxed">
              Nabidky prace, bydleni po celem Svycarsku a dokumenty v nemcine
              &mdash; bez poplatku.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="text-sm text-white/30 mb-10">
              <Counter target={3188} /> ubytovani &middot;{" "}
              <Counter target={1007} /> agentur &middot; 500+ uspesnych
              prestehovani
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/registrace"
                className="px-8 py-3.5 rounded-xl text-base font-bold bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 hover:scale-[1.02] transition-all shadow-lg shadow-[#39ff6e]/20"
              >
                Zacit zdarma &rarr;
              </Link>
              <Link
                href="/dashboard/bydleni"
                className="px-8 py-3.5 rounded-xl text-base font-medium border border-white/[0.15] text-white hover:bg-white/[0.05] hover:border-white/[0.25] transition-all"
              >
                Prohlednout nabidky
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
              Vime, jak to je.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {[
                "Vsechno je nemecky",
                "Nevis kde zacit",
                "Bojis se, ze ti nekdo slibi praci a pak zmizi",
                "Agentury chteji tisice eur",
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
              Proto jsme udelali Woker.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── BENTO GRID ── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#111128]/40">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
              Co Woker resi
            </h2>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <BentoCard
              large
              headline="Najdi praci ve Svycarsku"
              text="Aktualni nabidky prace a prime kontakty na 1007 overenych agentur. Zadne poplatky za zprostredkovani."
              cta="Hledat praci &rarr;"
              href="/dashboard/nabidky-prace"
              accent="green"
              delay={0.05}
            />
            <BentoCard
              large
              headline="Bydleni od prvniho dne"
              text="3188 ubytovani po celem Svycarsku — byty, penziony, ubytovny. S cenami a primym kontaktem."
              cta="Hledat bydleni &rarr;"
              href="/dashboard/bydleni"
              accent="cyan"
              delay={0.1}
            />
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <BentoCard
              headline="Dokumenty v nemcine za minutu"
              text="Profesionalni zivotopis a Bewerbungsdossier. Napiseme to za tebe — spravne, nemecky."
              cta="Vyzkouset &rarr;"
              href="/dokumenty"
              accent="green"
              delay={0.15}
            />
            <BentoCard
              headline="Zavolej primo zamestnavateli"
              text="Primy kontakt na zamestnavatele a pronajmatele. Zadny prostredni."
              cta="Zobrazit &rarr;"
              href="/dashboard/kontakty"
              accent="cyan"
              delay={0.2}
            />
            <BentoCard
              headline="Povoleni, pojisteni, dane"
              text="Vse vysvetlene jednoduse, krok za krokem, v tvem jazyce."
              cta="Cist &rarr;"
              href="/dashboard/pruvodce"
              accent="green"
              delay={0.25}
            />
            <BentoCard
              headline="Nejsi v tom sam"
              text="Zeptej se tech, co to uz zvladli. Tisice lidi co ve Svycarsku ziji."
              cta="Vstoupit &rarr;"
              href="/komunita"
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
              Jak to funguje
            </h2>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            {[
              {
                num: "1",
                title: "Zaregistruj se zdarma",
                desc: "Zadna kreditka, zadny zavazek. Za 2 minuty mas ucet.",
              },
              {
                num: "2",
                title: "Vyber si co potrebujes",
                desc: "Praci, bydleni, nebo dokumenty. Ukazeme ti presne to co hledas.",
              },
              {
                num: "3",
                title: "Oslovuj zamestnavatele",
                desc: "Mas kontakty, mas dokumenty. Zavolej a domluv se.",
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
                href="/registrace"
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
              Pribehy lidi jako ty
            </h2>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={0.05}>
            <div className="grid grid-cols-3 gap-4 mb-14">
              {[
                { target: 3188, label: "ubytovani" },
                { target: 1007, label: "agentur" },
                { target: 500, label: "prestehovani", suffix: "+" },
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
              quote="Prijel jsem bez kontaktu a bez nemciny. Pres Woker jsem za 3 tydny nasel praci a bydleni v Zurichu."
              name="Martin"
              role="skladnik"
              origin="Cesko &rarr; Zurich"
              delay={0.1}
            />
            <TestimonialCard
              quote="Agentura mi chcela uctovat 500 EUR. Na Wokeri som si nasla pracu sama, zadarmo."
              name="Katarina"
              role="upratovacka"
              origin="Slovensko &rarr; Bern"
              delay={0.15}
            />
            <TestimonialCard
              quote="Bewerbungsdossier bylo lepsi nez to co mi napsala agentura. A mel jsem ho hotovy driv nez dorazil kafe."
              name="Tomek"
              role="stavbar"
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
              Proc Woker?
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
              Plany
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
                    "Hledani prace",
                    "Zakladni nabidky bydleni",
                    "Pruvodce",
                    "Komunita",
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
                  href="/registrace"
                  className="block text-center px-6 py-3 rounded-xl text-sm font-semibold border border-white/[0.15] text-white hover:bg-white/[0.05] transition-all"
                >
                  Zacit zdarma
                </Link>
              </div>
            </FadeIn>

            {/* Premium */}
            <FadeIn delay={0.1}>
              <div className="relative rounded-2xl bg-white/[0.03] border-2 border-[#39ff6e]/40 p-6 sm:p-8 h-full flex flex-col">
                <span className="absolute -top-3 left-6 px-3 py-0.5 text-xs font-bold bg-[#39ff6e] text-[#0a0a12] rounded-full">
                  Nejoblibenejsi
                </span>
                <h3 className="text-lg font-bold text-white mb-1">Premium</h3>
                <p className="text-3xl font-extrabold text-white mb-1">
                  19.99 EUR
                  <span className="text-base font-normal text-white/40">
                    /mesic
                  </span>
                </p>
                <p className="text-xs text-white/30 mb-6">
                  Agentury uctuji 500-2000 EUR
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    "Vse z Free +",
                    "3188 ubytovani s kontakty",
                    "1007 agentur s kontakty",
                    "Dokumenty v nemcine",
                    "Smart Matching",
                    "Prioritni podpora",
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
                  Bez zavazku. Zrusis kdykoliv.
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
              Praci, bydleni i dokumenty v nemcine &mdash; mas to na dosah.
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-white/50 mb-8">
              Martin z Ceska nasel praci za 3 tydny. Ty muzes byt dalsi.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <Link
              href="/registrace"
              className="inline-block px-10 py-4 rounded-xl text-lg font-bold bg-gradient-to-r from-[#39ff6e] to-[#32e060] text-[#0a0a12] hover:brightness-110 hover:scale-[1.02] transition-all shadow-lg shadow-[#39ff6e]/20"
            >
              Zacit zdarma &rarr;
            </Link>
            <p className="text-xs text-white/30 mt-4">
              Staci 2 minuty. Bez kreditky, bez zavazku.
            </p>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
