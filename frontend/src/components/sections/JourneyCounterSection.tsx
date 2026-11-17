"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import LoveClock from "@/components/ui/LoveClock";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";

export default function JourneyCounterSection() {
  const { language, isTelugu } = useLanguage();
  const t = translations[language].counter;

  return (
    <section className="relative w-full bg-ivory py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-y border-warm-beige/60">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#F5E3C7_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      <div className="mx-auto max-w-6xl text-center">
        <SectionHeading
          eyebrow={isTelugu ? "23 నవంబర్ 2001 — ఇప్పటివరకు" : "23 November 2001 — Present"}
          title={t.heading}
          subtitle={t.subtitle}
        />

        <div className="mt-10 sm:mt-12 flex justify-center">
          <LoveClock weddingDate="2001-11-23T00:00:00" align="center" />
        </div>
      </div>
    </section>
  );
}

