"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import Lightbox from "@/components/ui/Lightbox";
import { fallbackCollageImages, type CollageImage } from "@/data/collage";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";
import { ZoomIn } from "lucide-react";
import Image from "next/image";

const STYLES: ("polaroid" | "golden" | "arch" | "pinned" | "canvas")[] = [
  "polaroid",
  "golden",
  "canvas",
  "arch",
  "pinned",
  "polaroid",
  "golden",
  "arch",
  "canvas",
  "pinned",
];

const ROTATIONS = [
  "-rotate-2",
  "rotate-1",
  "-rotate-1",
  "rotate-2",
  "-rotate-2",
  "rotate-1",
  "rotate-0",
  "-rotate-1",
  "rotate-2",
  "rotate-0",
];

const ASPECTS: ("square" | "portrait" | "landscape" | "tall")[] = [
  "portrait",
  "square",
  "landscape",
  "tall",
  "square",
  "portrait",
  "landscape",
  "tall",
];

export default function GalleryPreview() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(fallbackCollageImages);
  const [isPaused, setIsPaused] = useState(false);
  const { language, isTelugu } = useLanguage();
  const t = translations[language].gallery;

  // Fetch local collage photos dynamically from the frontend collage folder (/public/images/collage/)
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
      aspect: ASPECTS[idx % ASPECTS.length],
      rotation: ROTATIONS[idx % ROTATIONS.length],
    }));
  }, [imageUrls]);

  // Split images into two rows for the dual-lane parallax moving collage
  const { row1, row2 } = useMemo(() => {
    if (collageItems.length <= 1) {
      return { row1: collageItems, row2: collageItems };
    }
    const mid = Math.ceil(collageItems.length / 2);
    return {
      row1: collageItems.slice(0, mid),
      row2: collageItems.slice(mid),
    };
  }, [collageItems]);

  // Width classes according to aspect ratio
  const getCardWidthClass = (aspect: CollageImage["aspect"]) => {
    switch (aspect) {
      case "tall":
        return "w-32 sm:w-44 md:w-52";
      case "portrait":
        return "w-36 sm:w-48 md:w-56";
      case "landscape":
        return "w-52 sm:w-68 md:w-80";
      case "square":
      default:
        return "w-40 sm:w-52 md:w-60";
    }
  };

  const handleCardClick = (targetSrc: string) => {
    const foundIndex = imageUrls.findIndex((url) => url === targetSrc);
    setLightboxIndex(foundIndex >= 0 ? foundIndex : 0);
  };

  const renderPhotoCard = (item: CollageImage, keyPrefix: string, indexInRow: number) => {
    const isPolaroid = item.style === "polaroid";
    const isGolden = item.style === "golden";
    const isArch = item.style === "arch";
    const isPinned = item.style === "pinned";
    const isCanvas = item.style === "canvas";
    const widthClass = getCardWidthClass(item.aspect);

    return (
      <div
        key={`${keyPrefix}-${item.id}-${indexInRow}`}
        onClick={() => handleCardClick(item.src)}
        className={`shrink-0 select-none cursor-pointer transition-all duration-300 relative group ${widthClass} ${
          isPolaroid
            ? `bg-[#FAF7F2] p-2 sm:p-2.5 pb-5 sm:pb-6 rounded-xs shadow-md hover:shadow-2xl border border-warm-beige/70 hover:rotate-0 hover:scale-[1.05] hover:z-30 ${
                item.rotation || "-rotate-1"
              }`
            : isGolden
            ? "p-2 bg-gradient-to-br from-amber-100/70 via-warm-white to-amber-50/70 rounded-2xl border-2 border-gold/70 shadow-md ring-1 ring-gold/40 hover:ring-gold hover:shadow-2xl hover:scale-[1.05] hover:z-30"
            : isArch
            ? "rounded-t-[36px] sm:rounded-t-[44px] rounded-b-xl overflow-hidden border-2 border-warm-beige/80 bg-warm-white p-1.5 shadow-md hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.05] hover:z-30"
            : isPinned
            ? `p-2 bg-warm-white rounded-lg shadow-md border border-warm-beige hover:shadow-2xl hover:rotate-0 hover:scale-[1.05] hover:z-30 ${
                item.rotation || "rotate-1"
              }`
            : "rounded-2xl overflow-hidden border border-burgundy/15 bg-warm-white p-1.5 shadow-sm hover:shadow-xl hover:scale-[1.05] hover:z-30"
        }`}
      >
        {/* Polaroid Washi Tape Accent */}
        {isPolaroid && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-3 sm:h-3.5 bg-amber-200/60 backdrop-blur-xs -rotate-2 rounded-xs shadow-2xs pointer-events-none z-10" />
        )}

        {/* Pushpin Accent */}
        {isPinned && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 shadow-md border-2 border-warm-white pointer-events-none z-10" />
        )}

        {/* Golden Corner Accents */}
        {isGolden && (
          <>
            <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-gold/80 pointer-events-none z-10" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-gold/80 pointer-events-none z-10" />
            <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-gold/80 pointer-events-none z-10" />
            <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-gold/80 pointer-events-none z-10" />
          </>
        )}

        {/* Photo Container */}
        <div
          className={`relative w-full h-40 sm:h-52 md:h-60 overflow-hidden ${
            isArch
              ? "rounded-t-[30px] sm:rounded-t-[38px] rounded-b-lg"
              : isGolden
              ? "rounded-xl"
              : isCanvas
              ? "rounded-xl"
              : "rounded-xs"
          } bg-warm-beige/30`}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
            unoptimized={item.src.startsWith("http")}
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 pointer-events-none"
            loading="lazy"
          />

          {/* Interactive Zoom Indicator on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-warm-white/90 text-burgundy shadow-lg backdrop-blur-xs transform scale-90 group-hover:scale-100 transition-transform duration-300">
              <ZoomIn className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id="gallery"
      className="relative w-full bg-gradient-to-b from-champagne/20 via-ivory to-champagne/30 pt-12 pb-14 sm:pt-16 sm:pb-20 overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(#E8DCC8_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      {/* Heading Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <SectionHeading
          eyebrow={isTelugu ? "కాలాన్ని దాటిన మధుర క్షణాలు" : "Moments in Motion"}
          title={t.heading}
          subtitle={
            isTelugu
              ? "25 స్వర్ణోత్సవ వసంతాల చిరునవ్వులు, వేడుకలు మరియు ఆత్మీయ జ్ఞాపకాల తిరుగులేని దృశ్యమాలిక."
              : "An automatically moving tapestry of twenty-five cherished years. Tap any photo to zoom in full screen."
          }
        />
      </div>

      {/* ═════════════════════════════════════════════════════════════
          MOVING COLLAGE: Two opposite-direction auto-scrolling lanes
          - Mobile touch/drag handled
          - Hover / touch pauses the motion
          - Pure pictures in eclectic styles
          ═════════════════════════════════════════════════════════════ */}
      <div
        className="w-full space-y-4 sm:space-y-6 overflow-hidden"
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Top Ribbon: Scrolls Left */}
        <div
          className={`flex w-max gap-3.5 sm:gap-5 animate-collage-left pause-marquee ${
            isPaused ? "[animation-play-state:paused]" : ""
          }`}
        >
          {/* First loop of row 1 */}
          {row1.map((item, idx) => renderPhotoCard(item, "r1-a", idx))}
          {/* Duplicate loop for seamless infinite continuation */}
          {row1.map((item, idx) => renderPhotoCard(item, "r1-b", idx))}
        </div>

        {/* Bottom Ribbon: Scrolls Right */}
        <div
          className={`flex w-max gap-3.5 sm:gap-5 animate-collage-right pause-marquee ${
            isPaused ? "[animation-play-state:paused]" : ""
          }`}
        >
          {/* First loop of row 2 */}
          {row2.map((item, idx) => renderPhotoCard(item, "r2-a", idx))}
          {/* Duplicate loop for seamless infinite continuation */}
          {row2.map((item, idx) => renderPhotoCard(item, "r2-b", idx))}
        </div>
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
