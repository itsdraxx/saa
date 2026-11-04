"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Lightbox from "@/components/ui/Lightbox";
import { galleryItems } from "@/data/gallery";
import { ArrowRight, Camera, Image as ImageIcon } from "lucide-react";

export default function GalleryPreview() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const previewItems = galleryItems.slice(0, 6);

  return (
    <section id="gallery" className="w-full bg-champagne/30 py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Memory Gallery"
          subtitle="A glimpse into 25 years of stolen moments, festive celebrations, quiet smiles, and extraordinary travels."
        />

        {/* Photo Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {previewItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => setLightboxIndex(index)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-warm-beige bg-warm-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Photo Frame Placeholder */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-gradient-to-br from-champagne/60 via-warm-beige/30 to-champagne/80 p-6 flex flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warm-white/80 text-gold shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <Camera className="h-6 w-6" />
                </div>
                <span className="mt-3 text-xs font-semibold tracking-wider text-soft-brown uppercase">
                  {item.category.replace("-", " ")}
                </span>
                <span className="text-xs text-soft-brown/70">{item.date}</span>

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-burgundy/80 p-4 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="font-heading text-lg font-medium text-warm-white">
                    {item.caption || item.alt}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4">
                <p className="line-clamp-1 font-body text-sm font-medium text-charcoal">
                  {item.caption || item.alt}
                </p>
                <p className="mt-1 text-xs text-soft-brown">{item.date}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View Full Gallery Link Button */}
        <div className="mt-12 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 rounded-full border border-burgundy bg-warm-white px-8 py-3.5 text-sm font-medium text-burgundy shadow-sm transition-all duration-300 hover:bg-burgundy hover:text-warm-white hover:shadow-md active:scale-95"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Explore All {galleryItems.length} Photographs</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Lightbox for full-screen view */}
      {lightboxIndex !== null && (
        <Lightbox
          images={previewItems}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() =>
            setLightboxIndex((prev) =>
              prev !== null ? (prev + 1) % previewItems.length : 0
            )
          }
          onPrev={() =>
            setLightboxIndex((prev) =>
              prev !== null
                ? (prev - 1 + previewItems.length) % previewItems.length
                : 0
            )
          }
        />
      )}
    </section>
  );
}

