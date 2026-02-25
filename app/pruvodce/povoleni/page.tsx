"use client";
import Link from "next/link";
import { useLanguage } from "../../../lib/i18n/LanguageContext";
import { getPermitsContent } from "../../../content/permits";

const colorMap: Record<string, { bg: string; border: string; text: string; badge: string; light: string }> = {
  yellow: { bg: "bg-yellow-500/[0.06]", border: "border-yellow-500/[0.12]", text: "text-yellow-400", badge: "bg-yellow-500/20", light: "bg-yellow-500/[0.08]" },
  green: { bg: "bg-green-500/[0.06]", border: "border-green-500/[0.12]", text: "text-green-400", badge: "bg-green-500/20", light: "bg-green-500/[0.08]" },
  blue: { bg: "bg-blue-500/[0.06]", border: "border-blue-500/[0.12]", text: "text-blue-400", badge: "bg-blue-500/20", light: "bg-blue-500/[0.08]" },
  purple: { bg: "bg-purple-500/[0.06]", border: "border-purple-500/[0.12]", text: "text-purple-400", badge: "bg-purple-500/20", light: "bg-purple-500/[0.08]" },
};

export default function PovoleniPage() {
  const { locale } = useLanguage();
  const t = getPermitsContent(locale);

  return (
    <main className="min-h-screen bg-[#0a0a0c] pb-24">
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.06)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="relative z-10 px-5 pt-4 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/20 flex items-center justify-center text-2xl">📋</div>
          <div><span className="text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider text-red-400 bg-red-500/10">{t.pageTag}</span></div>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight mt-3">{t.pageTitle}</h1>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">{t.pageDesc}</p>
      </div>

      <div className="px-5 mt-4 relative z-10">
        <div className="bg-blue-500/[0.06] rounded-2xl p-5 border border-blue-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">{t.introTitle}</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">{t.introText1} <span className="text-white font-semibold">{t.introText1Bold}</span> {t.introText2}</p>
          <div className="bg-green-500/[0.06] rounded-xl p-3.5 border border-green-500/[0.1]">
            <p className="text-sm font-bold text-green-400 mb-1">{t.euTitle}</p>
            <p className="text-[12px] text-gray-300 leading-relaxed">{t.euText} <span className="text-white font-medium">{t.euAgreement}</span></p>
          </div>
        </div>

        <h2 className="text-lg font-bold text-white mb-4">{t.permitTypesTitle}</h2>
        <div className="flex flex-col gap-3 mb-8">
          {t.permits.map((permit, i) => {
            const c = colorMap[permit.color];
            return (
              <div key={i} className={`${c.bg} rounded-2xl p-5 border ${c.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${c.badge} flex items-center justify-center`}><span className={`text-lg font-black ${c.text}`}>{permit.type}</span></div>
                    <div><h3 className="text-sm font-bold text-white">{permit.name}</h3><p className="text-[11px] text-gray-500">{permit.subtitle}</p></div>
                  </div>
                  <div className={`${c.light} rounded-lg px-2.5 py-1 border ${c.border}`}><span className={`text-[11px] font-bold ${c.text}`}>{permit.duration}</span></div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {permit.details.map((detail, j) => (
                    <div key={j} className="flex items-start gap-2"><div className={`w-1.5 h-1.5 rounded-full ${c.text.replace("text-", "bg-")} mt-1.5 flex-shrink-0`} /><span className="text-[13px] text-gray-300 leading-relaxed">{detail}</span></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-red-500/[0.06] rounded-2xl p-5 border border-red-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">{t.deadlineTitle}</h2>
          <div className="flex flex-col gap-2.5 mb-4">
            {t.deadlineItems.map((item, i) => (<div key={i} className="flex items-center gap-2.5"><span className="text-[13px] text-gray-300">{item}</span></div>))}
          </div>
          <div className="bg-yellow-500/[0.06] rounded-xl p-3 border border-yellow-500/[0.08]"><p className="text-[12px] text-yellow-400 font-medium">{t.deadlineTip}</p></div>
        </div>

        <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/[0.06] mb-6">
          <h2 className="text-base font-bold text-white mb-4">{t.docsTitle}</h2>
          <div className="flex flex-col gap-2">
            {t.docs.map((doc, i) => (<div key={i} className="flex items-center gap-3 bg-white/[0.03] rounded-xl px-4 py-3 border border-white/[0.04]"><span className="text-lg">{doc.icon}</span><span className="text-sm font-medium text-white">{doc.name}</span></div>))}
          </div>
        </div>

        <div className="bg-red-500/[0.08] rounded-2xl p-5 border border-red-500/[0.15] mb-6">
          <h2 className="text-base font-bold text-white mb-3">{t.consequencesTitle}</h2>
          <div className="flex flex-col gap-2.5">
            {t.consequences.map((item, i) => (<div key={i} className="flex items-start gap-2.5"><span className="text-base mt-0.5">{item.icon}</span><span className={`text-[13px] leading-relaxed ${item.severity === "high" ? "text-red-300 font-medium" : "text-gray-300"}`}>{item.text}</span></div>))}
          </div>
        </div>

        <div className="bg-blue-500/[0.06] rounded-2xl p-5 border border-blue-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">{t.renewalTitle}</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-3">{t.renewalText} <span className="text-white font-medium">{t.renewalOffice}</span>.</p>
          <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06] mb-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2"><span className="text-green-400">✅</span><span className="text-[13px] text-gray-300">{t.renewalEarliest} <span className="text-white font-medium">{t.renewalEarliestBold}</span> {t.renewalLatest}</span></div>
              <div className="flex items-center gap-2"><span className="text-red-400">⚠️</span><span className="text-[13px] text-gray-300"><span className="text-white font-medium">{t.renewalLatestBold}</span> {t.renewalLatest}</span></div>
            </div>
          </div>
          <p className="text-[12px] text-gray-500 mb-2">{t.renewalDocsLabel}</p>
          <div className="flex flex-col gap-1.5">
            {t.renewalDocs.map((item, i) => (<div key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" /><span className="text-[13px] text-gray-300">{item}</span></div>))}
          </div>
        </div>

        <div className="bg-yellow-500/[0.06] rounded-2xl p-5 border border-yellow-500/[0.12] mb-6">
          <h2 className="text-base font-bold text-white mb-3">{t.lostTitle}</h2>
          <div className="flex flex-col gap-3">
            {t.lostSteps.map((item, i) => (<div key={i} className="flex items-center gap-3 bg-white/[0.04] rounded-xl px-4 py-3 border border-white/[0.04]"><div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center text-sm font-bold text-yellow-400 flex-shrink-0">{item.step}</div><span className="text-[13px] text-gray-300">{item.text}</span></div>))}
          </div>
        </div>

        <div className="bg-purple-500/[0.06] rounded-2xl p-5 border border-purple-500/[0.12] mb-8">
          <h2 className="text-base font-bold text-white mb-3">{t.divorceTitle}</h2>
          <p className="text-[13px] text-gray-300 leading-relaxed mb-4">{t.divorceIntro}</p>
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-green-500/[0.04] rounded-xl p-4 border border-green-500/[0.08]">
              <p className="text-sm font-bold text-green-400 mb-2">{t.euCitizensTitle}</p>
              <p className="text-[13px] text-gray-300 leading-relaxed">{t.euCitizensText}</p>
              <div className="flex flex-col gap-1 mt-2">{t.euCitizensConditions.map((c, i) => (<div key={i} className="flex items-center gap-2"><span className="text-green-400">✓</span><span className="text-[12px] text-gray-300">{c}</span></div>))}</div>
            </div>
            <div className="bg-orange-500/[0.04] rounded-xl p-4 border border-orange-500/[0.08]">
              <p className="text-sm font-bold text-orange-400 mb-2">{t.thirdCountryTitle}</p>
              <p className="text-[13px] text-gray-300 leading-relaxed">{t.thirdCountryText}</p>
              <div className="flex flex-col gap-1 mt-2">{t.thirdCountryConditions.map((c, i) => (<div key={i} className="flex items-center gap-2"><span className="text-orange-400">✓</span><span className="text-[12px] text-gray-300">{c}</span></div>))}</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/[0.1] to-orange-500/[0.04] rounded-2xl p-5 border border-red-500/[0.15] mb-6">
          <p className="text-base font-bold text-white mb-2">{t.keyRuleTitle}</p>
          <p className="text-[13px] text-gray-300 leading-relaxed">{t.keyRuleText} <span className="text-white font-semibold">{t.keyRuleBold}</span>.</p>
        </div>

        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.06] mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">📚</span>
            <div className="flex-1"><p className="text-sm font-medium text-white">{t.officialTitle}</p><p className="text-[11px] text-gray-500">{t.officialDesc}</p></div>
            <a href="https://www.ch.ch" target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-400 font-medium hover:text-blue-300 transition-colors">{t.officialLink}</a>
          </div>
        </div>

        <Link href="/kontakty" className="block mb-6">
          <div className="bg-gradient-to-br from-red-500/[0.12] to-red-500/[0.04] rounded-2xl p-5 border border-red-500/[0.15] text-center hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-shadow duration-300">
            <p className="text-sm font-bold text-white mb-1">{t.ctaTitle}</p>
            <p className="text-[12px] text-gray-400 mb-3">{t.ctaDesc}</p>
            <span className="bg-red-500 text-white px-5 py-2.5 rounded-[10px] text-[13px] font-semibold shadow-lg shadow-red-500/30 inline-block">{t.ctaButton}</span>
          </div>
        </Link>
      </div>
    </main>
  );
}
