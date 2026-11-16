"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, Camera, Heart } from "lucide-react";

interface LightboxImage {
  src: string;
  alt: string;
  caption?: string;
  date?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const currentImage = images[currentIndex];
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const imgError = !!failedImages[currentIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          onNext();
          break;
        case "ArrowLeft":
          onPrev();
          break;
      }
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!currentImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Photo Lightbox"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-warm-white/10 text-warm-white transition-colors hover:bg-warm-white/20 active:scale-95"
          aria-label="Close lightbox"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Prev Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-warm-white/10 text-warm-white transition-colors hover:bg-warm-white/20 active:scale-95"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-warm-white/10 text-warm-white transition-colors hover:bg-warm-white/20 active:scale-95"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Image Container */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative mx-auto flex max-h-[85vh] max-w-[90vw] flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative overflow-hidden rounded-2xl border-4 border-warm-white/20 shadow-2xl">
            {!imgError ? (
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                width={1200}
                height={800}
                className="max-h-[70vh] w-auto object-contain"
                priority
                onError={() => setFailedImages((prev) => ({ ...prev, [currentIndex]: true }))}
              />
            ) : (
              <div className="flex aspect-16/10 w-[600px] max-w-[85vw] flex-col items-center justify-center rounded-xl bg-gradient-to-br from-champagne via-[#E8DCC8] to-champagne/90 p-8 text-center text-charcoal">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warm-white/80 text-gold shadow-md">
                  <Camera className="h-8 w-8" />
                </div>
                <h4 className="mt-4 font-heading text-2xl font-semibold text-burgundy">
                  {currentImage.caption || currentImage.alt}
                </h4>
                {currentImage.date && (
                  <p className="mt-1 text-xs font-semibold text-gold uppercase tracking-wider">
                    {currentImage.date}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-1.5 text-xs text-soft-brown">
                  <Heart className="h-3.5 w-3.5 fill-gold text-gold" />
                  <span>Personal Family Memory</span>
                </div>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="mt-4 text-center">
            {currentImage.caption && (
              <p className="font-heading text-lg font-medium text-warm-white">
                {currentImage.caption}
              </p>
            )}
            {/* Counter */}
            {images.length > 1 && (
              <p className="mt-1 text-xs text-warm-white/60">
                {currentIndex + 1} of {images.length}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
