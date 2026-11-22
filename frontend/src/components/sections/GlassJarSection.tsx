"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassJar from "@/components/interactive/GlassJar";
import { glassJarMessages } from "@/data/glass-jar-messages";
import { Heart, Sparkles, Wand2 } from "lucide-react";
import type { GlassJarMessage } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { translations, glassJarNotesTelugu } from "@/data/translations";

export default function GlassJarSection() {
  const [isShaking, setIsShaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<GlassJarMessage | null>(null);
  const [revealedIds, setRevealedIds] = useState<number[]>([]);
  const noteRef = useRef<HTMLDivElement>(null);
  const { language, isTelugu } = useLanguage();
  const t = translations[language].glassJar;

  const handleTap = () => {
    if (isShaking) return;
    setIsShaking(true);

    setTimeout(() => {
      // Pick a random unrevealed message, or random overall if all seen
      const unrevealed = glassJarMessages.filter(
        (m) => !revealedIds.includes(m.id)
      );
      const pool = unrevealed.length > 0 ? unrevealed : glassJarMessages;
      const selected = pool[Math.floor(Math.random() * pool.length)];

      setCurrentMessage(selected);
      setRevealedIds((prev) =>
        prev.includes(selected.id) ? prev : [...prev, selected.id]
      );
      setIsShaking(false);

      // On mobile, smoothly ensure the note is in view
      if (typeof window !== "undefined" && window.innerWidth < 768 && noteRef.current) {
        setTimeout(() => {
          noteRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 100);
      }
    }, 600);
  };

  return (
    <section id="glass-jar" className="relative w-full bg-gradient-to-b from-ivory via-peach-50/40 to-ivory pt-8 pb-10 sm:pt-12 sm:pb-14 px-3 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#F5D0C0_1px,transparent_1px)] [background-size:28px_28px] opacity-50" />

      <div className="mx-auto max-w-6xl text-center">
        <SectionHeading
          eyebrow={t.eyebrow || "Interactive Keepsake"}
          title={t.heading}
          subtitle={t.subtitle}
        />

        {/* Progress Counter Pill */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white/95 px-4 py-1 sm:px-5 sm:py-1.5 text-xs text-soft-brown shadow-xs backdrop-blur-xs">
          <Heart className="h-3.5 w-3.5 fill-burgundy text-burgundy" />
          <span>
            <strong className="text-burgundy font-semibold">{revealedIds.length}</strong> {isTelugu ? "నుండి" : "of"}{" "}
            <strong>{glassJarMessages.length}</strong> {t.memoriesOpened || "memories opened"}
          </span>
          <span className="text-warm-beige">•</span>
          <span className="text-gold font-medium">{t.keepTapping || "Keep tapping for more!"}</span>
        </div>

        {/* 2-Column Layout on Desktop (Jar Left, Note Right) & Compact Stack on Mobile */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 md:gap-8 lg:gap-10 items-center">
          {/* LEFT: Glowing Glass Jar + Trigger Button */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <GlassJar isShaking={isShaking} onTap={handleTap} />

            <p className="mt-2.5 sm:mt-3 text-[11px] sm:text-xs font-semibold tracking-wider text-soft-brown uppercase">
              {t.clickJar || "Click or tap the jar to unfold a note"}
            </p>

            <button
              type="button"
              onClick={handleTap}
              disabled={isShaking}
              className="group mt-2.5 sm:mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-burgundy via-deep-burgundy to-burgundy px-5 sm:px-7 py-2 sm:py-3 text-[11px] sm:text-xs font-semibold tracking-wider text-warm-white uppercase shadow-[0_6px_18px_rgba(158,61,44,0.28)] transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_24px_rgba(158,61,44,0.4)] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Wand2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold transition-transform group-hover:rotate-45" />
              <span>{currentMessage ? (t.unfoldAnother || "Unfold Another Note") : (t.shakeAndOpen || "Shake & Open Note")}</span>
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-peach-200" />
            </button>
          </div>

          {/* RIGHT: Unfolded Origami Note Card */}
          <div ref={noteRef} className="md:col-span-7 flex flex-col items-center justify-center w-full">
            <div className="w-full max-w-xl min-h-[140px] sm:min-h-[190px] md:min-h-[220px]">
              <AnimatePresence mode="wait">
                {currentMessage ? (
                  <motion.div
                    key={currentMessage.id}
                    initial={{ opacity: 0, scale: 0.9, y: 18, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -15 }}
                    transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                    className="parchment-sheet relative rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-9 shadow-xl text-center"
                  >
                    {/* Vintage Wax Seal at Top */}
                    <div className="absolute -top-3.5 sm:-top-4.5 left-1/2 -translate-x-1/2 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full wax-seal text-warm-white text-[10px] sm:text-xs font-bold shadow-md">
                      {currentMessage.id}
                    </div>

                    {/* Corner Accents */}
                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 text-xs text-gold/60 font-serif">✦</span>
                    <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-xs text-gold/60 font-serif">✦</span>
                    <span className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 text-xs text-gold/60 font-serif">✦</span>
                    <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 text-xs text-gold/60 font-serif">✦</span>

                    <div className="my-1 sm:my-2">
                      <Heart className="mx-auto h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 fill-burgundy/20 text-burgundy" />
                    </div>

                    {/* Note message */}
                    <p className="font-heading text-sm sm:text-xl md:text-2xl font-normal leading-relaxed text-charcoal">
                      &ldquo;
                      {(isTelugu && glassJarNotesTelugu[currentMessage.id]?.message)
                        ? glassJarNotesTelugu[currentMessage.id].message
                        : currentMessage.message}
                      &rdquo;
                    </p>

                    {currentMessage.author && (
                      <p className="font-cursive mt-2 sm:mt-3 text-base sm:text-xl md:text-2xl font-normal text-burgundy">
                        —{" "}
                        {isTelugu
                          ? `ప్రేమతో, ${glassJarNotesTelugu[currentMessage.id]?.author || "ఆది & సత్య"}`
                          : `With love, ${currentMessage.author}`}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex h-28 sm:h-36 md:h-52 flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-dashed border-warm-beige bg-champagne/20 p-4 sm:p-6 text-center text-xs sm:text-sm text-soft-brown backdrop-blur-xs">
                    <Sparkles className="mb-1.5 sm:mb-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gold" />
                    <span className="font-medium text-xs sm:text-sm">
                      {t.emptyJarPrompt || "Tap the glowing glass jar to release a secret 25-year memory!"}
                    </span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
