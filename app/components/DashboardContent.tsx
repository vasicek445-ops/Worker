"use client";
import Link from "next/link";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import WokeeWidget from "./WokeeWidget";

const langFlag: Record<string, string> = { de: "🇩🇪", fr: "🇫🇷", it: "🇮🇹" };

interface Props {
  agencyCount: number;
  agencies: any[];
}

export default function DashboardContent({ agencyCount, agencies }: Props) {
  const { t } = useLanguage();

  const guides = [
    { icon: "📋", title: t.guides.permits_title, desc: t.guides.permits_desc, tag: t.tags.important, tagColor: "#ff4757", tagBg: "rgba(255,71,87,0.1)", href: "/pruvodce/povoleni", gradient: "linear-gradient(135deg, rgba(255,71,87,0.08), rgba(255,71,87,0.02))", borderColor: "rgba(255,71,87,0.12)" },
    { icon: "🏥", title: t.guides.insurance_title, desc: t.guides.insurance_desc, tag: t.tags.popular, tagColor: "#3b82f6", tagBg: "rgba(59,130,246,0.1)", href: "/pruvodce/pojisteni", gradient: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02))", borderColor: "rgba(59,130,246,0.12)" },
    { icon: "💰", title: t.guides.tax_title, desc: t.guides.tax_desc, tag: t.tags.new_tag, tagColor: "#39ff6e", tagBg: "rgba(57,255,110,0.1)", href: "/pruvodce/dane", gradient: "linear-gradient(135deg, rgba(57,255,110,0.08), rgba(57,255,110,0.02))", borderColor: "rgba(57,255,110,0.12)" },
    { icon: "🗣️", title: t.guides.language_title, desc: t.guides.language_desc, tag: t.tags.recommended, tagColor: "#a78bfa", tagBg: "rgba(167,139,250,0.1)", href: "/jazyky", gradient: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(167,139,250,0.02))", borderColor: "rgba(167,139,250,0.12)" },
  ];

  const navItems = [
    { icon: "🏠", label: t.nav.overview, href: "/dashboard", active: true },
    { icon: "📇", label: t.nav.contacts, href: "/kontakty", active: false },
    { icon: "📖", label: t.nav.guide, href: "/pruvodce", active: false },
    { icon: "💼", label: t.nav.jobs, href: "/nabidka", active: false },
    { icon: "👤", label: t.nav.profile, href: "/profil", active: false },
  ];

  const stats = [
    { value: agencyCount.toLocaleString(), label: "Agentur", icon: "🏢" },
    { value: "26", label: "Kantonů", icon: "📍" },
    { value: "3", label: "Jazyky", icon: "🌐" },
    { value: "24/7", label: "AI podpora", icon: "🤖" },
  ];

  return (
    <>
      <style jsx global>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>
      <main style={{ minHeight: "100vh", background: "#0a0a12", fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif", paddingBottom: "100px", position: "relative", overflow: "visible" }}>
        {/* Background effects */}
        <div style={{ position: "fixed", width: "600px", height: "600px", borderRadius: "50%", filter: "blur(140px)", pointerEvents: "none", zIndex: 0, opacity: 0.2, top: "-200px", right: "-200px", background: "radial-gradient(circle, rgba(57,255,110,0.2), transparent 70%)" }} />
        <div style={{ position: "fixed", width: "400px", height: "400px", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none", zIndex: 0, opacity: 0.15, bottom: "100px", left: "-150px", background: "radial-gradient(circle, rgba(100,60,255,0.15), transparent 70%)" }} />
        <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        {/* Header */}
        <div style={{ position: "relative", zIndex: 10, padding: "20px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>{t.dashboard.greeting}</p>
              <h1 style={{ fontSize: "24px", fontWeight: 800, color: "white", margin: "4px 0 0", letterSpacing: "-0.02em" }}>{t.dashboard.welcome}</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <LanguageSwitcher />
              <Link href="/profil" style={{ width: "42px", height: "42px", borderRadius: "14px", background: "linear-gradient(135deg, #39ff6e, #2bcc58)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0a0a12", fontSize: "16px", fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 20px rgba(57,255,110,0.25)" }}>W</Link>
            </div>
          </div>
          <div style={{ marginTop: "18px", background: "rgba(255,255,255,0.04)", borderRadius: "14px", padding: "13px 16px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>{t.dashboard.search}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ position: "relative", zIndex: 10, padding: "20px 20px 0", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "14px 10px", textAlign: "center", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "18px", marginBottom: "6px" }}>{s.icon}</div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#39ff6e", letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "2px", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Agencies */}
        <div style={{ position: "relative", zIndex: 10, padding: "24px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(57,255,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(57,255,110,0.12)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39ff6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>{t.dashboard.agencies_title}</span>
            </div>
            <Link href="/kontakty" style={{ fontSize: "12px", color: "#39ff6e", fontWeight: 600, textDecoration: "none" }}>{agencyCount.toLocaleString()} {t.dashboard.agencies_count} →</Link>
          </div>
          <div style={{ background: "#111120", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.06)", overflow: "visible" }}>
            {agencies.map((a: any, i: number) => (
              <Link key={i} href="/kontakty" style={{ display: "flex", padding: "14px 16px", alignItems: "center", justifyContent: "space-between", textDecoration: "none", borderBottom: i < agencies.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(57,255,110,0.1), rgba(57,255,110,0.03))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700, color: "#39ff6e", border: "1px solid rgba(57,255,110,0.12)" }}>{a.name?.charAt(0) || "?"}</div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "white", margin: 0 }}>{a.name}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: "2px 0 0" }}>{a.city} • {a.canton}</p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px" }}>{langFlag[a.language_region] || "🇨🇭"}</span>
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>›</span>
                </div>
              </Link>
            ))}
            <Link href="/kontakty" style={{ display: "block", padding: "13px", background: "rgba(57,255,110,0.04)", borderTop: "1px solid rgba(57,255,110,0.08)", textAlign: "center", textDecoration: "none" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#39ff6e" }}>{t.dashboard.agencies_show_all}</span>
            </Link>
          </div>
        </div>

        {/* Guides */}
        <div style={{ position: "relative", zIndex: 10, padding: "28px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(57,255,110,0.08)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(57,255,110,0.12)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39ff6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "white" }}>{t.dashboard.guides_title}</span>
            </div>
            <Link href="/pruvodce" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 500, textDecoration: "none" }}>{t.dashboard.guides_all} →</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
            {guides.map((g, i) => (
              <Link key={i} href={g.href} style={{ background: g.gradient, borderRadius: "16px", padding: "18px 16px", border: `1px solid ${g.borderColor}`, textDecoration: "none", display: "block" }}>
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>{g.icon}</div>
                <p style={{ fontSize: "14px", fontWeight: 700, color: "white", margin: "0 0 4px", lineHeight: 1.3 }}>{g.title}</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", margin: "0 0 10px", lineHeight: 1.4 }}>{g.desc}</p>
                <span style={{ fontSize: "10px", fontWeight: 700, padding: "4px 10px", borderRadius: "6px", color: g.tagColor, background: g.tagBg, textTransform: "uppercase", letterSpacing: "0.05em" }}>{g.tag}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Premium */}
        <div style={{ position: "relative", zIndex: 10, padding: "28px 20px 0" }}>
          <Link href="/pricing" style={{ textDecoration: "none", display: "block" }}>
            <div style={{ background: "linear-gradient(135deg, #111120, #0f1a14)", borderRadius: "20px", padding: "24px", border: "1px solid rgba(57,255,110,0.15)", position: "relative", overflow: "visible" }}>
              <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "200px", height: "200px", borderRadius: "50%", background: "radial-gradient(circle, rgba(57,255,110,0.1), transparent 70%)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "20px 20px", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #39ff6e, #2bcc58)", display: "flex", alignItems: "center", justifyContent: "center" }}>⭐</div>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: "white" }}>{t.dashboard.premium_title}</span>
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.5, margin: "8px 0 18px" }}>{t.dashboard.premium_desc}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ background: "linear-gradient(135deg, #39ff6e, #2bcc58)", color: "#0a0a12", padding: "12px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: 800, boxShadow: "0 4px 20px rgba(57,255,110,0.25)" }}>{t.dashboard.premium_cta}</div>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>{t.dashboard.premium_trial}</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Wokee */}
        <div style={{ position: "relative", zIndex: 10, padding: "28px 20px 0" }}>
          <WokeeWidget />
        </div>

        {/* Bottom Nav */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(10,10,18,0.92)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "8px 8px 12px", zIndex: 100 }}>
          <div style={{ maxWidth: "500px", margin: "0 auto", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px 14px", borderRadius: "12px", textDecoration: "none", background: item.active ? "rgba(57,255,110,0.08)" : "transparent" }}>
                <span style={{ fontSize: "20px", filter: item.active ? "none" : "grayscale(1) opacity(0.4)" }}>{item.icon}</span>
                <span style={{ fontSize: "10px", fontWeight: item.active ? 700 : 500, color: item.active ? "#39ff6e" : "rgba(255,255,255,0.35)", letterSpacing: "0.02em" }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
