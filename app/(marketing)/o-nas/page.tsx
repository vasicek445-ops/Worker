import Link from "next/link";
import { Navbar, Footer } from "../../page";

export const metadata = {
  title: "O nás — Woker",
  description: "Příběh Wokeru a proč jsme ho postavili.",
};

export default function ONasPage() {
  return (
    <div
      className="min-h-screen bg-[#0a0a12] text-white"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <Navbar />
      <main
        className="px-4 sm:px-6 pt-32 pb-20 sm:pt-40 sm:pb-28"
      >
      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-400/10 border border-orange-400/20 text-orange-400 text-sm font-medium mb-8">
          <span>⚡</span>
          <span>Zkrátíme cestu za prací v zahraničí z měsíců na dny?</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
          O <span className="text-orange-400">nás</span> a naše <span className="text-orange-400">mise</span>{" "}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/text/target.png" alt="" className="inline-block w-12 h-12 sm:w-16 sm:h-16 align-middle object-contain" />
        </h1>
        <p className="text-white text-base sm:text-lg leading-relaxed mb-4">
          Ahoj{" "}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/illustrations/text/wave.png" alt="" className="inline-block w-7 h-7 sm:w-9 sm:h-9 align-middle object-contain" />
          {" "}<span className="text-orange-400 font-semibold">jsem rád, že tě můžu přivítat</span> na mojí platformě. Než projdeš seznam funkcí, dovol mi pár vět o tom, <span className="text-orange-400 font-semibold">kdo Woker stavěl a proč</span>.
        </p>
        <p className="text-white text-base sm:text-lg leading-relaxed mb-4">
          Jmenuji se <span className="text-orange-400 font-semibold">Václav Kočka</span>{" "}
          (<a href="https://instagram.com/vasicenko" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">@vasicenko</a>) a jsem <span className="text-orange-400 font-semibold">zakladatelem</span> této AI platformy pro <span className="text-orange-400 font-semibold">automatizované získání práce v zahraničí</span> na pár kliknutí.
        </p>
        <p className="text-white text-base sm:text-lg leading-relaxed mb-12 sm:mb-16">
          Už <span className="text-orange-400 font-semibold">3 roky žiju a podnikám ve Švýcarsku</span> — stavím weby pro klienty, řeším digitální projekty a <span className="text-orange-400 font-semibold">každý den potkávám lidi</span> co se sem chtějí přestěhovat za prací, nebo už tu jsou a hledají něco lepšího.
        </p>

        {/* ── SCATTERED MESSAGES ── */}
        <div className="my-12 sm:my-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 items-start">
            {[
              { src: "/screenshots/msg-13.jpg", rotate: 3 },
              { src: "/screenshots/msg-01.jpg", rotate: -3 },
              { src: "/screenshots/msg-04.jpg", rotate: 4 },
              { src: "/screenshots/msg-14.jpg", rotate: -3 },
              { src: "/screenshots/msg-02.jpg", rotate: 2 },
              { src: "/screenshots/msg-05.jpg", rotate: -4 },
              { src: "/screenshots/msg-03.jpg", rotate: -2 },
              { src: "/screenshots/msg-07.jpg", rotate: 3 },
              { src: "/screenshots/msg-15.jpg", rotate: 2 },
              { src: "/screenshots/msg-16.jpg", rotate: -2 },
              { src: "/screenshots/msg-06.jpg", rotate: 1 },
              { src: "/screenshots/msg-09.jpg", rotate: 5 },
              { src: "/screenshots/msg-10.jpg", rotate: -3 },
              { src: "/screenshots/msg-11.jpg", rotate: 2 },
              { src: "/screenshots/msg-17.jpg", rotate: -4 },
            ].map((msg, i) => (
              <div
                key={i}
                style={{ transform: `rotate(${msg.rotate}deg)` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={msg.src}
                  alt=""
                  loading="eager"
                  decoding="async"
                  className="w-full rounded-xl shadow-2xl shadow-black/50 border border-white/[0.08]"
                />
              </div>
            ))}
          </div>
        </div>

        <p className="text-white text-base sm:text-lg leading-relaxed mt-12 sm:mt-16 mb-4">
          Před 4 lety jsem ve svých <span className="text-orange-400 font-semibold">18 letech</span> odešel za lepším životem do zahraničí. Prošel jsem postupně <span className="text-orange-400 font-semibold">Holandsko, Irsko a Německo</span>, než jsem se nakonec usadil ve Švýcarsku.
        </p>
        <p className="text-white text-base sm:text-lg leading-relaxed">
          Do každé z těchto zemí jsem se dostal přes <span className="text-orange-400 font-semibold">zprostředkovatele z ČR</span>. Vedle platu, který odpovídal <span className="text-orange-400 font-semibold">minimální mzdě v dané zemi</span>, mi agentura naúčtovala ještě <span className="text-orange-400 font-semibold">600 EUR poplatek</span>. Když jsem zjistil, že mi plat sotva pokrývá náklady, řekl jsem si dost a začal jsem si <span className="text-orange-400 font-semibold">hledat práci sám a podle svých pravidel</span> — a tak jsem se před 3 lety dostal do Švýcarska, které mě nejvíc lákalo.
        </p>

        {/* ── TRAVEL COLLAGE ── */}
        <div className="my-12 sm:my-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 items-start">
            <div style={{ transform: 'rotate(-3deg)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/travel/travel-01.png"
                alt=""
                loading="eager"
                decoding="async"
                className="w-full rounded-xl shadow-2xl shadow-black/50 border border-white/[0.08]"
              />
            </div>
            <div style={{ transform: 'rotate(2deg)' }}>
              <video
                src="/travel/travel-01.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full rounded-xl shadow-2xl shadow-black/50 border border-white/[0.08]"
              />
            </div>
            <div style={{ transform: 'rotate(-2deg)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/travel/travel-02.jpg"
                alt=""
                loading="eager"
                decoding="async"
                className="w-full rounded-xl shadow-2xl shadow-black/50 border border-white/[0.08]"
              />
            </div>
            <div style={{ transform: 'rotate(4deg)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/travel/travel-03.jpg"
                alt=""
                loading="eager"
                decoding="async"
                className="w-full rounded-xl shadow-2xl shadow-black/50 border border-white/[0.08]"
              />
            </div>
            <div style={{ transform: 'rotate(-4deg)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/travel/travel-04.jpg"
                alt=""
                loading="eager"
                decoding="async"
                className="w-full rounded-xl shadow-2xl shadow-black/50 border border-white/[0.08]"
              />
            </div>
            <div style={{ transform: 'rotate(3deg)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/travel/travel-05.jpg"
                alt=""
                loading="eager"
                decoding="async"
                className="w-full rounded-xl shadow-2xl shadow-black/50 border border-white/[0.08]"
              />
            </div>
          </div>
        </div>

        <p className="text-white text-base sm:text-lg leading-relaxed mb-4">
          Nejdřív mi začali psát <span className="text-orange-400 font-semibold">kámoši</span> — jak mi to vyšlo. Pak <span className="text-orange-400 font-semibold">kamarádi mých kámošů</span>. A pak úplně cizí lidi přes <span className="text-orange-400 font-semibold">Instagram a TikTok</span>. Snažil jsem se pomáhat všem, ale pomáhat <span className="text-orange-400 font-semibold">10 lidem najednou</span> bylo časově neudržitelné.
        </p>
        <p className="text-white text-base sm:text-lg leading-relaxed mb-4">
          K myšlence o Wokeru mě nakonec přivedl <span className="text-orange-400 font-semibold">Branislav Hepner</span> — Slovák, který ve Švýcarsku už roky pomáhá Čechům a Slovákům <span className="text-orange-400 font-semibold">se zdravotním pojištěním a zastupuje je na úřadech</span>. Dělal jsem mu web a z té spolupráce mi došlo, <span className="text-orange-400 font-semibold">kolik lidí denně řeší ty samé problémy</span>. Tehdy jsem věděl, že to musím postavit.
        </p>
        <a
          href="https://www.helpner.ch"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 mb-4 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.06] hover:border-orange-400/30 transition-colors group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/branislav-portrait.png"
            alt="Branislav Hepner"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white/10"
          />
          <div>
            <div className="text-white font-semibold text-sm sm:text-base">Branislav Hepner</div>
            <div className="text-white/50 text-xs sm:text-sm">Poradce · zdravotní pojištění a úřady ve Švýcarsku <span className="text-orange-400 group-hover:underline">↗</span></div>
          </div>
        </a>
        <p className="text-white text-base sm:text-lg leading-relaxed">
          Tak jsem vymyslel <span className="text-orange-400 font-semibold">jednodušší řešení</span> — jak pomoct každému, kdo chce vyrazit za prací do zahraničí, aniž by ho zprostředkovatelské agentury z Česka nebo Slovenska natáhly na poplatcích. A zároveň aby vše proběhlo automatizovaně tím, že přenesu člověka <span className="text-orange-400 font-semibold">ze startu do cíle</span> — zautomatizoval jsem celou cestu mezi <span className="text-orange-400 font-semibold">„nevím jak začít&quot;</span> a <span className="text-orange-400 font-semibold">„mám práci a bydlení&quot;</span>.
        </p>
        <p className="text-white text-base sm:text-lg leading-relaxed mt-4">
          A jelikož jsem viděl, že <span className="text-orange-400 font-semibold">v Česku i na Slovensku není po zaplacení nákladů důstojná životní úroveň</span>, rozhodl jsem se pomáhat lidem najít práci <span className="text-orange-400 font-semibold">ve Švýcarsku</span>. A postupně chci platformu rozšiřovat i o <span className="text-orange-400 font-semibold">další státy s dobrou životní úrovní</span>.
        </p>
        <p className="text-white text-base sm:text-lg leading-relaxed mt-4">
          Startup Woker, který začal z malé myšlenky <span className="text-orange-400 font-semibold">v kavárně v Zugu</span>, dnes pomáhá <span className="text-orange-400 font-semibold">více jak 50-ti lidem</span> zjednodušit jejich cestu k práci ve Švýcarsku.
        </p>

        <figure className="mt-8 sm:mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vaclav-portrait.jpg?v=2"
            alt="Václav — zakladatel Wokeru"
            className="w-full max-w-2xl mx-auto rounded-3xl object-cover border border-white/10 shadow-2xl shadow-black/40"
          />
          <figcaption className="text-center text-white/40 text-xs sm:text-sm mt-3">
            Václav — zakladatel Wokeru
          </figcaption>
        </figure>

        <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight mt-12 sm:mt-16 mb-6 text-white">
          A jaký je hlavní <span className="text-orange-400">cíl naší mise</span>?
        </h2>
        <p className="text-white text-base sm:text-lg leading-relaxed">
          Cílem Wokeru je pomoct <span className="text-orange-400 font-semibold">začátečníkům, studentům, pracovníkům i celým rodinám</span> dostat se za prací do zahraničí a <span className="text-orange-400 font-semibold">žít lepší a důstojnější život</span>, než jaký je dnes v Česku a na Slovensku. Aby se vedle toho mohli věnovat tomu, <span className="text-orange-400 font-semibold">co skutečně milují</span>, měli na to kapitál — a aby si <span className="text-orange-400 font-semibold">mohli rozjet i vlastní podnikání</span>.
        </p>
        <p className="text-white text-base sm:text-lg leading-relaxed mt-4">
          Moje vize je udělat <span className="text-orange-400 font-semibold">#1 AI automatizovanou platformu</span> pro získání práce v zahraničí — díky které může <span className="text-orange-400 font-semibold">doslova kdokoliv</span> začít pracovat v zahraničí a vydělávat si peníze na to, aby mohl <span className="text-orange-400 font-semibold">rozvíjet svoji skutečnou vášeň</span>. Ať už je to <span className="text-orange-400 font-semibold">cestování, objevování nových míst nebo vlastní podnikání</span>.
        </p>
        <p className="text-white text-base sm:text-lg leading-relaxed mt-4">
          Jedno ti můžu zaručit na <span className="text-orange-400 font-semibold">100 %</span>. Narozdíl od guru, co ti prodávají, jak „zaručeně vydělat miliony korun online podnikáním&quot;, kde musíš dokonale ovládat marketing — na získání práce v zahraničí ti stačí <span className="text-orange-400 font-semibold">dobře napsaný životopis a perfektně formulovaný email a ochota udělat ten první krok</span>.
        </p>

        <p className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mt-12 sm:mt-16 mb-16 sm:mb-20">
          Tak co, <span className="text-orange-400">zkusíš to s námi</span>?
        </p>
      </div>

      {/* ── FINAL CTA BANNER ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 px-6 sm:px-16 py-16 sm:py-24 shadow-2xl shadow-orange-500/20">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-white italic text-lg sm:text-xl font-bold mb-4 drop-shadow">
              Odstartuj svoji cestu do zahraničí rychle a automaticky
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight text-white mb-8 sm:mb-10">
              Odešli svou první přihlášku firmě ve Švýcarsku ještě dnes 👇
            </h2>
            <Link
              href="/pricing"
              className="relative overflow-hidden inline-block px-8 sm:px-10 py-4 rounded-xl text-base sm:text-lg font-bold bg-white text-[#0a0a12] hover:text-white shadow-xl transition-colors duration-500 ease-out before:content-[''] before:absolute before:inset-0 before:bg-[#0a0a12] before:scale-0 before:origin-bottom hover:before:scale-100 before:transition-transform before:duration-500 before:ease-out"
            >
              <span className="relative z-10">Vyzkoušet Woker 7 dní zdarma &rarr;</span>
            </Link>
            <p className="text-white/75 text-sm mt-4">
              Prvních 7 dní zdarma · zrušíš kdykoliv
            </p>
          </div>

          <div className="max-w-4xl mx-auto mt-16 sm:mt-20 bg-white rounded-2xl px-6 sm:px-10 py-4 sm:py-5 flex flex-col sm:flex-row sm:justify-between gap-4">
            <div className="flex items-center gap-3 justify-start">
              <span className="text-xl">🔒</span>
              <span className="font-semibold text-[#0a0a12] text-sm sm:text-base">Možnost zrušit kdykoliv</span>
            </div>
            <div className="flex items-center gap-3 justify-start">
              <span className="text-xl">🛡️</span>
              <span className="font-semibold text-[#0a0a12] text-sm sm:text-base">Prvních 7 dní zdarma</span>
            </div>
            <div className="flex items-center gap-3 justify-start">
              <span className="text-xl">⚡</span>
              <span className="font-semibold text-[#0a0a12] text-sm sm:text-base">Rychlá podpora</span>
            </div>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
