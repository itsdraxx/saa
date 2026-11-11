"use client";

import { motion } from "motion/react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  accent?: boolean;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  eyebrow,
  accent = true,
  className,
}: SectionHeadingProps) {
  const { ref, isInView } = useInView({ threshold: 0.15 });

  return (
    <div
      ref={ref}
      className={cn("mx-auto max-w-3xl text-center", className)}
    >
      {/* Ornate Flourish & Eyebrow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
        className="mb-3 flex items-center justify-center gap-2 text-gold"
      >
        <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-gold" />
        <Sparkles className="h-3.5 w-3.5 text-gold" />
        {eyebrow && (
          <span className="font-body text-xs font-semibold tracking-widest text-burgundy uppercase">
            {eyebrow}
          </span>
        )}
        <Sparkles className="h-3.5 w-3.5 text-gold" />
        <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-gold" />
      </motion.div>

      {/* Main Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="font-heading text-3xl xs:text-4xl font-normal tracking-tight text-burgundy sm:text-5xl lg:text-6xl"
      >
        {title}
      </motion.h2>

      {/* Royal Divider Line with Diamond Knot */}
      {accent && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-3 sm:mt-4 flex items-center justify-center gap-2 text-gold"
        >
          <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-gold to-warm-beige" />
          <span className="text-[10px] text-gold font-serif">✦</span>
          <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-l from-transparent via-gold to-warm-beige" />
        </motion.div>
      )}

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="mt-3 sm:mt-4 font-body text-sm sm:text-base lg:text-lg leading-relaxed text-soft-brown px-2"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
