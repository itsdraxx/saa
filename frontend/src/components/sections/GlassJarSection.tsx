"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassJar from "@/components/interactive/GlassJar";
import { glassJarMessages } from "@/data/glass-jar-messages";
import { Heart, Sparkles, Wand2 } from "lucide-react";
import type { GlassJarMessage } from "@/lib/types";

export default function GlassJarSection() {
  const [isShaking, setIsShaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<GlassJarMessage | null>(null);
  const [revealedIds, setRevealedIds] = useState<number[]>([]);

  const handleTap = () => {
    if (isShaking) return;
    setIsShaking(true);

    setTimeout(() => {
      // Pick a random unrevealed message, or random overall if all seen
      const unrevealed = glassJarMessages.filter(
        (m) => !revealedIds.includes(m.id)
      );
      const pool = unrevealed.length > 0 ? unrevealed : glassJarMessages;
      const selected = pool[Math.floor(Math.random() * pool.length)];

      setCurrentMessage(selected);
      setRevealedIds((prev) =>
        prev.includes(selected.id) ? prev : [...prev, selected.id]
      );
      setIsShaking(false);
    }, 600);
  };

  return (
    <section id="glass-jar" className="relative w-full bg-gradient-to-b from-ivory via-peach-50/40 to-ivory py-28 px-4 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#F5D0C0_1px,transparent_1px)] [background-size:28px_28px] opacity-50" />

      <div className="mx-auto max-w-6xl text-center">
        <SectionHeading
          eyebrow="Interactive Keepsake"
          title="The Glass Jar of Memories"
          subtitle="Inside this glowing jar are 25 folded origami notes — timeless memories, secret smiles, and quiet truths why we love Mom & Dad."
        />

        {/* Progress Counter Pill */}
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white/95 px-5 py-1.5 text-xs text-soft-brown shadow-sm backdrop-blur-xs">
          <Heart className="h-3.5 w-3.5 fill-burgundy text-burgundy" />
          <span>
            <strong className="text-burgundy font-semibold">{revealedIds.length}</strong> of{" "}
            <strong>{glassJarMessages.length}</strong> memories opened
          </span>
          <span className="text-warm-beige">•</span>
          <span className="text-gold font-medium">Keep tapping for more!</span>
        </div>

        {/* Jar and Interaction Area */}
        <div className="mt-12 flex flex-col items-center">
          <GlassJar isShaking={isShaking} onTap={handleTap} />

          <p className="mt-4 text-xs font-semibold tracking-widest text-soft-brown uppercase">
            Click or tap the jar to unfold a note
          </p>

          <button
            type="button"
            onClick={handleTap}
            disabled={isShaking}
            className="group mt-6 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-burgundy via-deep-burgundy to-burgundy px-7 py-3 text-xs font-semibold tracking-wider text-warm-white uppercase shadow-[0_8px_20px_rgba(158,61,44,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_28px_rgba(158,61,44,0.45)] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Wand2 className="h-4 w-4 text-gold transition-transform group-hover:rotate-45" />
            <span>{currentMessage ? "Unfold Another Note" : "Shake & Open Note"}</span>
            <Sparkles className="h-3.5 w-3.5 text-peach-200" />
          </button>
        </div>

        {/* Revealed Note Display Card (Parchment Paper with Wax Seal) */}
        <div className="mx-auto mt-10 sm:mt-14 min-h-[180px] sm:min-h-[220px] max-w-xl px-2 sm:px-0">
          <AnimatePresence mode="wait">
            {currentMessage ? (
              <motion.div
                key={currentMessage.id}
                initial={{ opacity: 0, scale: 0.85, y: 30, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.35 }}
                className="parchment-sheet relative rounded-2xl sm:rounded-3xl p-5 sm:p-8 sm:p-10 shadow-2xl"
              >
                {/* Vintage Wax Seal at Top */}
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full wax-seal text-warm-white text-[11px] sm:text-xs font-bold shadow-md">
                  {currentMessage.id}
                </div>

                {/* Corner Accents */}
                <span className="absolute top-3 left-3 sm:top-4 sm:left-4 text-xs text-gold/60 font-serif">✦</span>
                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-xs text-gold/60 font-serif">✦</span>
                <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-xs text-gold/60 font-serif">✦</span>
                <span className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-xs text-gold/60 font-serif">✦</span>

                <div className="my-2 sm:my-3">
                  <Heart className="mx-auto h-4 w-4 sm:h-5 sm:w-5 fill-burgundy/20 text-burgundy" />
                </div>

                {/* Note message */}
                <p className="font-heading text-lg sm:text-2xl sm:text-3xl font-normal leading-relaxed text-charcoal">
                  &ldquo;{currentMessage.message}&rdquo;
                </p>

                {currentMessage.author && (
                  <p className="font-cursive mt-3 sm:mt-5 text-xl sm:text-2xl font-normal text-burgundy">
                    — With love, {currentMessage.author}
                  </p>
                )}
              </motion.div>
            ) : (
              <div className="flex h-36 sm:h-40 flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-dashed border-warm-beige bg-champagne/20 p-5 sm:p-8 text-center text-xs sm:text-sm text-soft-brown backdrop-blur-xs">
                <Sparkles className="mb-2 h-5 w-5 sm:h-6 sm:w-6 text-gold" />
                <span>Tap the glass jar above to release a secret memory!</span>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
