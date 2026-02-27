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
  paywall: {
    title: string;
    description: string;
    cta: string;
    disclaimer: string;
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
