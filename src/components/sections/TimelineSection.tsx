"use client";

import { motion } from "motion/react";
import { timelineEntries } from "@/data/timeline";
import SectionHeading from "@/components/ui/SectionHeading";
import { Calendar, Heart, MapPin, Sparkles } from "lucide-react";

export default function TimelineSection() {
  return (
    <section id="story" className="relative w-full bg-ivory py-24 px-4 sm:px-6 lg:px-8">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#E8DCC8_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      <div className="mx-auto max-w-5xl">
        <SectionHeading
          title="Our 25-Year Journey"
          subtitle="From the day two lives became one, every milestone has been a chapter in a beautiful love story."
        />

        {/* Timeline Container */}
        <div className="relative mt-20">
          {/* Center Vertical Line */}
          <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-gold via-warm-beige to-gold/30 md:left-1/2 md:-translate-x-1/2" />

          {/* Timeline Cards */}
          <div className="space-y-12">
            {timelineEntries.map((entry, index) => {
              const isEven = index % 2 === 0;

              return (
                <div
                  key={entry.year + "-" + index}
                  className={`relative flex flex-col md:flex-row items-center ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Timeline Badge in Center */}
                  <div className="absolute left-4 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-4 border-ivory bg-gold text-warm-white shadow-md md:left-1/2">
                    <Heart className="h-4 w-4 fill-warm-white" />
                  </div>

                  {/* Content Card */}
                  <div className="ml-12 w-full md:ml-0 md:w-[45%]">
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? 30 : -30, y: 20 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="group relative overflow-hidden rounded-2xl border border-warm-beige bg-warm-white p-6 shadow-sm transition-all duration-300 hover:border-gold/50 hover:shadow-md"
                    >
                      {/* Top Bar: Year & Category */}
                      <div className="flex items-center justify-between border-b border-warm-beige/60 pb-3">
                        <span className="font-heading text-2xl font-bold tracking-tight text-burgundy">
                          {entry.year}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-champagne/60 px-3 py-0.5 text-xs font-medium text-soft-brown capitalize">
                          <Sparkles className="h-3 w-3 text-gold" />
                          {entry.category}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="mt-4 font-heading text-xl font-semibold text-charcoal group-hover:text-burgundy transition-colors">
                        {entry.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-soft-brown">
                        {entry.description}
                      </p>

                      {/* Photo Placeholder Frame */}
                      <div className="mt-4 flex aspect-16/9 w-full flex-col items-center justify-center rounded-xl border border-dashed border-warm-beige bg-champagne/20 text-center text-xs text-soft-brown">
                        <Calendar className="mb-1 h-5 w-5 text-gold/80" />
                        <span>Milestone photo • {entry.year}</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
