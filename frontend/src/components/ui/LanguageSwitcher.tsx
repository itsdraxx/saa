"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "floating" | "navbar";
}

export default function LanguageSwitcher({ variant = "floating" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === "navbar") {
    return (
      <div className="inline-flex items-center rounded-full border border-warm-beige bg-warm-white/90 p-0.5 shadow-2xs backdrop-blur-md">
        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
            language === "en"
              ? "bg-burgundy text-warm-white shadow-xs"
              : "text-soft-brown hover:text-burgundy"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage("te")}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
            language === "te"
              ? "bg-burgundy text-warm-white shadow-xs"
              : "text-soft-brown hover:text-burgundy"
          }`}
        >
          తెలుగు
        </button>
      </div>
    );
  }

  // Ultra-compact, unobtrusive floating toggle (bottom-right)
  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-30 pointer-events-auto">
      <button
        type="button"
        onClick={() => setLanguage(language === "en" ? "te" : "en")}
        aria-label={language === "en" ? "Switch language to Telugu" : "Switch language to English"}
        title={language === "en" ? "Switch to Telugu (తెలుగు)" : "Switch to English"}
        className="group flex h-9 items-center gap-1.5 rounded-full border border-gold/70 bg-warm-white/90 px-3 text-xs font-bold text-burgundy shadow-lg backdrop-blur-md transition-all duration-200 hover:border-burgundy hover:bg-warm-white hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-gold/20"
      >
        <Globe className="h-3.5 w-3.5 text-gold group-hover:rotate-45 transition-transform duration-300 shrink-0" />
        <span className="font-heading text-xs font-bold tracking-wide">
          {language === "en" ? "తెలుగు" : "EN"}
        </span>
      </button>
    </div>
  );
}
