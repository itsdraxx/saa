"use client";

import { Heart, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language].footer;

  return (
    <footer className="border-t border-warm-beige/50 bg-champagne/40">
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h3 className="font-heading text-3xl font-semibold text-charcoal sm:text-4xl">
          {t.title || "Bujji Weds Satya"}
        </h3>

        <p className="mt-2 font-heading text-xl italic tracking-wide text-burgundy">
          {t.subtitle || "25 Years of Love ❤️"}
        </p>
        <p className="mt-1 text-xs font-semibold tracking-widest text-soft-brown uppercase">
          {t.jubilee || "23 November 2001 • Silver Jubilee"}
        </p>

        <div className="mt-6 flex justify-center">
          <Heart
            className="h-5 w-5 text-burgundy"
            fill="currentColor"
          />
        </div>

        <p className="mt-4 text-xs font-medium text-soft-brown/75">
          {t.craftedWith || "Made with all our love by your family"}
        </p>

        <div className="mt-6">
          <a
            href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3002"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-soft-brown/50 hover:text-burgundy transition-colors"
          >
            <Shield className="h-3 w-3" />
            <span>{t.adminPortal || "Admin Portal"}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
