"use client";

import { motion } from "motion/react";
import { Heart, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[95vh] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-ivory via-peach-50/60 to-ivory px-4 py-20 text-center sm:px-6 lg:px-8">
      {/* Decorative Peach Glowing Orbs */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-60">
        <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-peach-300/30 via-champagne/70 to-peach-100/40 blur-3xl sm:h-[750px] sm:w-[750px]" />
      </div>
      <div className="pointer-events-none absolute top-10 right-10 h-72 w-72 rounded-full bg-peach-200/40 blur-2xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-72 w-72 rounded-full bg-champagne/60 blur-2xl" />

      {/* Floating Sparkles & Hearts */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0.35, 0.8, 0.35],
            y: [-10, 10, -10],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
          style={{
            top: `${15 + (i * 14)}%`,
            left: `${10 + (i * 15)}%`,
          }}
          className="pointer-events-none absolute hidden text-gold sm:block"
        >
          {i % 2 === 0 ? (
            <Sparkles className="h-5 w-5" />
          ) : (
            <Heart className="h-4 w-4 fill-gold/40 text-gold" />
          )}
        </motion.div>
      ))}

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Subtle Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white/90 px-4 py-1.5 shadow-xs backdrop-blur-xs"
        >
          <Sparkles className="h-4 w-4 text-gold" />
          <span className="font-body text-xs font-semibold tracking-widest text-burgundy uppercase">
            Silver Jubilee • 25 Years of Togetherness
          </span>
          <Sparkles className="h-4 w-4 text-gold" />
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="font-heading text-5xl font-normal tracking-tight text-burgundy sm:text-7xl md:text-8xl"
        >
          25 Years of Us
        </motion.h1>

        {/* Year Range */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-3 flex items-center justify-center gap-3 text-gold"
        >
          <div className="h-[1px] w-14 bg-gold/50" />
          <span className="font-heading text-xl tracking-widest font-medium sm:text-2xl">
            1999 — 2024
          </span>
          <div className="h-[1px] w-14 bg-gold/50" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-6 max-w-2xl font-body text-base text-soft-brown sm:text-lg md:text-xl"
        >
          Celebrating a quarter-century of unwavering love, shared laughter, cherished memories, and the beautiful family you built together.
        </motion.p>

        {/* Photo Frame Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mx-auto mt-10 max-w-md sm:max-w-lg"
        >
          <div className="group relative rounded-3xl border-8 border-warm-white bg-gradient-to-br from-champagne via-peach-100 to-champagne p-2 shadow-xl transition-transform duration-500 hover:scale-[1.01]">
            <div className="relative flex aspect-4/3 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-warm-beige bg-gradient-to-b from-warm-white via-peach-50 to-champagne/40 p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warm-white text-gold shadow-md">
                <Heart className="h-8 w-8 fill-peach-300 text-burgundy" />
              </div>
              <h3 className="font-heading text-2xl font-semibold text-charcoal sm:text-3xl">
                Mom & Dad
              </h3>
              <p className="mt-2 text-xs font-medium tracking-wider text-soft-brown uppercase">
                Add your favorite anniversary portrait here
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white/90 px-3.5 py-1 text-xs text-burgundy shadow-2xs">
                <span>Silver Anniversary</span>
                <span>•</span>
                <span>November 1999 — 2024</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="#story"
            className="rounded-full bg-burgundy px-7 py-3 text-sm font-medium text-warm-white shadow-md transition-all duration-300 hover:bg-deep-burgundy hover:shadow-lg active:scale-95"
          >
            Explore Our Story
          </Link>
          <Link
            href="#glass-jar"
            className="rounded-full border border-warm-beige bg-warm-white px-7 py-3 text-sm font-medium text-burgundy shadow-xs transition-all duration-300 hover:bg-champagne active:scale-95"
          >
            Open The Glass Jar
          </Link>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-6 flex flex-col items-center gap-1 text-soft-brown/70"
      >
        <span className="text-xs tracking-widest uppercase">Scroll Down</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
