"use client";

import SectionHeading from "@/components/ui/SectionHeading";
import MemoryMap from "@/components/interactive/MemoryMap";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";

export default function MapPreview() {
  const { language } = useLanguage();
  const t = translations[language].map;

  return (
    <section id="map" className="w-full bg-ivory py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title={t.heading}
          subtitle={t.subtitle}
        />

        {/* The Snapchat-Style In-Map Interactive View */}
        <div className="mt-12">
          <MemoryMap />
        </div>
      </div>
    </section>
  );
}
