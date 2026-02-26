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
    premium_cta: "Activate for €9.99/month", premium_trial: "No commitment",
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
