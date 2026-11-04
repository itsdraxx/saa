"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Camera, Sparkles, Heart } from "lucide-react";

interface ImageSliderProps {
  thenImage: string;
  nowImage: string;
  thenYear: number;
  nowYear: number;
  className?: string;
}

export default function ImageSlider({
  thenImage,
  nowImage,
  thenYear,
  nowYear,
  className,
}: ImageSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [nowError, setNowError] = useState(false);
  const [thenError, setThenError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true);
      const touch = e.touches[0];
      if (touch) updatePosition(touch.clientX);
    },
    [updatePosition]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      if (touch) updatePosition(touch.clientX);
    };

    const handleEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, updatePosition]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-4/3 w-full cursor-ew-resize select-none overflow-hidden rounded-2xl border-2 border-warm-beige bg-champagne/40 shadow-lg",
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="slider"
      aria-label="Image comparison slider"
      aria-valuenow={Math.round(sliderPosition)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") setSliderPosition((p) => Math.max(0, p - 2));
        if (e.key === "ArrowRight") setSliderPosition((p) => Math.min(100, p + 2));
      }}
    >
      {/* Now Image / Card (Background) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-warm-white via-amber-50 to-champagne/70 p-8 text-center">
        {!nowError ? (
          <Image
            src={nowImage}
            alt={`Now — ${nowYear}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={() => setNowError(true)}
          />
        ) : null}

        {/* Fallback Graphic */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/20 text-gold shadow-xs">
            <Sparkles className="h-8 w-8" />
          </div>
          <span className="mt-3 font-heading text-2xl font-bold text-burgundy">
            Silver Jubilee • {nowYear}
          </span>
          <p className="mt-1 max-w-xs text-xs text-soft-brown">
            25 Years Later — Together, Thriving & Full of Smiles
          </p>
        </div>
      </div>

      {/* Then Image / Card (Clipped) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-champagne via-[#EBDDC8] to-champagne/90 p-8 text-center"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        {!thenError ? (
          <Image
            src={thenImage}
            alt={`Then — ${thenYear}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            onError={() => setThenError(true)}
          />
        ) : null}

        {/* Fallback Graphic */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-burgundy/15 text-burgundy shadow-xs">
            <Heart className="h-8 w-8 fill-burgundy/20" />
          </div>
          <span className="mt-3 font-heading text-2xl font-bold text-burgundy">
            Where It Began • {thenYear}
          </span>
          <p className="mt-1 max-w-xs text-xs text-soft-brown">
            Young, Newly Married & Starting a Forever Journey
          </p>
        </div>
      </div>

      {/* Draggable Divider Line */}
      <div
        className="absolute top-0 bottom-0 z-20 w-[2px] bg-warm-white shadow-xl"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
      >
        {/* Drag Handle */}
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-warm-white bg-gold text-warm-white shadow-lg transition-transform hover:scale-110 active:scale-95">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-warm-white">
            <path
              d="M5 3L2 8L5 13M11 3L14 8L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Year Floating Badges */}
      <div className="absolute bottom-4 left-4 z-10 rounded-full border border-gold/40 bg-warm-white/90 px-3.5 py-1 text-xs font-bold text-burgundy shadow-sm backdrop-blur-xs">
        Then ({thenYear})
      </div>
      <div className="absolute right-4 bottom-4 z-10 rounded-full border border-gold/40 bg-warm-white/90 px-3.5 py-1 text-xs font-bold text-gold shadow-sm backdrop-blur-xs">
        Now ({nowYear})
      </div>
    </div>
  );
}
