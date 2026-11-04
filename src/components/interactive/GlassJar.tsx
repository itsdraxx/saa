"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

interface GlassJarProps {
  isShaking: boolean;
  onTap: () => void;
}

export default function GlassJar({ isShaking, onTap }: GlassJarProps) {
  // Array of pastel colored folded origami note styles inside the jar
  const notes = [
    { color: "bg-rose-200 border-rose-300", rotate: "-15deg", top: "60%", left: "28%" },
    { color: "bg-amber-100 border-amber-300", rotate: "22deg", top: "65%", left: "55%" },
    { color: "bg-amber-200 border-amber-300", rotate: "-35deg", top: "72%", left: "38%" },
    { color: "bg-pink-100 border-pink-300", rotate: "10deg", top: "50%", left: "42%" },
    { color: "bg-amber-50 border-amber-200", rotate: "-20deg", top: "78%", left: "50%" },
    { color: "bg-rose-100 border-rose-200", rotate: "30deg", top: "70%", left: "20%" },
    { color: "bg-orange-100 border-orange-200", rotate: "-8deg", top: "58%", left: "60%" },
  ];

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={
          isShaking
            ? {
                rotate: [0, -6, 6, -4, 4, -2, 2, 0],
                scale: [1, 1.03, 0.98, 1.02, 1],
              }
            : {
                y: [0, -4, 0],
              }
        }
        transition={
          isShaking
            ? { duration: 0.6, ease: "easeInOut" }
            : { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }
        onClick={onTap}
        className="group relative h-72 w-52 cursor-pointer select-none"
      >
        {/* Cork Lid */}
        <div className="absolute top-0 left-1/2 z-20 h-6 w-28 -translate-x-1/2 rounded-t-md border-b border-[#7A583A] bg-gradient-to-r from-[#A77D54] via-[#D3A97C] to-[#A77D54] shadow-sm">
          <div className="mx-auto mt-1 h-1 w-16 rounded-full bg-[#8E633B]/40" />
        </div>

        {/* Jar Neck */}
        <div className="absolute top-5 left-1/2 z-10 h-5 w-32 -translate-x-1/2 rounded-sm border-x-2 border-warm-white/70 bg-warm-white/20 backdrop-blur-xs">
          {/* Gold Ribbon tied around the neck */}
          <div className="absolute top-1 inset-x-0 h-2 bg-gradient-to-r from-gold/70 via-amber-300 to-gold/70 shadow-xs" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-burgundy font-bold">
            ❤️
          </div>
        </div>

        {/* Glass Jar Body */}
        <div className="absolute top-9 inset-x-0 bottom-0 overflow-hidden rounded-b-[48px] rounded-t-[20px] border-2 border-warm-white/80 bg-gradient-to-br from-warm-white/40 via-champagne/20 to-warm-white/30 shadow-[0_20px_50px_rgba(201,169,110,0.2)] backdrop-blur-md transition-shadow duration-300 group-hover:shadow-[0_25px_60px_rgba(114,47,55,0.25)]">
          {/* Glass Highlight Reflections */}
          <div className="absolute top-4 left-3 bottom-8 w-3 rounded-full bg-gradient-to-b from-warm-white/70 via-warm-white/30 to-transparent" />
          <div className="absolute top-4 right-3 bottom-12 w-1.5 rounded-full bg-gradient-to-b from-warm-white/50 to-transparent" />

          {/* Folded Paper Notes Inside */}
          {notes.map((note, index) => (
            <div
              key={index}
              style={{
                top: note.top,
                left: note.left,
                transform: `rotate(${note.rotate})`,
              }}
              className={`absolute h-7 w-12 rounded-xs border shadow-xs transition-transform duration-300 group-hover:scale-105 ${note.color}`}
            >
              <div className="mx-auto mt-1 h-0.5 w-6 bg-charcoal/10" />
              <div className="mx-auto mt-1 h-0.5 w-4 bg-charcoal/10" />
            </div>
          ))}

          {/* Sparkles on hover */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Sparkles className="h-8 w-8 text-gold animate-pulse" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

