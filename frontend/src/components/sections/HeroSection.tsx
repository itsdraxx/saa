"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import PetalShower from "@/components/ui/PetalShower";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[100svh] w-full flex-col items-center justify-between overflow-hidden px-3 pt-20 pb-2 sm:px-6 sm:pt-24 sm:pb-3">
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
        <div className="absolute inset-0 bg-radial-[ellipse_80%_60%_at_50%_35%] from-amber-50/20 via-transparent to-amber-950/25 pointer-events-none" />
      </div>

      {/* 2. Soft Floating Pink & Jasmine Petals Shower */}
      <PetalShower />

      {/* =========================================================
          TOP CENTER: Wedding Card Invitation Typography
          Positioned elegantly in the upper warm golden mandap wall
          ========================================================= */}
      <div className="relative z-20 flex flex-col items-center text-center mt-2 sm:mt-4 px-4 max-w-2xl">
        {/* Invitation Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-heading text-[11px] sm:text-xs md:text-sm font-semibold tracking-[0.25em] text-[#8B1E28] uppercase drop-shadow-[0_1px_2px_rgba(255,255,255,0.85)]"
        >
          Celebrating 25 Years of Togetherness
        </motion.p>

        {/* Decorative Top Flourish Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="my-1 sm:my-1.5 flex items-center justify-center gap-2 text-[#C68A2C]"
        >
          <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#C68A2C]" />
          <span className="text-xs font-serif">❦</span>
          <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#C68A2C]" />
        </motion.div>

        {/* Grand Centered Title: Bujji Weds Satya */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-heading text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#6D121B] leading-tight drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)]"
        >
          Bujji Weds Satya
        </motion.h1>

        {/* Decorative Bottom Flourish Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="my-1 sm:my-1.5 flex items-center justify-center gap-2 text-[#C68A2C]"
        >
          <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#C68A2C]" />
          <span className="text-xs font-serif">❦</span>
          <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#C68A2C]" />
        </motion.div>

        {/* Centered Subtitle: 25 Years of Love ❤️ */}
        <motion.h2
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="font-heading text-xl xs:text-2xl sm:text-3xl md:text-4xl italic text-[#8B1E28] font-medium drop-shadow-[0_1px_6px_rgba(255,255,255,0.7)]"
        >
          25 Years of Love <span className="inline-block text-red-600 not-italic">❤️</span>
        </motion.h2>
      </div>

      {/* =========================================================
          CENTERPIECE: Bujji & Satya Sitting on the Mandap Carpet
          Properly scaled so their FULL sitting pose fits naturally
          ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="relative z-20 flex flex-col items-center justify-end w-full my-auto px-2"
      >
        <div className="relative flex justify-center items-end">
          {/* Subtle contact shadow under the seated couple to anchor them to the stage carpet */}
          <div className="absolute -bottom-2 w-[75%] h-5 bg-black/35 blur-md rounded-full pointer-events-none" />

          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-20 flex justify-center items-end"
          >
            <Image
              src="/images/art/couple_sittinga_and_welcoming.png"
              alt="Bujji Weds Satya — 25 Years of Love"
              width={1536}
              height={1024}
              priority
              className="w-full max-w-[310px] xs:max-w-[350px] sm:max-w-[440px] md:max-w-[520px] lg:max-w-[580px] xl:max-w-[620px] max-h-[35svh] sm:max-h-[42svh] md:max-h-[46svh] lg:max-h-[50svh] h-auto object-contain drop-shadow-[0_12px_24px_rgba(70,10,15,0.3)]"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* =========================================================
          BOTTOM: Subtle Scroll Indicator
          ========================================================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.7 }}
        className="relative z-20 flex flex-col items-center gap-0.5 text-white/90 mb-1 cursor-pointer"
        onClick={() => {
          const el = document.getElementById("story");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
          Explore Our Story
        </span>
        <motion.div
          animate={{ y: [0, 3, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="h-3.5 w-3.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
        </motion.div>
      </motion.div>
    </section>
  );
}
