"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import GlassJar from "@/components/interactive/GlassJar";
import { glassJarMessages } from "@/data/glass-jar-messages";
import { Heart, Sparkles, RefreshCw } from "lucide-react";
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
    <section id="glass-jar" className="relative w-full bg-ivory py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <SectionHeading
          title="The Glass Jar"
          subtitle="Inside this jar are 25+ folded notes — little reasons, timeless memories, and quiet truths why we love Mom & Dad."
        />

        {/* Counter */}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-warm-white px-4 py-1 text-xs text-soft-brown shadow-xs">
          <Heart className="h-3.5 w-3.5 fill-gold text-gold" />
          <span>
            <strong className="text-burgundy font-semibold">{revealedIds.length}</strong> of{" "}
            <strong>{glassJarMessages.length}</strong> reasons opened
          </span>
        </div>

        {/* Jar and Interaction Area */}
        <div className="mt-12 flex flex-col items-center">
          <GlassJar isShaking={isShaking} onTap={handleTap} />

          <p className="mt-4 text-xs font-medium tracking-widest text-soft-brown uppercase">
            Click or tap the jar to unfold a note
          </p>

          <button
            type="button"
            onClick={handleTap}
            disabled={isShaking}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-2.5 text-xs font-semibold tracking-wider text-warm-white uppercase shadow-sm transition-all duration-300 hover:bg-deep-burgundy hover:shadow-md active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <span>{currentMessage ? "Pick Another Note" : "Open a Love Note"}</span>
          </button>
        </div>

        {/* Revealed Note Display Card */}
        <div className="mx-auto mt-12 min-h-[180px] max-w-xl">
          <AnimatePresence mode="wait">
            {currentMessage ? (
              <motion.div
                key={currentMessage.id}
                initial={{ opacity: 0, scale: 0.8, y: 20, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                className="relative rounded-3xl border-2 border-warm-beige bg-gradient-to-br from-warm-white via-peach-100/60 to-warm-white p-8 shadow-xl"
              >
                {/* Paper texture badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-gold/50 bg-warm-white px-3 py-0.5 text-[11px] font-semibold text-gold shadow-xs">
                  Reason #{currentMessage.id}
                </div>

                <div className="my-2">
                  <Heart className="mx-auto h-6 w-6 fill-rose-100 text-burgundy/60" />
                </div>

                {/* Note message */}
                <p className="font-heading text-2xl font-normal leading-relaxed text-charcoal sm:text-3xl">
                  &ldquo;{currentMessage.message}&rdquo;
                </p>

                {currentMessage.author && (
                  <p className="mt-4 text-xs font-medium tracking-widest text-soft-brown uppercase">
                    — {currentMessage.author}
                  </p>
                )}
              </motion.div>
            ) : (
              <div className="flex h-36 items-center justify-center rounded-2xl border border-dashed border-warm-beige bg-champagne/10 p-6 text-sm text-soft-brown">
                Tap the glass jar above to reveal the first memory!
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

