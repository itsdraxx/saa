"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "te";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isTelugu: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  isTelugu: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load saved language preference
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("saa_language") as Language | null;
        if (saved === "te" || saved === "en") {
          setLanguageState(saved);
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("saa_language", lang);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "te" : "en");
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isTelugu: language === "te",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
