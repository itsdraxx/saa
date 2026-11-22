"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import PetalShower from "@/components/ui/PetalShower";
import AppleHeart from "@/components/ui/AppleHeart";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";

export default function HeroSection() {
  const { language, isTelugu } = useLanguage();
  const t = translations[language].hero;

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col items-center justify-between overflow-hidden px-3 pt-16 pb-2 xs:pt-20 sm:px-6 sm:pt-20 sm:pb-3">
      {/* 1. Real South Indian Golden Mandap Setting Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src="/images/art/golden_mandap_bg.png"
          alt="Golden South Indian Mandap Setting"
          fill
          priority
          quality={95}
          className="object-cover object-bottom sm:object-center"
          sizes="100vw"
        />
        {/* Soft warm radial spotlight to keep text pristine & readable */}
        <div className="absolute inset-0 bg-radial-[ellipse_80%_60%_at_50%_35%] from-amber-50/25 via-transparent to-amber-950/20 pointer-events-none" />
      </div>

      {/* 2. Soft Floating Pink & Jasmine Petals Shower */}
      <PetalShower />

      {/* =========================================================
          HERO STAGE: Royal Wedding Invitation & Welcoming Couple
          Harmoniously grouped so the card is brought gracefully down
          and the welcoming couple rests naturally with a balanced gap
          ========================================================= */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center sm:justify-end w-full max-w-2xl px-2 pt-6 xs:pt-8 sm:pt-4 pb-1">
        
        {/* Top Invitation Typography ("That Card") */}
        <div className="flex flex-col items-center text-center px-2 sm:px-4 max-w-xl w-full">
          {/* Eyebrow Badge */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-100/95 via-rose-50/95 to-amber-100/95 border border-[#C68A2C]/60 shadow-2xs mb-2 xs:mb-2.5"
          >
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.18em] text-[#8B1E28] uppercase drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
              {isTelugu ? "25 సంవత్సరాల అనుబంధ వేడుక" : "Celebrating 25 Years of Togetherness"}
            </span>
          </motion.div>

          {/* Grand Centered Wedding Names */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-heading font-extrabold text-[#6D121B] text-center"
          >
            {/* Groom Name */}
            <div className="text-[2.5rem] xs:text-[2.85rem] sm:text-5xl lg:text-6xl tracking-tight leading-none drop-shadow-[0_2px_12px_rgba(255,255,255,0.95)]">
              {isTelugu ? "ఆదినారాయణ" : "Adhinarayana"}
            </div>

            {/* weds Connector with Ornate Gold Ribbon Flourish */}
            <div className="flex items-center justify-center gap-2.5 my-1 xs:my-1.5 sm:my-2.5">
              <span className="h-[1px] w-10 xs:w-14 sm:w-20 bg-gradient-to-r from-transparent to-[#C68A2C]" />
              <span className="font-serif italic text-xs xs:text-sm sm:text-lg text-[#C68A2C] font-bold tracking-widest uppercase drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                {isTelugu ? "వెడ్స్" : "weds"}
              </span>
              <span className="h-[1px] w-10 xs:w-14 sm:w-20 bg-gradient-to-l from-transparent to-[#C68A2C]" />
            </div>

            {/* Bride Name */}
            <div className="text-[2.5rem] xs:text-[2.85rem] sm:text-5xl lg:text-6xl tracking-tight leading-none drop-shadow-[0_2px_12px_rgba(255,255,255,0.95)]">
              {isTelugu ? "సత్యవతి" : "Satyavathi"}
            </div>
          </motion.h1>

          {/* Decorative Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="my-1.5 xs:my-2 flex items-center justify-center gap-2 text-[#C68A2C]"
          >
            <span className="h-[1px] w-8 xs:w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#C68A2C]" />
            <span className="text-xs font-serif">❦</span>
            <span className="h-[1px] w-8 xs:w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#C68A2C]" />
          </motion.div>

          {/* Subtitle: 25 Years of Love ❤️ */}
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-heading text-lg xs:text-xl sm:text-2xl md:text-3xl italic text-[#8B1E28] font-medium whitespace-nowrap drop-shadow-[0_1px_6px_rgba(255,255,255,0.85)] flex items-center justify-center gap-1.5"
          >
            <span>{isTelugu ? "25 సంవత్సరాల ప్రేమ" : "25 Years of Love"}</span>
            <AppleHeart size="1.05em" className="inline-block shrink-0 -translate-y-[1px]" />
          </motion.h2>
        </div>

        {/* Centerpiece: Adhi & Satya Sitting and Welcoming */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-20 flex flex-col items-center justify-end w-full px-2 mt-3 xs:mt-4 sm:mt-5"
        >
          <div className="relative flex justify-center items-end">
            {/* Subtle contact shadow under the seated couple to anchor them to the stage carpet */}
            <div className="absolute -bottom-1.5 w-[85%] h-4 bg-black/45 blur-md rounded-full pointer-events-none" />

            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-20 flex justify-center items-end"
            >
              <Image
                src="/images/art/couple_sittinga_and_welcoming.png"
                alt="Adhi Weds Satya — 25 Years of Love"
                width={1536}
                height={1024}
                priority
                className="w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[450px] md:max-w-[530px] lg:max-w-[590px] xl:max-w-[620px] max-h-[38svh] xs:max-h-[42svh] sm:max-h-[46svh] md:max-h-[50svh] h-auto object-contain drop-shadow-[0_12px_24px_rgba(70,10,15,0.35)]"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* =========================================================
          BOTTOM: Subtle Scroll Indicator
          ========================================================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="relative z-20 flex flex-col items-center gap-0.5 text-white/95 pb-1 cursor-pointer"
        onClick={() => {
          const el = document.getElementById("story");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {isTelugu ? "మన కథను చూడండి" : "Explore Our Story"}
        </span>
        <motion.div
          animate={{ y: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}

