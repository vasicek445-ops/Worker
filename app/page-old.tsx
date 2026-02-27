"use client";

import { useState } from "react";
import Link from "next/link";

const content = {
  cs: {
    nav: { cta: "Začít zdarma" },
    hero: {
      badge: "🚀 Beta verze — 7 dní zdarma",
      title: "Práce ve Švýcarsku.\nBez agentury. Bez poplatků.",
      subtitle:
        "Woker ti najde nabídky práce ve Švýcarsku s přímým kontaktem na zaměstnavatele. Žádný prostředník, žádné tisíce euro za agenturu.",
      cta: "Vyzkoušet 7 dní zdarma",
      cta2: "Jak to funguje?",
      trust: "Žádná kreditka na začátek • Zrušíš kdykoliv",
    },
    problem: {
      tag: "Problém",
      title: "Agentury si účtují 1 000–3 000 €",
      subtitle:
        "A přitom jen přepošlou tvůj životopis. Ty zaplatíš tisíce, oni pošlou email. To nedává smysl.",
      items: [
        {
          icon: "💸",
          title: "Drahé agentury",
          desc: "Poplatky 1 000–3 000 € za zprostředkování práce, kterou si můžeš najít sám.",
        },
        {
          icon: "🕐",
          title: "Týdny čekání",
          desc: "Agentura odpovídá pomalu, nemáš kontrolu nad procesem.",
        },
        {
          icon: "🔒",
          title: "Žádná transparentnost",
          desc: "Nevíš, kam posílají tvůj životopis ani kolik firem kontaktovali.",
        },
      ],
    },
    solution: {
      tag: "Řešení",
      title: "Woker ti dá přímý kontakt",
      subtitle:
        "Najdi práci ve Švýcarsku sám — s AI matchingem, přímými kontakty a průvodcem celým procesem.",
      items: [
        {
          icon: "🎯",
          title: "AI matching",
          desc: "Algoritmus ti najde nabídky přesně pro tvůj profil a zkušenosti.",
        },
        {
          icon: "📧",
          title: "Přímé kontakty",
          desc: "Email přímo na firmu. Žádný prostředník, žádný poplatek za zprostředkování.",
        },
        {
          icon: "📋",
          title: "Průvodce procesem",
          desc: "Od životopisu po pracovní povolení — provedeme tě vším.",
        },
      ],
    },
    howItWorks: {
      tag: "3 jednoduché kroky",
      title: "Jak to funguje?",
      steps: [
        {
          num: "01",
          title: "Vytvoř si profil",
          desc: "Řekni nám o svých zkušenostech, jazykových znalostech a preferencích.",
        },
        {
          num: "02",
          title: "Dostávej nabídky",
          desc: "AI ti denně najde nové pozice ve Švýcarsku s nejvyšším matchem.",
        },
        {
          num: "03",
          title: "Kontaktuj firmu přímo",
          desc: "Získej email na zaměstnavatele a oslovuj firmy bez prostředníka.",
        },
      ],
    },
    pricing: {
      tag: "Ceník",
      title: "Jednoduchý a férový ceník",
      subtitle: "Začni zdarma, plať jen když ti to dává smysl.",
      monthly: {
        name: "Měsíční",
        price: "9,90",
        period: "/ měsíc",
        features: [
          "Neomezený přístup k nabídkám",
          "AI matching na tvůj profil",
          "Přímé kontakty na firmy",
          "Průvodce procesem",
          "Sledování přihlášek",
          "Denní nové nabídky",
        ],
        cta: "Začít 7 dní zdarma",
        badge: "Populární",
      },
      yearly: {
        name: "Roční",
        price: "99,90",
        period: "/ rok",
        save: "Ušetříte 19 €",
        features: [
          "Vše z měsíčního plánu",
          "Prioritní podpora",
          "Prémiové nabídky jako první",
          "Šablony životopisů pro CH",
          "Prémiový AI matching",
          "2 měsíce zdarma",
        ],
        cta: "Začít 7 dní zdarma",
      },
    },
    faq: {
      tag: "FAQ",
      title: "Časté otázky",
      items: [
        {
          q: "Potřebuji kreditní kartu pro trial?",
          a: "Ne. 7 dní je zcela zdarma, bez zadávání platebních údajů.",
        },
        {
          q: "Jaké pozice nabízíte?",
          a: "IT, stavebnictví, elektro, gastro, zdravotnictví a další obory poptávané ve Švýcarsku.",
        },
        {
          q: "Jak se liší Woker od agentury?",
          a: "Agentura si účtuje tisíce euro za zprostředkování. Woker ti dá přímý kontakt na firmu za 9,90 €/měsíc.",
        },
        {
          q: "Můžu zrušit kdykoliv?",
          a: "Ano. Žádné závazky, žádné skryté poplatky. Zrušíš jedním klikem.",
        },
      ],
    },
    finalCta: {
      title: "Začni hledat práci ve Švýcarsku ještě dnes",
      subtitle: "7 dní zdarma. Bez kreditky. Bez závazků.",
      cta: "Vyzkoušet zdarma →",
    },
    footer: {
      copy: "© 2026 Woker. Všechna práva vyhrazena.",
    },
  },
  en: {
    nav: { cta: "Start free" },
    hero: {
      badge: "🚀 Beta — 7 days free trial",
      title: "Jobs in Switzerland.\nNo agency. No fees.",
      subtitle:
        "Woker finds you job offers in Switzerland with direct employer contacts. No middleman, no thousands of euros to agencies.",
      cta: "Try 7 days free",
      cta2: "How does it work?",
      trust: "No credit card required • Cancel anytime",
    },
    problem: {
      tag: "Problem",
      title: "Agencies charge €1,000–3,000",
      subtitle:
        "And all they do is forward your CV. You pay thousands, they send an email. That makes no sense.",
      items: [
        {
          icon: "💸",
          title: "Expensive agencies",
          desc: "Fees of €1,000–3,000 for job placement you can find yourself.",
        },
        {
          icon: "🕐",
          title: "Weeks of waiting",
          desc: "Agencies respond slowly, you have no control over the process.",
        },
        {
          icon: "🔒",
          title: "No transparency",
          desc: "You don't know where they send your CV or how many companies they contacted.",
        },
      ],
    },
    solution: {
      tag: "Solution",
      title: "Woker gives you direct contacts",
      subtitle:
        "Find a job in Switzerland yourself — with AI matching, direct contacts and a step-by-step guide.",
      items: [
        {
          icon: "🎯",
          title: "AI matching",
          desc: "Our algorithm finds offers that match your profile and experience.",
        },
        {
          icon: "📧",
          title: "Direct contacts",
          desc: "Email directly to the company. No middleman, no placement fee.",
        },
        {
          icon: "📋",
          title: "Process guide",
          desc: "From CV to work permit — we guide you through everything.",
        },
      ],
    },
    howItWorks: {
      tag: "3 simple steps",
      title: "How does it work?",
      steps: [
        {
          num: "01",
          title: "Create your profile",
          desc: "Tell us about your experience, language skills and preferences.",
        },
        {
          num: "02",
          title: "Get job offers",
          desc: "AI finds new positions in Switzerland daily with highest match score.",
        },
        {
          num: "03",
          title: "Contact employers directly",
          desc: "Get the employer's email and reach out without a middleman.",
        },
      ],
    },
    pricing: {
      tag: "Pricing",
      title: "Simple and fair pricing",
      subtitle: "Start free, pay only when it makes sense.",
      monthly: {
        name: "Monthly",
        price: "9.90",
        period: "/ month",
        features: [
          "Unlimited access to job offers",
          "AI matching for your profile",
          "Direct employer contacts",
          "Step-by-step process guide",
          "Application tracking",
          "Daily new offers",
        ],
        cta: "Start 7-day free trial",
        badge: "Popular",
      },
      yearly: {
        name: "Yearly",
        price: "99.90",
        period: "/ year",
        save: "Save €19",
        features: [
          "Everything in monthly plan",
          "Priority support",
          "Premium offers first",
          "CV templates for Switzerland",
          "Premium AI matching",
          "2 months free",
        ],
        cta: "Start 7-day free trial",
      },
    },
    faq: {
      tag: "FAQ",
      title: "Frequently asked questions",
      items: [
        {
          q: "Do I need a credit card for the trial?",
          a: "No. 7 days are completely free, no payment details required.",
        },
        {
          q: "What types of jobs do you offer?",
          a: "IT, construction, electrical, hospitality, healthcare and other sectors in demand in Switzerland.",
        },
        {
          q: "How is Woker different from an agency?",
          a: "Agencies charge thousands for placement. Woker gives you direct employer contacts for €9.90/month.",
        },
        {
          q: "Can I cancel anytime?",
          a: "Yes. No commitments, no hidden fees. Cancel with one click.",
        },
      ],
    },
    finalCta: {
      title: "Start finding work in Switzerland today",
      subtitle: "7 days free. No credit card. No commitments.",
      cta: "Try free →",
    },
    footer: {
      copy: "© 2026 Woker. All rights reserved.",
    },
  },
};

export default function LandingPage() {
  const [lang, setLang] = useState<"cs" | "en">("cs");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = content[lang];

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8302A] to-orange-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-[#E8302A] font-black text-xl tracking-tight">Woker</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === "cs" ? "en" : "cs")}
              className="text-gray-400 text-sm hover:text-white transition font-medium"
            >
              {lang === "cs" ? "🇬🇧 EN" : "🇨🇿 CZ"}
            </button>
            <Link
              href="/login"
              className="bg-[#E8302A] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#c42822] transition"
            >
              {t.nav.cta}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-[#E8302A]/10 border border-[#E8302A]/20 text-[#E8302A] px-4 py-2 rounded-full text-sm font-bold mb-8">
            {t.hero.badge}
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6 whitespace-pre-line">
            {t.hero.title}
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/login"
              className="bg-[#E8302A] text-white px-8 py-4 rounded-xl text-base font-black hover:bg-[#c42822] transition hover:scale-105"
            >
              {t.hero.cta}
            </Link>
            <a
              href="#how"
              className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl text-base font-bold hover:bg-white/10 transition"
            >
              {t.hero.cta2}
            </a>
          </div>
          <p className="text-gray-600 text-sm">{t.hero.trust}</p>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#E8302A] text-sm font-bold uppercase tracking-widest">
              {t.problem.tag}
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-3 mb-4">
              {t.problem.title}
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              {t.problem.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.problem.items.map((item, i) => (
              <div
                key={i}
                className="bg-[#111] border border-red-500/10 rounded-2xl p-6"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20 px-5 bg-gradient-to-b from-[#0A0A0A] via-[#0f1a0f] to-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-green-400 text-sm font-bold uppercase tracking-widest">
              {t.solution.tag}
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-3 mb-4">
              {t.solution.title}
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              {t.solution.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {t.solution.items.map((item, i) => (
              <div
                key={i}
                className="bg-[#111] border border-green-500/10 rounded-2xl p-6"
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#E8302A] text-sm font-bold uppercase tracking-widest">
              {t.howItWorks.tag}
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-3">
              {t.howItWorks.title}
            </h2>
          </div>
          <div className="flex flex-col gap-8">
            {t.howItWorks.steps.map((step, i) => (
              <div
                key={i}
                className="flex gap-6 items-start"
              >
                <div className="text-[#E8302A] font-black text-4xl opacity-30 flex-shrink-0 w-16">
                  {step.num}
                </div>
                <div className="bg-[#111] border border-white/5 rounded-2xl p-6 flex-1">
                  <h3 className="text-white font-bold text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-5 bg-gradient-to-b from-[#0A0A0A] via-[#1a0a0a] to-[#0A0A0A]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#E8302A] text-sm font-bold uppercase tracking-widest">
              {t.pricing.tag}
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-3 mb-4">
              {t.pricing.title}
            </h2>
            <p className="text-gray-400 text-lg">{t.pricing.subtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Monthly */}
            <div className="relative bg-[#111] border-2 border-[#E8302A] rounded-2xl p-8">
              <div className="absolute -top-3 left-6 bg-[#E8302A] text-white text-xs font-bold px-3 py-1 rounded-full">
                {t.pricing.monthly.badge}
              </div>
              <h3 className="text-white font-bold text-xl mb-2">
                {t.pricing.monthly.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-white font-black text-5xl">
                  €{t.pricing.monthly.price}
                </span>
                <span className="text-gray-500 text-sm">
                  {t.pricing.monthly.period}
                </span>
              </div>
              <ul className="flex flex-col gap-3 mb-8">
                {t.pricing.monthly.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block w-full bg-[#E8302A] text-white text-center py-4 rounded-xl font-bold hover:bg-[#c42822] transition"
              >
                {t.pricing.monthly.cta}
              </Link>
            </div>

            {/* Yearly */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
              <h3 className="text-white font-bold text-xl mb-2">
                {t.pricing.yearly.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-white font-black text-5xl">
                  €{t.pricing.yearly.price}
                </span>
                <span className="text-gray-500 text-sm">
                  {t.pricing.yearly.period}
                </span>
              </div>
              <div className="inline-block bg-green-500/10 text-green-400 text-xs font-bold px-3 py-1 rounded-full mb-6">
                {t.pricing.yearly.save}
              </div>
              <ul className="flex flex-col gap-3 mb-8">
                {t.pricing.yearly.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block w-full bg-white/10 text-white text-center py-4 rounded-xl font-bold hover:bg-white/20 transition"
              >
                {t.pricing.yearly.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#E8302A] text-sm font-bold uppercase tracking-widest">
              {t.faq.tag}
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-3">
              {t.faq.title}
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            {t.faq.items.map((item, i) => (
              <div
                key={i}
                className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between"
                >
                  <span className="text-white font-bold text-sm pr-4">
                    {item.q}
                  </span>
                  <span className="text-gray-500 text-xl flex-shrink-0">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#E8302A]/20 via-[#111] to-[#111] border border-[#E8302A]/20 rounded-3xl p-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              {t.finalCta.title}
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              {t.finalCta.subtitle}
            </p>
            <Link
              href="/login"
              className="inline-block bg-[#E8302A] text-white px-10 py-4 rounded-xl text-lg font-black hover:bg-[#c42822] transition hover:scale-105"
            >
              {t.finalCta.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#E8302A] font-black text-lg">Woker</span>
          </div>
          <p className="text-gray-600 text-sm">{t.footer.copy}</p>
        </div>
      </footer>
    </main>
  );
}
