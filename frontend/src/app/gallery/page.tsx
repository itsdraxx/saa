"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ZoomIn, Camera } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import Lightbox from "@/components/ui/Lightbox";
import { fallbackCollageImages, type CollageImage } from "@/data/collage";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";

const STYLES: ("polaroid" | "golden" | "arch" | "pinned" | "canvas")[] = [
  "polaroid",
  "golden",
  "canvas",
  "arch",
  "pinned",
  "polaroid",
  "golden",
  "pinned",
  "canvas",
  "arch",
];

const ROTATIONS = [
  "-rotate-1",
  "rotate-1",
  "rotate-0",
  "-rotate-2",
  "rotate-2",
  "rotate-0",
  "-rotate-1",
  "rotate-1",
];

export default function GalleryPage() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(fallbackCollageImages);
  const { language, isTelugu } = useLanguage();
  const t = translations[language].gallery;

  useEffect(() => {
    let isMounted = true;
    fetch("/api/collage")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.images) && data.images.length > 0) {
          setImageUrls(data.images);
        }
      })
      .catch((err) => {
        console.warn("[GalleryPage] Using fallback photos:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const collageItems = useMemo<CollageImage[]>(() => {
    return imageUrls.map((src, idx) => ({
      id: `gallery-full-${idx}`,
      src,
      alt: `Anniversary Memory ${idx + 1}`,
      style: STYLES[idx % STYLES.length],
      aspect: "portrait",
      rotation: ROTATIONS[idx % ROTATIONS.length],
    }));
  }, [imageUrls]);

  const handleCardClick = (targetSrc: string) => {
    const foundIndex = imageUrls.findIndex((url) => url === targetSrc);
    setLightboxIndex(foundIndex >= 0 ? foundIndex : 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-champagne/30 via-ivory to-champagne/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <Link
            href="/#gallery"
            className="inline-flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white px-5 py-2 text-xs font-semibold text-charcoal shadow-2xs hover:bg-champagne/40 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isTelugu ? "తిరిగి హోమ్‌కి వెళ్ళండి" : "Back to Anniversary Home"}</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-warm-white/90 border border-gold/40 text-soft-brown text-xs font-semibold shadow-2xs">
            <Camera className="h-3.5 w-3.5 text-burgundy" />
            <span>
              {isTelugu
                ? `${imageUrls.length} మధుర జ్ఞాపకాలు`
                : `${imageUrls.length} Cherished Memories`}
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-10 sm:mb-14 text-center">
          <SectionHeading
            eyebrow={isTelugu ? "సంపూర్ణ దృశ్యమాలిక" : "Grand Photo Archive"}
            title={t.heading || "Moments in Time"}
            subtitle={
              isTelugu
                ? "ఆది మరియు సత్య 25 సంవత్సరాల అనురాగం, కుటుంబ వేడుకలు మరియు అందమైన క్షణాల సమగ్ర సంకలనం."
                : "The complete visual scrapbook of Adhi & Satya's twenty-five years of love, family milestones, and unforgettable celebrations."
            }
          />
        </div>

        {/* Full Masonry Grid */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          {collageItems.map((item, idx) => {
            const isPolaroid = item.style === "polaroid";
            const isGolden = item.style === "golden";
            const isArch = item.style === "arch";
            const isPinned = item.style === "pinned";

            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item.src)}
                className={`break-inside-avoid relative select-none cursor-pointer transition-all duration-300 group ${
                  isPolaroid
                    ? `bg-[#FAF7F2] p-2.5 sm:p-3 pb-6 sm:pb-7 rounded-sm shadow-md hover:shadow-2xl border border-warm-beige/80 hover:rotate-0 hover:scale-[1.02] hover:z-20 ${
                        item.rotation || "-rotate-1"
                      }`
                    : isGolden
                    ? "p-2.5 bg-gradient-to-br from-amber-50/80 via-warm-white to-amber-100/50 rounded-2xl border-2 border-gold/70 shadow-md ring-1 ring-gold/40 hover:ring-gold hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 hover:z-20"
                    : isArch
                    ? "rounded-t-[32px] sm:rounded-t-[40px] rounded-b-2xl overflow-hidden border-2 border-warm-beige/90 bg-warm-white p-2 shadow-md hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] hover:z-20"
                    : isPinned
                    ? `p-2.5 bg-warm-white rounded-xl shadow-md border border-warm-beige hover:shadow-2xl hover:rotate-0 hover:scale-[1.02] hover:z-20 ${
                        item.rotation || "rotate-1"
                      }`
                    : "rounded-2xl overflow-hidden border border-burgundy/15 bg-warm-white p-2 shadow-sm hover:shadow-2xl hover:scale-[1.02] hover:z-20"
                }`}
              >
                {/* Polaroid Washi Tape Accent */}
                {isPolaroid && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 sm:w-14 h-3.5 bg-amber-200/70 backdrop-blur-xs -rotate-2 rounded-xs shadow-2xs pointer-events-none z-10" />
                )}

                {/* Pushpin Accent */}
                {isPinned && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 shadow-md border-2 border-warm-white pointer-events-none z-10" />
                )}

                {/* Golden Corner Accents */}
                {isGolden && (
                  <>
                    <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-gold/90 pointer-events-none z-10" />
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-gold/90 pointer-events-none z-10" />
                    <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-gold/90 pointer-events-none z-10" />
                    <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-gold/90 pointer-events-none z-10" />
                  </>
                )}

                {/* Photo Element (renders at own natural size) */}
                <div
                  className={`relative w-full overflow-hidden ${
                    isArch
                      ? "rounded-t-[26px] sm:rounded-t-[34px] rounded-b-xl"
                      : isGolden
                      ? "rounded-xl"
                      : "rounded-lg"
                  } bg-warm-beige/20`}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="w-full h-auto block object-cover transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none"
                  />

                  {/* Interactive Zoom Indicator on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-between p-3 pointer-events-none">
                    <span className="self-end text-[10px] font-bold text-white/90 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      #{idx + 1}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-warm-white/95 text-burgundy shadow-xl backdrop-blur-xs transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <ZoomIn className="h-5 w-5" />
                    </div>
                    <span className="text-[11px] font-medium text-white/95 tracking-wide drop-shadow-md">
                      {isTelugu ? "పెద్దదిగా చూడటానికి నొక్కండి" : "Tap to Zoom"}
                    </span>
                  </div>
                </div>

                {/* Polaroid Bottom Caption */}
                {isPolaroid && (
                  <div className="pt-2 px-1 text-center">
                    <p className="font-heading italic text-xs text-soft-brown font-medium">
                      25 Years of Us • #{idx + 1}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Back Button */}
        <div className="mt-14 sm:mt-16 text-center">
          <Link
            href="/#gallery"
            className="inline-flex items-center gap-2 rounded-full bg-burgundy hover:bg-burgundy/90 text-white px-7 py-3 text-xs sm:text-sm font-semibold shadow-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isTelugu ? "హోమ్ పేజీకి తిరిగి వెళ్లండి" : "Back to Anniversary Home"}</span>
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <Lightbox
          images={imageUrls.map((src, i) => ({
            src,
            alt: `Anniversary Moment #${i + 1}`,
          }))}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() =>
            setLightboxIndex((prev) =>
              prev !== null ? (prev + 1) % imageUrls.length : 0
            )
          }
          onPrev={() =>
            setLightboxIndex((prev) =>
              prev !== null ? (prev - 1 + imageUrls.length) % imageUrls.length : 0
            )
          }
        />
      )}
    </div>
  );
}
