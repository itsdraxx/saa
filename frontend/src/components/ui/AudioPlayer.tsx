"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Precomputed integer waveform bar heights to guarantee deterministic SSR/hydration
const WAVEFORM_HEIGHTS = [
  35, 52, 68, 79, 82, 75, 61, 45, 32, 26,
  29, 38, 52, 66, 76, 78, 71, 58, 43, 31,
  26, 28, 37, 50, 64, 74, 76, 70, 57, 42,
  30, 25, 27, 36, 49, 63, 73, 75, 69, 56,
];

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

export default function AudioPlayer({ src, title, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // Handle playback error gracefully for placeholders
        setIsPlaying(false);
      }
    }
  }, [isPlaying]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audio.currentTime = percent * duration;
    },
    [duration]
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "rounded-2xl border border-warm-beige/50 bg-warm-white p-4 shadow-sm",
        className
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {title && (
        <p className="mb-3 text-sm font-medium text-charcoal">{title}</p>
      )}

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          disabled={!isLoaded && !src}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-burgundy text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" fill="currentColor" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
          )}
        </button>

        {/* Progress Section */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {/* Waveform / Progress Bar */}
          <div
            onClick={handleSeek}
            className="group relative h-8 cursor-pointer overflow-hidden rounded-lg bg-champagne/50"
          >
            {/* Waveform bars (CSS visual) */}
            <div className="absolute inset-0 flex items-center justify-around px-1">
              {WAVEFORM_HEIGHTS.map((height, i) => {
                const isPlayed = (i / WAVEFORM_HEIGHTS.length) * 100 <= progress;
                return (
                  <div
                    key={i}
                    className={cn(
                      "w-[2px] rounded-full transition-colors duration-150",
                      isPlayed ? "bg-gold" : "bg-warm-beige"
                    )}
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>

            {/* Progress overlay */}
            <div
              className="absolute inset-y-0 left-0 bg-gold/10"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-xs text-soft-brown/70">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
