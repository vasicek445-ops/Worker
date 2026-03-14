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
    community: string;
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
  home: {
    hero_headline: string;
    hero_sub: string;
    hero_cta: string;
    hero_cta2: string;
    hero_trial: string;
    stat_salary: string;
    stat_salary_label: string;
    stat_agencies: string;
    stat_agencies_label: string;
    stat_ai: string;
    stat_ai_label: string;
    stat_time: string;
    stat_time_label: string;
    interest_title: string;
    interest_agencies: string;
    interest_agencies_desc: string;
    interest_ai: string;
    interest_ai_desc: string;
    interest_guides: string;
    interest_guides_desc: string;
    interest_jobs: string;
    interest_jobs_desc: string;
    interest_housing: string;
    interest_housing_desc: string;
    interest_assistant: string;
    interest_assistant_desc: string;
    desire_title: string;
    desire_testimonial1: string;
    desire_testimonial1_author: string;
    desire_testimonial2: string;
    desire_testimonial2_author: string;
    desire_testimonial3: string;
    desire_testimonial3_author: string;
    desire_salary_title: string;
    desire_salary_desc: string;
    desire_compare: string;
    action_title: string;
    action_desc: string;
    action_cta: string;
    action_features: string;
    footer_copy: string;
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
