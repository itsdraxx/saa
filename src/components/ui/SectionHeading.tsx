"use client";

import { motion } from "motion/react";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  accent?: boolean;
  className?: string;
}

export default function SectionHeading({
  title,
  subtitle,
  accent = true,
  className,
}: SectionHeadingProps) {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={cn("mx-auto max-w-2xl text-center", className)}
    >
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="font-heading text-3xl font-semibold text-charcoal sm:text-4xl lg:text-5xl"
      >
        {title}
      </motion.h2>

      {accent && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-4 h-[2px] w-16 origin-center bg-gold"
        />
      )}

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-4 text-base leading-relaxed text-soft-brown sm:text-lg"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
