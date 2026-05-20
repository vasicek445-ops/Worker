"use client";
import { createContext, useContext, useState, ReactNode } from "react";
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

function detectLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const saved = document.cookie.match(/woker-lang=(\w+)/)?.[1] as Locale;
  if (saved && translations[saved]) return saved;
  const browserLang = navigator.language.split("-")[0] as Locale;
  if (translations[browserLang]) return browserLang;
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale);

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
