"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface GlassJarProps {
  isShaking: boolean;
  onTap: () => void;
}

export default function GlassJar({ isShaking, onTap }: GlassJarProps) {
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
    <div className="flex flex-col items-center">
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
        className="group relative h-80 w-56 cursor-pointer select-none"
      >
        {/* Cork Lid with vintage wood grain */}
        <div className="absolute top-0 left-1/2 z-20 h-7 w-32 -translate-x-1/2 rounded-t-lg border-b border-[#6E4226] bg-gradient-to-r from-[#8E5E36] via-[#B88755] to-[#8E5E36] shadow-md">
          <div className="mx-auto mt-1.5 h-1 w-20 rounded-full bg-[#5C3419]/50" />
        </div>

        {/* Jar Neck */}
        <div className="absolute top-6 left-1/2 z-10 h-6 w-36 -translate-x-1/2 rounded-sm border-x-2 border-warm-white/80 bg-warm-white/30 backdrop-blur-xs">
          {/* Gold & Twine Ribbon tied around the neck */}
          <div className="absolute top-1.5 inset-x-0 h-2 bg-gradient-to-r from-gold via-peach-300 to-gold shadow-xs" />
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-burgundy px-1.5 py-0.5 text-[9px] font-bold text-warm-white shadow-2xs">
            25
          </div>
        </div>

        {/* Glass Jar Body with 3D Depth */}
        <div className="absolute top-11 inset-x-0 bottom-0 overflow-hidden rounded-b-[54px] rounded-t-[24px] border-2 border-warm-white/90 bg-gradient-to-br from-warm-white/50 via-champagne/30 to-warm-white/35 shadow-[0_25px_60px_rgba(222,136,101,0.25)] backdrop-blur-md transition-all duration-500 group-hover:shadow-[0_30px_70px_rgba(196,87,67,0.35)] group-hover:border-gold">
          {/* Glass Highlight Reflections */}
          <div className="absolute top-4 left-3 bottom-10 w-3 rounded-full bg-gradient-to-b from-warm-white/80 via-warm-white/40 to-transparent" />
          <div className="absolute top-4 right-3 bottom-14 w-1.5 rounded-full bg-gradient-to-b from-warm-white/60 to-transparent" />

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
              className="pointer-events-none absolute h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_#FFD700]"
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
              className={`absolute h-8 w-14 rounded-xs border shadow-xs transition-transform duration-300 group-hover:scale-105 ${note.color}`}
            >
              <div className="mx-auto mt-1.5 h-0.5 w-8 bg-charcoal/15" />
              <div className="mx-auto mt-1 h-0.5 w-6 bg-charcoal/15" />
            </div>
          ))}

          {/* Sparkles on hover */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Sparkles className="h-10 w-10 text-gold animate-spin [animation-duration:8s]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
