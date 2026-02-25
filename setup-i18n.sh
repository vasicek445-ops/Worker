#!/bin/bash
echo "🌍 Building i18n system for Woker (10 languages)..."

# ============================================
# 1. Create i18n directory structure
# ============================================
mkdir -p lib/i18n/translations

# ============================================
# 2. Create translation type definitions
# ============================================
cat > lib/i18n/types.ts << 'TYPES_EOF'
export type Locale = "cs" | "en" | "pl" | "uk" | "ro" | "it" | "pt" | "es" | "el" | "hu";

export interface Translation {
  locale: Locale;
  flag: string;
  name: string;
  nav: {
    overview: string;
    contacts: string;
    guide: string;
    jobs: string;
    profile: string;
  };
  dashboard: {
    greeting: string;
    welcome: string;
    search: string;
    agencies_title: string;
    agencies_count: string;
    agencies_show_all: string;
    guides_title: string;
    guides_all: string;
    premium_title: string;
    premium_desc: string;
    premium_cta: string;
    premium_trial: string;
    wokee_name: string;
    wokee_online: string;
    wokee_message: string;
    wokee_open: string;
    wokee_q1: string;
    wokee_q2: string;
    wokee_q3: string;
  };
  guides: {
    permits_title: string;
    permits_desc: string;
    insurance_title: string;
    insurance_desc: string;
    tax_title: string;
    tax_desc: string;
    language_title: string;
    language_desc: string;
  };
  tags: {
    important: string;
    popular: string;
    new_tag: string;
    recommended: string;
  };
}

export const LOCALES: { code: Locale; flag: string; name: string }[] = [
  { code: "en", flag: "🇬🇧", name: "English" },
  { code: "cs", flag: "🇨🇿", name: "Čeština" },
  { code: "pl", flag: "🇵🇱", name: "Polski" },
  { code: "uk", flag: "🇺🇦", name: "Українська" },
  { code: "ro", flag: "🇷🇴", name: "Română" },
  { code: "it", flag: "🇮🇹", name: "Italiano" },
  { code: "pt", flag: "🇵🇹", name: "Português" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "el", flag: "🇬🇷", name: "Ελληνικά" },
  { code: "hu", flag: "🇭🇺", name: "Magyar" },
];
TYPES_EOF

# ============================================
# 3. Create all translation files
# ============================================

# ENGLISH
cat > lib/i18n/translations/en.ts << 'EOF'
import { Translation } from "../types";
const en: Translation = {
  locale: "en", flag: "🇬🇧", name: "English",
  nav: { overview: "Home", contacts: "Contacts", guide: "Guides", jobs: "Jobs", profile: "Profile" },
  dashboard: {
    greeting: "Hello 👋", welcome: "Welcome to Woker",
    search: "Search agency, city, position...",
    agencies_title: "Agency contacts", agencies_count: "agencies",
    agencies_show_all: "Show all agencies",
    guides_title: "Switzerland Guide", guides_all: "All",
    premium_title: "Woker Premium",
    premium_desc: "Unlock 1,000+ contacts, premium guides and AI assistant for working in Switzerland.",
    premium_cta: "Activate for €9.90/month", premium_trial: "7 days free",
    wokee_name: "Wokee assistant", wokee_online: "Online 24/7",
    wokee_message: "Hi! 👋 I'm Wokee, your assistant for working in Switzerland. I can help with permits, housing and job search.",
    wokee_open: "Open chat →",
    wokee_q1: "How to get a permit?", wokee_q2: "Average salaries?", wokee_q3: "Where to live?",
  },
  guides: {
    permits_title: "Work Permits", permits_desc: "L, B, C, G – types and how to get them",
    insurance_title: "Health Insurance", insurance_desc: "How to save hundreds of CHF monthly",
    tax_title: "Taxes & Insurance", tax_desc: "Tax system, mandatory insurance",
    language_title: "German for Work", language_desc: "Phrases, tests, courses",
  },
  tags: { important: "Important", popular: "Popular", new_tag: "New", recommended: "Recommended" },
};
export default en;
EOF

# CZECH
cat > lib/i18n/translations/cs.ts << 'EOF'
import { Translation } from "../types";
const cs: Translation = {
  locale: "cs", flag: "🇨🇿", name: "Čeština",
  nav: { overview: "Přehled", contacts: "Kontakty", guide: "Průvodce", jobs: "Pozice", profile: "Profil" },
  dashboard: {
    greeting: "Ahoj 👋", welcome: "Vítej ve Wokeru",
    search: "Hledat agenturu, město, pozici...",
    agencies_title: "Kontakty na agentury", agencies_count: "agentur",
    agencies_show_all: "Zobrazit všechny agentury",
    guides_title: "Průvodce Švýcarskem", guides_all: "Vše",
    premium_title: "Woker Premium",
    premium_desc: "Odemkni 1 000+ kontaktů, prémiové průvodce a AI asistenta za práci ve Švýcarsku.",
    premium_cta: "Aktivovat za 9,90 €/měsíc", premium_trial: "7 dní zdarma",
    wokee_name: "Wokee asistent", wokee_online: "Online 24/7",
    wokee_message: "Ahoj! 👋 Jsem Wokee, tvůj asistent pro práci ve Švýcarsku. Poradím ti s povolením, bydlením i hledáním práce.",
    wokee_open: "Otevřít chat →",
    wokee_q1: "Jak získat povolení?", wokee_q2: "Průměrné platy?", wokee_q3: "Kde bydlet?",
  },
  guides: {
    permits_title: "Pracovní povolení", permits_desc: "L, B, C, G – typy a jak získat",
    insurance_title: "Zdravotní pojištění", insurance_desc: "Jak ušetřit stovky CHF měsíčně",
    tax_title: "Daně a pojištění", tax_desc: "Systém daní, povinné pojištění",
    language_title: "Němčina pro práci", language_desc: "Fráze, testy, kurzy",
  },
  tags: { important: "Důležité", popular: "Populární", new_tag: "Nové", recommended: "Doporučeno" },
};
export default cs;
EOF

# POLISH
cat > lib/i18n/translations/pl.ts << 'EOF'
import { Translation } from "../types";
const pl: Translation = {
  locale: "pl", flag: "🇵🇱", name: "Polski",
  nav: { overview: "Główna", contacts: "Kontakty", guide: "Poradnik", jobs: "Oferty", profile: "Profil" },
  dashboard: {
    greeting: "Cześć 👋", welcome: "Witaj w Wokerze",
    search: "Szukaj agencji, miasta, stanowiska...",
    agencies_title: "Kontakty do agencji", agencies_count: "agencji",
    agencies_show_all: "Pokaż wszystkie agencje",
    guides_title: "Przewodnik po Szwajcarii", guides_all: "Wszystko",
    premium_title: "Woker Premium",
    premium_desc: "Odblokuj ponad 1000 kontaktów, przewodniki premium i asystenta AI do pracy w Szwajcarii.",
    premium_cta: "Aktywuj za 9,90 €/mies.", premium_trial: "7 dni za darmo",
    wokee_name: "Asystent Wokee", wokee_online: "Online 24/7",
    wokee_message: "Cześć! 👋 Jestem Wokee, Twój asystent do pracy w Szwajcarii. Pomogę z pozwoleniami, mieszkaniem i szukaniem pracy.",
    wokee_open: "Otwórz czat →",
    wokee_q1: "Jak uzyskać pozwolenie?", wokee_q2: "Średnie zarobki?", wokee_q3: "Gdzie mieszkać?",
  },
  guides: {
    permits_title: "Pozwolenia na pracę", permits_desc: "L, B, C, G – rodzaje i jak je uzyskać",
    insurance_title: "Ubezpieczenie zdrowotne", insurance_desc: "Jak zaoszczędzić setki CHF miesięcznie",
    tax_title: "Podatki i ubezpieczenia", tax_desc: "System podatkowy, obowiązkowe ubezpieczenia",
    language_title: "Niemiecki do pracy", language_desc: "Zwroty, testy, kursy",
  },
  tags: { important: "Ważne", popular: "Popularne", new_tag: "Nowe", recommended: "Polecane" },
};
export default pl;
EOF

# UKRAINIAN
cat > lib/i18n/translations/uk.ts << 'EOF'
import { Translation } from "../types";
const uk: Translation = {
  locale: "uk", flag: "🇺🇦", name: "Українська",
  nav: { overview: "Головна", contacts: "Контакти", guide: "Гід", jobs: "Вакансії", profile: "Профіль" },
  dashboard: {
    greeting: "Привіт 👋", welcome: "Ласкаво просимо до Woker",
    search: "Шукати агенцію, місто, посаду...",
    agencies_title: "Контакти агенцій", agencies_count: "агенцій",
    agencies_show_all: "Показати всі агенції",
    guides_title: "Гід по Швейцарії", guides_all: "Все",
    premium_title: "Woker Premium",
    premium_desc: "Розблокуйте 1 000+ контактів, преміум-гіди та AI-асистента для роботи у Швейцарії.",
    premium_cta: "Активувати за €9,90/міс.", premium_trial: "7 днів безкоштовно",
    wokee_name: "Асистент Wokee", wokee_online: "Онлайн 24/7",
    wokee_message: "Привіт! 👋 Я Wokee, ваш асистент для роботи у Швейцарії. Допоможу з дозволами, житлом та пошуком роботи.",
    wokee_open: "Відкрити чат →",
    wokee_q1: "Як отримати дозвіл?", wokee_q2: "Середні зарплати?", wokee_q3: "Де жити?",
  },
  guides: {
    permits_title: "Дозволи на роботу", permits_desc: "L, B, C, G – типи та як отримати",
    insurance_title: "Медичне страхування", insurance_desc: "Як зекономити сотні CHF щомісяця",
    tax_title: "Податки та страхування", tax_desc: "Податкова система, обов'язкове страхування",
    language_title: "Німецька для роботи", language_desc: "Фрази, тести, курси",
  },
  tags: { important: "Важливо", popular: "Популярне", new_tag: "Нове", recommended: "Рекомендовано" },
};
export default uk;
EOF

# ROMANIAN
cat > lib/i18n/translations/ro.ts << 'EOF'
import { Translation } from "../types";
const ro: Translation = {
  locale: "ro", flag: "🇷🇴", name: "Română",
  nav: { overview: "Acasă", contacts: "Contacte", guide: "Ghid", jobs: "Joburi", profile: "Profil" },
  dashboard: {
    greeting: "Salut 👋", welcome: "Bine ai venit la Woker",
    search: "Caută agenție, oraș, poziție...",
    agencies_title: "Contacte agenții", agencies_count: "agenții",
    agencies_show_all: "Arată toate agențiile",
    guides_title: "Ghidul Elveției", guides_all: "Tot",
    premium_title: "Woker Premium",
    premium_desc: "Deblochează peste 1.000 de contacte, ghiduri premium și asistent AI pentru lucrul în Elveția.",
    premium_cta: "Activează la 9,90 €/lună", premium_trial: "7 zile gratuit",
    wokee_name: "Asistent Wokee", wokee_online: "Online 24/7",
    wokee_message: "Salut! 👋 Sunt Wokee, asistentul tău pentru lucrul în Elveția. Te ajut cu permise, locuință și căutarea unui job.",
    wokee_open: "Deschide chat →",
    wokee_q1: "Cum obțin permisul?", wokee_q2: "Salarii medii?", wokee_q3: "Unde să locuiesc?",
  },
  guides: {
    permits_title: "Permise de muncă", permits_desc: "L, B, C, G – tipuri și cum le obții",
    insurance_title: "Asigurare de sănătate", insurance_desc: "Cum economisești sute de CHF lunar",
    tax_title: "Taxe și asigurări", tax_desc: "Sistemul fiscal, asigurări obligatorii",
    language_title: "Germană pentru muncă", language_desc: "Expresii, teste, cursuri",
  },
  tags: { important: "Important", popular: "Popular", new_tag: "Nou", recommended: "Recomandat" },
};
export default ro;
EOF

# ITALIAN
cat > lib/i18n/translations/it.ts << 'EOF'
import { Translation } from "../types";
const it: Translation = {
  locale: "it", flag: "🇮🇹", name: "Italiano",
  nav: { overview: "Home", contacts: "Contatti", guide: "Guida", jobs: "Lavori", profile: "Profilo" },
  dashboard: {
    greeting: "Ciao 👋", welcome: "Benvenuto su Woker",
    search: "Cerca agenzia, città, posizione...",
    agencies_title: "Contatti agenzie", agencies_count: "agenzie",
    agencies_show_all: "Mostra tutte le agenzie",
    guides_title: "Guida alla Svizzera", guides_all: "Tutto",
    premium_title: "Woker Premium",
    premium_desc: "Sblocca oltre 1.000 contatti, guide premium e assistente AI per lavorare in Svizzera.",
    premium_cta: "Attiva a 9,90 €/mese", premium_trial: "7 giorni gratis",
    wokee_name: "Assistente Wokee", wokee_online: "Online 24/7",
    wokee_message: "Ciao! 👋 Sono Wokee, il tuo assistente per lavorare in Svizzera. Ti aiuto con permessi, alloggio e ricerca lavoro.",
    wokee_open: "Apri chat →",
    wokee_q1: "Come ottenere il permesso?", wokee_q2: "Stipendi medi?", wokee_q3: "Dove vivere?",
  },
  guides: {
    permits_title: "Permessi di lavoro", permits_desc: "L, B, C, G – tipi e come ottenerli",
    insurance_title: "Assicurazione sanitaria", insurance_desc: "Come risparmiare centinaia di CHF al mese",
    tax_title: "Tasse e assicurazioni", tax_desc: "Sistema fiscale, assicurazioni obbligatorie",
    language_title: "Tedesco per il lavoro", language_desc: "Frasi, test, corsi",
  },
  tags: { important: "Importante", popular: "Popolare", new_tag: "Nuovo", recommended: "Consigliato" },
};
export default it;
EOF

# PORTUGUESE
cat > lib/i18n/translations/pt.ts << 'EOF'
import { Translation } from "../types";
const pt: Translation = {
  locale: "pt", flag: "🇵🇹", name: "Português",
  nav: { overview: "Início", contacts: "Contactos", guide: "Guia", jobs: "Empregos", profile: "Perfil" },
  dashboard: {
    greeting: "Olá 👋", welcome: "Bem-vindo ao Woker",
    search: "Procurar agência, cidade, posição...",
    agencies_title: "Contactos de agências", agencies_count: "agências",
    agencies_show_all: "Mostrar todas as agências",
    guides_title: "Guia da Suíça", guides_all: "Tudo",
    premium_title: "Woker Premium",
    premium_desc: "Desbloqueie mais de 1.000 contactos, guias premium e assistente AI para trabalhar na Suíça.",
    premium_cta: "Ativar por 9,90 €/mês", premium_trial: "7 dias grátis",
    wokee_name: "Assistente Wokee", wokee_online: "Online 24/7",
    wokee_message: "Olá! 👋 Sou o Wokee, o teu assistente para trabalhar na Suíça. Ajudo-te com autorizações, alojamento e procura de emprego.",
    wokee_open: "Abrir chat →",
    wokee_q1: "Como obter autorização?", wokee_q2: "Salários médios?", wokee_q3: "Onde viver?",
  },
  guides: {
    permits_title: "Autorizações de trabalho", permits_desc: "L, B, C, G – tipos e como obter",
    insurance_title: "Seguro de saúde", insurance_desc: "Como poupar centenas de CHF por mês",
    tax_title: "Impostos e seguros", tax_desc: "Sistema fiscal, seguros obrigatórios",
    language_title: "Alemão para o trabalho", language_desc: "Frases, testes, cursos",
  },
  tags: { important: "Importante", popular: "Popular", new_tag: "Novo", recommended: "Recomendado" },
};
export default pt;
EOF

# SPANISH
cat > lib/i18n/translations/es.ts << 'EOF'
import { Translation } from "../types";
const es: Translation = {
  locale: "es", flag: "🇪🇸", name: "Español",
  nav: { overview: "Inicio", contacts: "Contactos", guide: "Guía", jobs: "Empleos", profile: "Perfil" },
  dashboard: {
    greeting: "Hola 👋", welcome: "Bienvenido a Woker",
    search: "Buscar agencia, ciudad, puesto...",
    agencies_title: "Contactos de agencias", agencies_count: "agencias",
    agencies_show_all: "Mostrar todas las agencias",
    guides_title: "Guía de Suiza", guides_all: "Todo",
    premium_title: "Woker Premium",
    premium_desc: "Desbloquea más de 1.000 contactos, guías premium y asistente AI para trabajar en Suiza.",
    premium_cta: "Activar por 9,90 €/mes", premium_trial: "7 días gratis",
    wokee_name: "Asistente Wokee", wokee_online: "Online 24/7",
    wokee_message: "¡Hola! 👋 Soy Wokee, tu asistente para trabajar en Suiza. Te ayudo con permisos, vivienda y búsqueda de empleo.",
    wokee_open: "Abrir chat →",
    wokee_q1: "¿Cómo obtener el permiso?", wokee_q2: "¿Salarios medios?", wokee_q3: "¿Dónde vivir?",
  },
  guides: {
    permits_title: "Permisos de trabajo", permits_desc: "L, B, C, G – tipos y cómo obtenerlos",
    insurance_title: "Seguro de salud", insurance_desc: "Cómo ahorrar cientos de CHF al mes",
    tax_title: "Impuestos y seguros", tax_desc: "Sistema fiscal, seguros obligatorios",
    language_title: "Alemán para el trabajo", language_desc: "Frases, tests, cursos",
  },
  tags: { important: "Importante", popular: "Popular", new_tag: "Nuevo", recommended: "Recomendado" },
};
export default es;
EOF

# GREEK
cat > lib/i18n/translations/el.ts << 'EOF'
import { Translation } from "../types";
const el: Translation = {
  locale: "el", flag: "🇬🇷", name: "Ελληνικά",
  nav: { overview: "Αρχική", contacts: "Επαφές", guide: "Οδηγός", jobs: "Θέσεις", profile: "Προφίλ" },
  dashboard: {
    greeting: "Γεια σου 👋", welcome: "Καλώς ήρθες στο Woker",
    search: "Αναζήτηση πρακτορείου, πόλης, θέσης...",
    agencies_title: "Επαφές πρακτορείων", agencies_count: "πρακτορεία",
    agencies_show_all: "Εμφάνιση όλων",
    guides_title: "Οδηγός Ελβετίας", guides_all: "Όλα",
    premium_title: "Woker Premium",
    premium_desc: "Ξεκλείδωσε 1.000+ επαφές, premium οδηγούς και AI βοηθό για εργασία στην Ελβετία.",
    premium_cta: "Ενεργοποίηση 9,90 €/μήνα", premium_trial: "7 ημέρες δωρεάν",
    wokee_name: "Βοηθός Wokee", wokee_online: "Online 24/7",
    wokee_message: "Γεια! 👋 Είμαι ο Wokee, ο βοηθός σου για εργασία στην Ελβετία. Βοηθάω με άδειες, στέγαση και αναζήτηση εργασίας.",
    wokee_open: "Άνοιγμα chat →",
    wokee_q1: "Πώς παίρνω άδεια;", wokee_q2: "Μέσοι μισθοί;", wokee_q3: "Πού να μείνω;",
  },
  guides: {
    permits_title: "Άδειες εργασίας", permits_desc: "L, B, C, G – τύποι και πώς να τις αποκτήσεις",
    insurance_title: "Ασφάλεια υγείας", insurance_desc: "Πώς να εξοικονομήσεις εκατοντάδες CHF",
    tax_title: "Φόροι & ασφάλιση", tax_desc: "Φορολογικό σύστημα, υποχρεωτική ασφάλιση",
    language_title: "Γερμανικά για δουλειά", language_desc: "Φράσεις, τεστ, μαθήματα",
  },
  tags: { important: "Σημαντικό", popular: "Δημοφιλές", new_tag: "Νέο", recommended: "Προτεινόμενο" },
};
export default el;
EOF

# HUNGARIAN
cat > lib/i18n/translations/hu.ts << 'EOF'
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
EOF

# ============================================
# 4. Create translation index
# ============================================
cat > lib/i18n/translations/index.ts << 'EOF'
import { Translation, Locale } from "../types";
import cs from "./cs";
import en from "./en";
import pl from "./pl";
import uk from "./uk";
import ro from "./ro";
import it from "./it";
import pt from "./pt";
import es from "./es";
import el from "./el";
import hu from "./hu";

const translations: Record<Locale, Translation> = { cs, en, pl, uk, ro, it, pt, es, el, hu };
export default translations;
export function getTranslation(locale: Locale): Translation { return translations[locale] || translations.en; }
EOF

# ============================================
# 5. Create Language Context
# ============================================
cat > lib/i18n/LanguageContext.tsx << 'EOF'
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, Translation } from "./types";
import translations from "./translations";

interface LanguageContextType {
  locale: Locale;
  t: Translation;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  t: translations.en,
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = document.cookie.match(/woker-lang=(\w+)/)?.[1] as Locale;
    if (saved && translations[saved]) {
      setLocaleState(saved);
    } else {
      // Auto-detect from browser
      const browserLang = navigator.language.split("-")[0] as Locale;
      if (translations[browserLang]) {
        setLocaleState(browserLang);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `woker-lang=${newLocale};path=/;max-age=31536000`;
  };

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
EOF

# ============================================
# 6. Create Language Switcher Component
# ============================================
cat > app/components/LanguageSwitcher.tsx << 'EOF'
"use client";
import { useState } from "react";
import { useLanguage } from "../../lib/i18n/LanguageContext";
import { LOCALES } from "../../lib/i18n/types";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LOCALES.find((l) => l.code === locale);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.1] transition-colors rounded-lg px-2.5 py-1.5 border border-white/[0.08]"
      >
        <span className="text-base">{current?.flag}</span>
        <span className="text-[11px] text-gray-400 font-medium hidden sm:inline">{current?.code.toUpperCase()}</span>
        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-[150]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-[151] bg-[#1a1a1e] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden min-w-[180px]">
            <div className="px-3 py-2 border-b border-white/[0.06]">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Language</span>
            </div>
            <div className="max-h-[320px] overflow-y-auto">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLocale(l.code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/[0.06] transition-colors ${locale === l.code ? "bg-white/[0.04]" : ""}`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <div className="flex-1">
                    <span className="text-sm text-white font-medium">{l.name}</span>
                  </div>
                  {locale === l.code && <div className="w-2 h-2 rounded-full bg-red-500" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
EOF

# ============================================
# 7. Create Dashboard Client Component
# ============================================
cat > app/components/DashboardContent.tsx << 'EOF'
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
    { icon: "📋", title: t.guides.permits_title, desc: t.guides.permits_desc, tag: t.tags.important, tagColor: "text-red-400 bg-red-500/10", href: "/pruvodce/povoleni" },
    { icon: "🏥", title: t.guides.insurance_title, desc: t.guides.insurance_desc, tag: t.tags.popular, tagColor: "text-blue-400 bg-blue-500/10", href: "/pruvodce/pojisteni" },
    { icon: "💰", title: t.guides.tax_title, desc: t.guides.tax_desc, tag: t.tags.new_tag, tagColor: "text-green-400 bg-green-500/10", href: "/pruvodce/dane" },
    { icon: "🗣️", title: t.guides.language_title, desc: t.guides.language_desc, tag: t.tags.recommended, tagColor: "text-blue-400 bg-blue-500/10", href: "/jazyky" },
  ];

  const navItems = [
    { icon: "🏠", label: t.nav.overview, href: "/dashboard", active: true },
    { icon: "📇", label: t.nav.contacts, href: "/kontakty", active: false },
    { icon: "📖", label: t.nav.guide, href: "/pruvodce", active: false },
    { icon: "💼", label: t.nav.jobs, href: "/nabidka", active: false },
    { icon: "👤", label: t.nav.profile, href: "/profil", active: false },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0c] pb-24">
      <div className="fixed top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.06)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="relative z-10 px-5 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] text-gray-500 font-medium tracking-wide">{t.dashboard.greeting}</p>
            <h1 className="text-[22px] font-bold text-white mt-0.5 tracking-tight">{t.dashboard.welcome}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Link href="/profil" className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-red-500/30">W</Link>
          </div>
        </div>
        <div className="mt-5 bg-white/[0.04] rounded-[14px] px-4 py-3 flex items-center gap-3 border border-white/[0.06]">
          <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <span className="text-gray-500 text-sm">{t.dashboard.search}</span>
        </div>
      </div>

      {/* Agencies */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[15px]">📇</span>
            <span className="text-[15px] font-semibold text-white tracking-tight">{t.dashboard.agencies_title}</span>
          </div>
          <Link href="/kontakty" className="text-xs text-red-500 font-medium hover:text-red-400 transition-colors">{agencyCount.toLocaleString()} {t.dashboard.agencies_count} →</Link>
        </div>
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] overflow-hidden">
          {agencies.map((a: any, i: number) => (
            <Link key={i} href="/kontakty" className={`px-4 py-3.5 flex items-center justify-between hover:bg-white/[0.04] transition-colors ${i < agencies.length - 1 ? "border-b border-white/[0.04]" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-red-500/[0.08] flex items-center justify-center text-sm font-semibold text-red-400 border border-red-500/[0.12]">{a.name?.charAt(0) || "?"}</div>
                <div>
                  <p className="text-sm font-medium text-white">{a.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.city} • {a.canton}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{langFlag[a.language_region] || "🇨🇭"}</span>
                <span className="text-sm text-gray-700">›</span>
              </div>
            </Link>
          ))}
          <Link href="/kontakty" className="block px-4 py-3 bg-red-500/[0.04] border-t border-red-500/[0.08] text-center hover:bg-red-500/[0.08] transition-colors">
            <span className="text-[13px] font-semibold text-red-500">{t.dashboard.agencies_show_all}</span>
          </Link>
        </div>
      </div>

      {/* Guides */}
      <div className="px-5 mt-7">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[15px]">📖</span>
            <span className="text-[15px] font-semibold text-white">{t.dashboard.guides_title}</span>
          </div>
          <Link href="/pruvodce" className="text-xs text-gray-500 font-medium hover:text-gray-400 transition-colors">{t.dashboard.guides_all} →</Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {guides.map((g, i) => (
            <Link key={i} href={g.href} className="bg-white/[0.03] rounded-[14px] p-4 border border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.1] transition-all duration-200 hover:-translate-y-0.5">
              <div className="text-2xl mb-2.5">{g.icon}</div>
              <p className="text-[13px] font-semibold text-white mb-1 leading-tight">{g.title}</p>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-2">{g.desc}</p>
              <span className={`text-[10px] font-semibold px-2 py-1 rounded-md uppercase tracking-wider ${g.tagColor}`}>{g.tag}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Premium */}
      <div className="px-5 mt-7">
        <Link href="/pricing" className="block">
          <div className="bg-gradient-to-br from-red-500/[0.12] to-red-500/[0.04] rounded-2xl p-5 border border-red-500/[0.15] relative overflow-hidden group hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] transition-shadow duration-300">
            <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px"}} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⭐</span>
                <span className="text-sm font-bold text-white tracking-tight">{t.dashboard.premium_title}</span>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed mb-4">{t.dashboard.premium_desc}</p>
              <div className="flex items-center gap-3">
                <div className="bg-red-500 text-white px-5 py-2.5 rounded-[10px] text-[13px] font-semibold shadow-lg shadow-red-500/30 group-hover:scale-[1.02] transition-transform">{t.dashboard.premium_cta}</div>
                <span className="text-[11px] text-gray-500">{t.dashboard.premium_trial}</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Wokee */}
      <div className="px-5 mt-7">
        <WokeeWidget />
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0c]/85 backdrop-blur-xl border-t border-white/[0.06] px-2 py-2 pb-3 z-[100]">
        <div className="max-w-lg mx-auto flex justify-around items-center">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-[10px] transition-all duration-150 ${item.active ? "bg-red-500/[0.08]" : ""}`}>
              <span className={`text-xl transition-all duration-150 ${item.active ? "" : "grayscale opacity-50"}`}>{item.icon}</span>
              <span className={`text-[10px] tracking-wide transition-all duration-150 ${item.active ? "text-red-500 font-semibold" : "text-gray-600 font-medium"}`}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
EOF

# ============================================
# 8. Update Dashboard page (server → client bridge)
# ============================================
cat > app/dashboard/page.tsx << 'EOF'
import { supabase } from "../supabase";
import DashboardContent from "../components/DashboardContent";

export const dynamic = 'force-dynamic';

async function getAgencyCount() {
  const { count } = await supabase.from("agencies").select("*", { count: "exact", head: true });
  return count || 0;
}

async function getAgencyPreview() {
  const { data } = await supabase.from("agencies").select("name, city, canton, language_region").limit(5);
  return data || [];
}

export default async function Dashboard() {
  const agencyCount = await getAgencyCount();
  const agencies = await getAgencyPreview();
  return <DashboardContent agencyCount={agencyCount} agencies={agencies} />;
}
EOF

# ============================================
# 9. Update layout.tsx to include LanguageProvider
# ============================================
# Check current layout and add provider
if [ -f "app/layout.tsx" ]; then
  # Add import if not exists
  if ! grep -q "LanguageProvider" app/layout.tsx; then
    sed -i '' '1s|^|import { LanguageProvider } from "../lib/i18n/LanguageContext";\n|' app/layout.tsx
    # Wrap children with LanguageProvider
    sed -i '' 's|{children}|<LanguageProvider>{children}</LanguageProvider>|g' app/layout.tsx
    echo "✅ Layout updated with LanguageProvider"
  fi
fi

echo ""
echo "═══════════════════════════════════════════════"
echo "✅ i18n system complete! 10 languages ready!"
echo "═══════════════════════════════════════════════"
echo ""
echo "🌍 Languages: EN, CZ, PL, UA, RO, IT, PT, ES, GR, HU"
echo ""
echo "📁 Files created:"
echo "  • lib/i18n/types.ts"
echo "  • lib/i18n/LanguageContext.tsx"
echo "  • lib/i18n/translations/ (10 files)"
echo "  • app/components/LanguageSwitcher.tsx"
echo "  • app/components/DashboardContent.tsx"
echo "  • app/dashboard/page.tsx (updated)"
echo "  • app/layout.tsx (updated)"
echo ""
echo "🚀 Run:"
echo "  git add -A && git commit -m 'feat: add i18n with 10 languages' && git push"
echo ""
