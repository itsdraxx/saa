"use client";

import { motion } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import ImageSlider from "@/components/ui/ImageSlider";
import { thenVsNowPairs } from "@/data/then-vs-now";
import { Sparkles, Calendar } from "lucide-react";

export default function ThenVsNowSection() {
  return (
    <section id="then-now" className="w-full bg-champagne/25 pt-10 pb-16 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          title="Then & Now"
          subtitle="Twenty-five years have changed the hairstyles, the houses, and the number of smiles around the table — but the love has only deepened."
        />

        <div className="mt-10 sm:mt-12 space-y-10 sm:space-y-12">
          {thenVsNowPairs.map((pair, index) => (
            <motion.div
              key={pair.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="overflow-hidden rounded-2xl sm:rounded-3xl border border-warm-beige bg-warm-white p-4 sm:p-8 shadow-sm"
            >
              {/* Header */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-warm-beige/60 pb-4">
                <div>
                  <h3 className="font-heading text-2xl font-semibold text-charcoal sm:text-3xl">
                    {pair.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs font-medium text-gold uppercase tracking-wider">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{pair.thenYear} vs {pair.nowYear}</span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-champagne/60 px-3 py-1 text-xs text-soft-brown">
                  <Sparkles className="h-3 w-3 text-gold" />
                  <span>Drag the slider to compare</span>
                </div>
              </div>

              {/* Slider */}
              <div className="mx-auto max-w-4xl">
                <ImageSlider
                  thenImage={pair.thenImage}
                  nowImage={pair.nowImage}
                  thenYear={pair.thenYear}
                  nowYear={pair.nowYear}
                />
              </div>

              {/* Captions */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-warm-beige/60 bg-champagne/20 p-4">
                  <p className="text-xs font-bold tracking-widest text-burgundy uppercase">
                    Then • {pair.thenYear}
                  </p>
                  <p className="mt-1 font-body text-sm text-soft-brown">
                    {pair.thenCaption}
                  </p>
                </div>
                <div className="rounded-xl border border-warm-beige/60 bg-champagne/20 p-4">
                  <p className="text-xs font-bold tracking-widest text-gold uppercase">
                    Now • {pair.nowYear}
                  </p>
                  <p className="mt-1 font-body text-sm text-soft-brown">
                    {pair.nowCaption}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

