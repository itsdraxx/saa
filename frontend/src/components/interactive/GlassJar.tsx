"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface GlassJarProps {
  isShaking: boolean;
  onTap: () => void;
  className?: string;
}

export default function GlassJar({ isShaking, onTap, className = "" }: GlassJarProps) {
  // Pastel and golden origami notes folded inside the jar
  const notes = [
    { color: "bg-peach-200 border-peach-300", rotate: "-15deg", top: "62%", left: "26%" },
    { color: "bg-amber-100 border-amber-300", rotate: "22deg", top: "66%", left: "56%" },
    { color: "bg-rose-200 border-rose-300", rotate: "-35deg", top: "74%", left: "36%" },
    { color: "bg-peach-100 border-peach-300", rotate: "10deg", top: "52%", left: "42%" },
    { color: "bg-amber-50 border-amber-200", rotate: "-20deg", top: "80%", left: "52%" },
    { color: "bg-rose-100 border-rose-200", rotate: "30deg", top: "72%", left: "20%" },
    { color: "bg-orange-100 border-orange-200", rotate: "-8deg", top: "59%", left: "62%" },
  ];

  // Fireflies / Fairy lights inside the jar
  const fairyLights = [
    { top: "45%", left: "35%", delay: 0 },
    { top: "58%", left: "68%", delay: 0.8 },
    { top: "70%", left: "30%", delay: 1.4 },
    { top: "78%", left: "55%", delay: 0.4 },
    { top: "52%", left: "48%", delay: 1.8 },
  ];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.div
        animate={
          isShaking
            ? {
                rotate: [0, -7, 7, -5, 5, -2, 2, 0],
                scale: [1, 1.05, 0.97, 1.03, 1],
              }
            : {
                y: [0, -6, 0],
              }
        }
        transition={
          isShaking
            ? { duration: 0.6, ease: "easeInOut" }
            : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
        }
        onClick={onTap}
        className="group relative h-48 w-34 sm:h-60 sm:w-42 md:h-76 md:w-54 lg:h-80 lg:w-56 cursor-pointer select-none"
      >
        {/* Cork Lid with vintage wood grain */}
        <div className="absolute top-0 left-1/2 z-20 h-5 sm:h-6 md:h-7 w-20 sm:w-26 md:w-32 -translate-x-1/2 rounded-t-lg border-b border-[#6E4226] bg-gradient-to-r from-[#8E5E36] via-[#B88755] to-[#8E5E36] shadow-md">
          <div className="mx-auto mt-1 sm:mt-1.5 h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 rounded-full bg-[#5C3419]/50" />
        </div>

        {/* Jar Neck */}
        <div className="absolute top-4 sm:top-5 md:top-6 left-1/2 z-10 h-4.5 sm:h-5.5 md:h-6 w-24 sm:w-30 md:w-36 -translate-x-1/2 rounded-sm border-x-2 border-warm-white/80 bg-warm-white/30 backdrop-blur-xs">
          {/* Gold & Twine Ribbon tied around the neck */}
          <div className="absolute top-1 sm:top-1.5 inset-x-0 h-1.5 sm:h-2 bg-gradient-to-r from-gold via-peach-300 to-gold shadow-xs" />
          <div className="absolute -bottom-2 sm:-bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-burgundy px-1.5 py-0.2 sm:py-0.5 text-[8px] sm:text-[9px] font-bold text-warm-white shadow-2xs">
            25
          </div>
        </div>

        {/* Glass Jar Body with 3D Depth */}
        <div className="absolute top-8 sm:top-9 md:top-11 inset-x-0 bottom-0 overflow-hidden rounded-b-[36px] sm:rounded-b-[46px] md:rounded-b-[54px] rounded-t-[16px] sm:rounded-t-[20px] md:rounded-t-[24px] border-2 border-warm-white/90 bg-gradient-to-br from-warm-white/50 via-champagne/30 to-warm-white/35 shadow-[0_20px_50px_rgba(222,136,101,0.22)] backdrop-blur-md transition-all duration-500 group-hover:shadow-[0_30px_70px_rgba(196,87,67,0.35)] group-hover:border-gold">
          {/* Glass Highlight Reflections */}
          <div className="absolute top-3 sm:top-4 left-2.5 sm:left-3 bottom-8 sm:bottom-10 w-2 sm:w-3 rounded-full bg-gradient-to-b from-warm-white/80 via-warm-white/40 to-transparent" />
          <div className="absolute top-3 sm:top-4 right-2.5 sm:right-3 bottom-10 sm:bottom-14 w-1 sm:w-1.5 rounded-full bg-gradient-to-b from-warm-white/60 to-transparent" />

          {/* Glowing Fairy Lights / Fireflies */}
          {fairyLights.map((light, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1.4, 0.8],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: light.delay,
                ease: "easeInOut",
              }}
              style={{ top: light.top, left: light.left }}
              className="pointer-events-none absolute h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-amber-300 shadow-[0_0_12px_#FFD700]"
            />
          ))}

          {/* Folded Paper Notes Inside */}
          {notes.map((note, index) => (
            <div
              key={index}
              style={{
                top: note.top,
                left: note.left,
                transform: `rotate(${note.rotate})`,
              }}
              className={`absolute h-5 w-9 sm:h-6 sm:w-11 md:h-8 md:w-14 rounded-xs border shadow-xs transition-transform duration-300 group-hover:scale-105 ${note.color}`}
            >
              <div className="mx-auto mt-1 sm:mt-1.5 h-0.5 w-5 sm:w-8 bg-charcoal/15" />
              <div className="mx-auto mt-0.5 sm:mt-1 h-0.5 w-4 sm:w-6 bg-charcoal/15" />
            </div>
          ))}

          {/* Sparkles on hover */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Sparkles className="h-7 w-7 sm:h-10 sm:w-10 text-gold animate-spin [animation-duration:8s]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
