"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Lightbox from "@/components/ui/Lightbox";
import { galleryItems } from "@/data/gallery";
import type { GalleryCategory } from "@/lib/types";
import { ArrowLeft, Camera } from "lucide-react";

const CATEGORIES: { label: string; value: "all" | GalleryCategory }[] = [
  { label: "All Memories", value: "all" },
  { label: "Wedding Day", value: "wedding-day" },
  { label: "Early Years", value: "early-years" },
  { label: "Family", value: "family" },
  { label: "Celebrations", value: "celebrations" },
  { label: "Travels", value: "travels" },
  { label: "Everyday Moments", value: "everyday" },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | GalleryCategory>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredItems = selectedCategory === "all"
    ? galleryItems
    : galleryItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-ivory py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white px-5 py-2 text-xs font-medium text-charcoal shadow-2xs transition-all hover:bg-champagne/40 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Anniversary Home</span>
          </Link>
        </div>

        <SectionHeading
          title="The Complete Memory Gallery"
          subtitle="Explore twenty-five years of cherished photographs, sorted across every major chapter of Mom and Dad's life together."
        />

        {/* Category Filters */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                  isActive
                    ? "bg-burgundy text-warm-white shadow-md scale-105"
                    : "border border-warm-beige bg-warm-white text-soft-brown hover:border-gold hover:text-charcoal"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Items Count Badge */}
        <div className="mt-6 text-center text-xs text-soft-brown">
          Showing <strong>{filteredItems.length}</strong> photographs
        </div>

        {/* Gallery Grid */}
        <motion.div
          layout
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.35 }}
                onClick={() => setLightboxIndex(index)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-warm-beige bg-warm-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-lg"
              >
                {/* Photo Placeholder Frame */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-gradient-to-br from-champagne/50 via-warm-beige/30 to-champagne/70 p-6 flex flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-white/90 text-gold shadow-sm transition-transform duration-300 group-hover:scale-110">
                    <Camera className="h-6 w-6" />
                  </div>
                  <span className="mt-3 text-[11px] font-semibold tracking-wider text-soft-brown uppercase">
                    {item.category.replace("-", " ")}
                  </span>
                  <span className="text-[11px] text-soft-brown/70">{item.date}</span>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-burgundy/85 p-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <p className="font-heading text-base font-medium text-warm-white">
                      {item.caption || item.alt}
                    </p>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-4">
                  <p className="line-clamp-1 font-body text-sm font-medium text-charcoal">
                    {item.caption || item.alt}
                  </p>
                  <p className="mt-1 text-xs text-soft-brown">{item.date}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox Component */}
      {lightboxIndex !== null && (
        <Lightbox
          images={filteredItems}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() =>
            setLightboxIndex((prev) =>
              prev !== null ? (prev + 1) % filteredItems.length : 0
            )
          }
          onPrev={() =>
            setLightboxIndex((prev) =>
              prev !== null
                ? (prev - 1 + filteredItems.length) % filteredItems.length
                : 0
            )
          }
        />
      )}
    </div>
  );
}

