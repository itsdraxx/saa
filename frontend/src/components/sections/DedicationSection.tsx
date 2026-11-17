"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Heart, Sparkles, Mail } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import ConfettiCelebration from "@/components/ui/ConfettiCelebration";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";

export default function DedicationSection() {
  const [isUnsealed, setIsUnsealed] = useState(false);
  const { language, isTelugu } = useLanguage();
  const t = translations[language].dedication;

  return (
    <section id="dedication" className="relative w-full overflow-hidden bg-gradient-to-b from-champagne/40 via-peach-100/50 to-ivory py-32 px-4 text-center sm:px-6 lg:px-8">
      {/* Radiant Peach Ambient Orbs */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-50">
        <div className="h-[650px] w-[650px] rounded-full bg-peach-300/35 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-ivory to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Pulsing Heart Icon with Golden Halo */}
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-warm-beige bg-warm-white text-burgundy shadow-[0_10px_30px_rgba(196,87,67,0.25)]"
        >
          <Heart className="h-10 w-10 fill-burgundy text-burgundy" />
        </motion.div>

        {/* Milestone Counter Pill */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-warm-beige/80 bg-warm-white/95 px-6 py-2 shadow-sm backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-gold animate-pulse" />
          <span className="font-heading text-xl font-bold text-burgundy">
            <AnimatedCounter target={25} suffix={isTelugu ? " సంవత్సరాలు" : " Years"} />
          </span>
          <span className="text-soft-brown">•</span>
          <span className="text-xs font-semibold tracking-wider text-soft-brown uppercase">
            {t.milestonePill || "9,131 Days of Unconditional Love"}
          </span>
          <Sparkles className="h-4 w-4 text-gold animate-pulse" />
        </div>

        {/* Dedication Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-6 sm:mt-8 font-heading text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-burgundy"
        >
          {t.toCouple || "To Bujji & Satya"}
        </motion.h2>

        <p className="font-cursive mt-1.5 sm:mt-2 text-2xl sm:text-3xl md:text-4xl text-gold">
          {t.heartbeatOfFamily || "The heartbeat of our family"}
        </p>

        {/* Interactive Wax Sealed Letter Experience */}
        <div className="mt-8 sm:mt-14">
          {!isUnsealed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mx-auto max-w-lg cursor-pointer rounded-2xl sm:rounded-3xl border-2 border-warm-beige bg-warm-white/95 p-6 sm:p-8 shadow-xl backdrop-blur-md transition-all duration-300 hover:shadow-2xl"
              onClick={() => setIsUnsealed(true)}
            >
              <div className="flex flex-col items-center">
                <div className="mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-peach-100 text-burgundy">
                  <Mail className="h-6 w-6 sm:h-7 sm:w-7" />
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-semibold text-charcoal">
                  {t.sealedLetterTitle || "A Sealed Letter From Our Hearts"}
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs font-medium text-soft-brown">
                  {t.sealedLetterPrompt || "Click the royal wax seal below to unseal our family's tribute to you."}
                </p>

                {/* 3D Wax Seal Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsUnsealed(true);
                  }}
                  className="wax-seal mt-5 sm:mt-6 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full text-warm-white cursor-pointer"
                  title="Click to break seal"
                >
                  <span className="font-serif text-base sm:text-lg font-bold tracking-wider">XXV</span>
                </button>
                <span className="mt-2.5 sm:mt-3 text-[10px] sm:text-[11px] font-semibold tracking-widest text-burgundy uppercase">
                  {t.tapToUnseal || "Tap to Unseal Letter"}
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
              className="parchment-sheet relative mx-auto max-w-3xl rounded-2xl sm:rounded-3xl p-5 sm:p-10 md:p-14 text-center shadow-2xl"
            >
              {/* Top Seal Badge */}
              <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full wax-seal text-warm-white text-[11px] sm:text-xs font-bold shadow-lg">
                XXV
              </div>

              {/* Corner Ornaments */}
              <span className="absolute top-3 left-3 sm:top-4 sm:left-4 text-xs sm:text-sm text-gold font-serif">✦</span>
              <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-xs sm:text-sm text-gold font-serif">✦</span>
              <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-xs sm:text-sm text-gold font-serif">✦</span>
              <span className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-xs sm:text-sm text-gold font-serif">✦</span>

              <p className="font-heading text-lg sm:text-2xl md:text-3xl font-normal leading-relaxed text-charcoal sm:leading-loose">
                &ldquo;{t.letterP1}&rdquo;
              </p>

              <p className="mt-4 sm:mt-6 font-body text-xs sm:text-base md:text-lg leading-relaxed text-soft-brown">
                {t.letterP2}
              </p>

              {/* Signature Block */}
              <div className="mt-8 sm:mt-10 border-t border-warm-beige/80 pt-6 sm:pt-8">
                <p className="font-cursive text-2xl sm:text-4xl md:text-5xl text-burgundy">
                  {t.happyAnniversary || "Happy 25th Silver Anniversary, Bujji & Satya"}
                </p>
                <p className="mt-2 sm:mt-3 font-body text-[10px] sm:text-xs font-bold tracking-widest text-soft-brown uppercase">
                  {t.foreverAndAlways || "With all our love, forever and always,"}
                </p>
                <p className="font-heading mt-1 text-2xl sm:text-3xl font-bold text-charcoal">
                  {t.yourFamily || "Your Family ❤️"}
                </p>
                <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-xs text-soft-brown">
                  {t.taglineLetter || "Bujji Weds Satya • 25 Years of Love"}
                </p>
              </div>

              {/* Finale Celebration Button */}
              <div className="mt-8 sm:mt-10 flex justify-center">
                <ConfettiCelebration />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
