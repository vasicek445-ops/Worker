import { Translation } from "../types";
const hu: Translation = {
  locale: "hu", flag: "🇭🇺", name: "Magyar",
  nav: { overview: "Főoldal", contacts: "Kapcsolatok", guide: "Útmutató", jobs: "Állások", profile: "Profil" },
  dashboard: {
    greeting: "Szia 👋", welcome: "Üdvözöl a Woker",
    search: "Ügynökség, város, pozíció keresése...",
    agencies_title: "Ügynökségi kapcsolatok", agencies_count: "ügynökség",
    agencies_show_all: "Összes ügynökség",
    guides_title: "Svájci útmutató", guides_all: "Mind",
    premium_title: "Woker Premium",
    premium_desc: "Hozzáférés 1000+ kapcsolathoz, prémium útmutatókhoz és AI asszisztenshez a svájci munkához.",
    premium_cta: "Aktiválás 9,90 €/hó", premium_trial: "7 nap ingyen",
    wokee_name: "Wokee asszisztens", wokee_online: "Online 24/7",
    wokee_message: "Szia! 👋 Wokee vagyok, a személyes asszisztensed a svájci munkához. Segítek engedélyekkel, lakhatással és álláskeresésben.",
    wokee_open: "Chat megnyitása →",
    wokee_q1: "Hogyan kapjak engedélyt?", wokee_q2: "Átlagos fizetések?", wokee_q3: "Hol lakjak?",
  },
  guides: {
    permits_title: "Munkavállalási engedélyek", permits_desc: "L, B, C, G – típusok és megszerzésük",
    insurance_title: "Egészségbiztosítás", insurance_desc: "Spórolj havi több száz CHF-et",
    tax_title: "Adók és biztosítás", tax_desc: "Adórendszer, kötelező biztosítások",
    language_title: "Német a munkához", language_desc: "Kifejezések, tesztek, tanfolyamok",
  },
  tags: { important: "Fontos", popular: "Népszerű", new_tag: "Új", recommended: "Ajánlott" },
};
export default hu;
