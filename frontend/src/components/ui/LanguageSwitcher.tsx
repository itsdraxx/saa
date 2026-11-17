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

  // Floating pill (bottom right)
  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        type="button"
        onClick={() => setLanguage(language === "en" ? "te" : "en")}
        aria-label="Toggle language between English and Telugu"
        className="group flex items-center gap-2 rounded-full border-2 border-gold/60 bg-warm-white/95 px-4 py-2.5 text-xs font-bold text-burgundy shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-burgundy hover:bg-warm-white hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-gold/20"
      >
        <Globe className="h-4 w-4 text-gold group-hover:rotate-45 transition-transform duration-300" />
        <span className="font-heading text-sm">
          {language === "en" ? "తెలుగులోకి మార్చండి" : "Switch to English"}
        </span>
        <span className="rounded-full bg-champagne/80 px-2 py-0.5 text-[10px] uppercase font-bold text-soft-brown">
          {language === "en" ? "తెలుగు" : "EN"}
        </span>
      </button>
    </div>
  );
}
