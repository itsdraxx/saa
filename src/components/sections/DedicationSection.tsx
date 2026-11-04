"use client";

import { motion } from "motion/react";
import { Heart, Sparkles } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

export default function DedicationSection() {
  return (
    <section id="dedication" className="relative w-full overflow-hidden bg-gradient-to-b from-champagne/40 via-peach-100/60 to-ivory py-32 px-4 text-center sm:px-6 lg:px-8">
      {/* Subtle Peach Glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40">
        <div className="h-[600px] w-[600px] rounded-full bg-peach-300/40 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        {/* Pulsing Heart Icon */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-warm-beige bg-warm-white text-burgundy shadow-lg"
        >
          <Heart className="h-10 w-10 fill-burgundy text-burgundy" />
        </motion.div>

        {/* Milestone Counter Pill */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-warm-beige bg-warm-white/95 px-6 py-2 shadow-sm backdrop-blur-xs">
          <Sparkles className="h-4 w-4 text-gold" />
          <span className="font-heading text-xl font-bold text-burgundy">
            <AnimatedCounter target={25} suffix=" Years" />
          </span>
          <span className="text-soft-brown">•</span>
          <span className="text-xs font-semibold tracking-wider text-soft-brown uppercase">
            9,131 Days of Love
          </span>
          <Sparkles className="h-4 w-4 text-gold" />
        </div>

        {/* Dedication Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 font-heading text-4xl font-semibold tracking-tight text-burgundy sm:text-6xl"
        >
          To Mom & Dad
        </motion.h2>

        <div className="mx-auto mt-4 h-[2px] w-20 bg-gold" />

        {/* Heartfelt Dedication Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 font-heading text-xl font-normal leading-relaxed text-charcoal/90 sm:text-2xl sm:leading-loose"
        >
          Twenty-five years ago, you chose each other. Every day since, through quiet mornings, bustling evenings, shared struggles, and endless celebrations, you continued to choose love, patience, and togetherness.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6 font-body text-base leading-relaxed text-soft-brown sm:text-lg"
        >
          This website is our family&apos;s small tribute to the extraordinary life you have built hand-in-hand. Thank you for giving us a home filled with warmth, laughter, and an unshakable foundation. You have shown us what true love looks like.
        </motion.p>

        {/* Signature */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 rounded-3xl border border-warm-beige bg-gradient-to-br from-warm-white via-peach-50/60 to-warm-white p-8 shadow-md backdrop-blur-xs"
        >
          <p className="font-heading text-3xl italic font-medium text-gold sm:text-4xl">
            Happy 25th Silver Anniversary
          </p>
          <p className="mt-3 font-body text-xs font-semibold tracking-widest text-soft-brown uppercase">
            With all our love, forever and always,
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-burgundy">
            Your Family ❤️
          </p>
          <p className="mt-2 text-xs text-soft-brown/70">
            1999 — 2024 • A Silver Jubilee Celebration
          </p>
        </motion.div>
      </div>
    </section>
  );
}
