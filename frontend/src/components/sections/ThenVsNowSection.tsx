"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import { thenVsNowPairs } from "@/data/then-vs-now";
import { Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations, thenVsNowTelugu } from "@/data/translations";

interface SideImageProps {
  src: string;
  alt: string;
  label: string;
  badgeBg: string;
}

function SideImage({ src, alt, label, badgeBg }: SideImageProps) {
  const [error, setError] = useState(false);

  return (
    <div className="relative aspect-4/5 sm:aspect-3/4 w-full overflow-hidden rounded-xl bg-champagne/40 border border-warm-beige/60">
      {!error ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 16vw"
          onError={() => setError(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-champagne/60 to-warm-beige/40">
          <Heart className="h-6 w-6 text-burgundy/40 mb-1" />
          <span className="text-[11px] font-semibold text-soft-brown">{label}</span>
        </div>
      )}
      <div
        className={`absolute bottom-2 left-2 rounded-md ${badgeBg} px-2 py-0.5 text-[10px] font-bold text-warm-white backdrop-blur-xs shadow-xs`}
      >
        {label}
      </div>
    </div>
  );
}

export default function ThenVsNowSection() {
  const { language, isTelugu } = useLanguage();
  const t = translations[language].thenNow;

  return (
    <section id="then-now" className="w-full bg-champagne/25 pt-10 pb-14 sm:pt-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title={t.heading}
          subtitle={t.subtitle}
        />

        {/* 3 in a Row Grid */}
        <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {thenVsNowPairs.map((pair, index) => {
            const pairTitle = (isTelugu && thenVsNowTelugu[pair.id]?.title)
              ? thenVsNowTelugu[pair.id].title
              : pair.title;

            return (
              <motion.div
                key={pair.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group overflow-hidden rounded-2xl sm:rounded-3xl border border-warm-beige bg-warm-white p-3 sm:p-3.5 shadow-xs transition-all duration-300 hover:border-gold/50 hover:shadow-md"
              >
                {/* Both Images Side by Side */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                  {/* Then Image (Left) */}
                  <SideImage
                    src={pair.thenImage}
                    alt={`${isTelugu ? "అప్పుడు" : "Then"} (${pair.thenYear})`}
                    label={`${t.thenBadge} ${pair.thenYear}`}
                    badgeBg="bg-charcoal/75"
                  />

                  {/* Now Image (Right) */}
                  <SideImage
                    src={pair.nowImage}
                    alt={`${isTelugu ? "ఇప్పుడు" : "Now"} (${pair.nowYear})`}
                    label={`${t.nowBadge} ${pair.nowYear}`}
                    badgeBg="bg-burgundy/85"
                  />
                </div>

                {/* Title Below Images (No extra text clutter) */}
                <div className="mt-2.5 sm:mt-3 text-center pb-0.5">
                  <h3 className="font-heading text-base sm:text-lg font-bold text-charcoal">
                    {pairTitle}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
