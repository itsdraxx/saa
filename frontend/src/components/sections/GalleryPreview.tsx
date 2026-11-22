"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import Lightbox from "@/components/ui/Lightbox";
import { fallbackCollageImages, type CollageImage } from "@/data/collage";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";
import { ZoomIn, Sparkles, ChevronDown, ChevronUp, ArrowRight, Heart, Camera } from "lucide-react";

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

const INITIAL_BATCH_COUNT = 8;

export default function GalleryPreview() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(fallbackCollageImages);
  const [isExpanded, setIsExpanded] = useState(false);
  const { language, isTelugu } = useLanguage();
  const t = translations[language].gallery;

  // Fetch local collage photos dynamically from /public/images/collage/
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
        console.warn("[Collage] Using fallback photos:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Map image URLs into styled collage items
  const collageItems = useMemo<CollageImage[]>(() => {
    return imageUrls.map((src, idx) => ({
      id: `collage-${idx}`,
      src,
      alt: `Anniversary Memory ${idx + 1}`,
      style: STYLES[idx % STYLES.length],
      aspect: "portrait",
      rotation: ROTATIONS[idx % ROTATIONS.length],
    }));
  }, [imageUrls]);

  // Sliced items based on expanded state
  const displayedItems = useMemo(() => {
    if (isExpanded) return collageItems;
    return collageItems.slice(0, INITIAL_BATCH_COUNT);
  }, [collageItems, isExpanded]);

  const handleCardClick = (targetSrc: string) => {
    const foundIndex = imageUrls.findIndex((url) => url === targetSrc);
    setLightboxIndex(foundIndex >= 0 ? foundIndex : 0);
  };

  const remainingCount = Math.max(0, imageUrls.length - INITIAL_BATCH_COUNT);

  return (
    <section
      id="gallery"
      className="relative w-full bg-gradient-to-b from-champagne/25 via-ivory to-champagne/35 pt-14 pb-16 sm:pt-20 sm:pb-24 overflow-hidden"
    >
      {/* Background Ambience Dots */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#E8DCC8_1px,transparent_1px)] [background-size:24px_24px] opacity-45" />

      {/* Heading Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 text-center">
        <SectionHeading
          eyebrow={isTelugu ? "కాలాన్ని దాటిన మధుర క్షణాలు" : "Big Photo Collage"}
          title={t.heading || "Moments in Time"}
          subtitle={
            isTelugu
              ? "25 స్వర్ణోత్సవ వసంతాల చిరునవ్వులు, వేడుకలు మరియు ఆత్మీయ జ్ఞాపకాల తిరుగులేని దృశ్యమాలిక. ప్రతి ఫోటోను పెద్దదిగా చూడటానికి నొక్కండి."
              : "A grand scrapbook tapestry of twenty-five cherished years. Each photograph preserves its natural memory — tap any picture to view in high resolution."
          }
        />

        {/* Live Photo Counter Badge */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-warm-white/90 border border-gold/40 text-soft-brown text-xs font-semibold shadow-2xs">
          <Camera className="h-3.5 w-3.5 text-burgundy" />
          <span>
            {isTelugu
              ? `${imageUrls.length} మధుర జ్ఞాపకాలు`
              : `${imageUrls.length} Cherished Memories`}
          </span>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          GRAND MASONRY WATERFALL COLLAGE
          - Multi-column waterfall layout (columns-1 to columns-4)
          - Each photo card displays at its own intrinsic height
          - Handcrafted keepsake card styles (Polaroid, Gold leaf, Canvas, Pinned)
          ═════════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          {displayedItems.map((item, idx) => {
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

                {/* Photo Element (renders in its own natural size) */}
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

                {/* Polaroid Bottom Caption Area */}
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

        {/* ═════════════════════════════════════════════════════════════
            VIEW MORE / VIEW LESS EXPANDER BUTTON
            ═════════════════════════════════════════════════════════════ */}
        {!isExpanded && remainingCount > 0 ? (
          <div className="relative -mt-24 sm:-mt-32 pt-28 sm:pt-36 pb-4 bg-gradient-to-t from-ivory via-ivory/95 to-transparent flex flex-col items-center justify-end z-20">
            <button
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center gap-2.5 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-burgundy via-[#8B1E28] to-burgundy text-white font-semibold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-gold/40 group cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-gold group-hover:rotate-45 transition-transform" />
              <span>
                {isTelugu
                  ? `మరిన్ని మధుర జ్ఞాపకాలు చూడండి (+${remainingCount} ఫోటోలు)`
                  : `View More Memories (+${remainingCount} More Photos)`}
              </span>
              <ChevronDown className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        ) : isExpanded ? (
          <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setIsExpanded(false);
                const el = document.getElementById("gallery");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-warm-beige bg-warm-white text-xs sm:text-sm font-semibold text-charcoal hover:bg-champagne/40 transition-colors cursor-pointer shadow-xs"
            >
              <ChevronUp className="h-4 w-4" />
              <span>{isTelugu ? "తక్కువ చూడండి" : "Show Less"}</span>
            </button>

            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-burgundy hover:bg-burgundy/90 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
            >
              <span>{isTelugu ? "పూర్తి గ్యాలరీ పేజీని చూడండి" : "Full Gallery Archive"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </div>

      {/* ═════════════════════════════════════════════════════════════
          FULL-SCREEN LIGHTBOX MODAL
          ═════════════════════════════════════════════════════════════ */}
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
    </section>
  );
}
