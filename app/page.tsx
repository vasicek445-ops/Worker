"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "../lib/i18n/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    const hash = window.location.hash;

    // Recovery flow - reset password
    if (hash && hash.includes("type=recovery")) {
      redirected.current = true;
      window.location.replace("/auth/callback" + hash);
      return;
    }

    // Email confirmation flow
    if (hash && hash.includes("access_token")) {
      redirected.current = true;
      window.location.replace("/auth/callback" + hash);
      return;
    }
  }, []);

  const h = t.home;

  return (
    <main className="min-h-screen bg-[#0a0a12] text-white">
      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a12]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Wo</span>
            <span className="text-emerald-400">ker</span>
          </span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">
              {t.locale === "cs" ? "Přihlásit se" : "Log in"}
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg transition-colors"
            >
              {h.hero_cta}
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ ATTENTION — Hero ═══ */}
      <section className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            🇨🇭 {h.hero_trial}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            {h.hero_headline}
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            {h.hero_sub}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto text-center bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
            >
              {h.hero_cta} →
            </Link>
            <a
              href="#interest"
              className="w-full sm:w-auto text-center border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-medium text-lg px-8 py-4 rounded-xl transition-colors"
            >
              {h.hero_cta2}
            </a>
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="py-8 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: h.stat_salary, label: h.stat_salary_label },
            { value: h.stat_agencies, label: h.stat_agencies_label },
            { value: h.stat_ai, label: h.stat_ai_label },
            { value: h.stat_time, label: h.stat_time_label },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-400">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ INTEREST — Features ═══ */}
      <section id="interest" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
            {h.interest_title}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📋", title: h.interest_agencies, desc: h.interest_agencies_desc },
              { icon: "🤖", title: h.interest_ai, desc: h.interest_ai_desc },
              { icon: "📖", title: h.interest_guides, desc: h.interest_guides_desc },
              { icon: "💼", title: h.interest_jobs, desc: h.interest_jobs_desc },
              { icon: "🏠", title: h.interest_housing, desc: h.interest_housing_desc },
              { icon: "💬", title: h.interest_assistant, desc: h.interest_assistant_desc },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 hover:bg-emerald-500/[0.03] transition-all"
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ DESIRE — Social Proof ═══ */}
      <section className="py-20 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-14">
            {h.desire_title}
          </h2>

          {/* Testimonials */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              { text: h.desire_testimonial1, author: h.desire_testimonial1_author },
              { text: h.desire_testimonial2, author: h.desire_testimonial2_author },
              { text: h.desire_testimonial3, author: h.desire_testimonial3_author },
            ].map((t) => (
              <div
                key={t.author}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-6"
              >
                <p className="text-gray-300 text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <p className="text-emerald-400 text-sm font-medium">{t.author}</p>
              </div>
            ))}
          </div>

          {/* Salary comparison */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-3">{h.desire_salary_title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-2">{h.desire_salary_desc}</p>
            <p className="text-emerald-400 text-sm font-medium">{h.desire_compare}</p>
          </div>
        </div>
      </section>

      {/* ═══ ACTION — CTA ═══ */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            {h.action_title}
          </h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            {h.action_desc}
          </p>
          <Link
            href="/login"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg px-10 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-emerald-500/25 mb-4"
          >
            {h.action_cta} →
          </Link>
          <p className="text-gray-600 text-sm mt-4">{h.action_features}</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-8 border-t border-white/5 text-center">
        <p className="text-gray-600 text-sm">{h.footer_copy}</p>
      </footer>
    </main>
  );
}
