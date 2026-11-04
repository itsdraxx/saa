"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
        "relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl shadow-lg",
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
      {/* Now Image (Background / Full) */}
      <div className="absolute inset-0">
        <Image
          src={nowImage}
          alt={`Now — ${nowYear}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Then Image (Clipped) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={thenImage}
          alt={`Then — ${thenYear}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      {/* Divider Line */}
      <div
        className="absolute top-0 bottom-0 z-10 w-[2px] bg-white shadow-md"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-gold shadow-lg">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-white"
          >
            <path
              d="M5 3L2 8L5 13M11 3L14 8L11 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Year Labels */}
      <div className="absolute bottom-4 left-4 z-10 rounded-full bg-charcoal/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        {thenYear}
      </div>
      <div className="absolute right-4 bottom-4 z-10 rounded-full bg-charcoal/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        {nowYear}
      </div>
    </div>
  );
}
