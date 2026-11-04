"use client";

import { useState, useRef } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title: string;
  className?: string;
}

export default function VideoPlayer({
  src,
  poster,
  title,
  className,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-warm-beige bg-charcoal/90 shadow-md",
        className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        onEnded={() => setIsPlaying(false)}
        playsInline
        className="aspect-video w-full object-cover"
      />

      {/* Video Overlay / Play Button */}
      <div
        onClick={togglePlay}
        className={cn(
          "absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30 transition-opacity duration-300",
          isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        )}
      >
        <button
          type="button"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-warm-white/90 text-burgundy shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-110 active:scale-95"
        >
          {isPlaying ? (
            <Pause className="h-7 w-7 fill-current" />
          ) : (
            <Play className="ml-1 h-7 w-7 fill-current" />
          )}
        </button>
      </div>

      {/* Caption Bar */}
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-warm-white">
        <p className="font-heading text-lg font-medium tracking-wide">{title}</p>
      </div>
    </div>
  );
}
