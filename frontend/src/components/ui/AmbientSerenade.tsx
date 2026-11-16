"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Music, Disc } from "lucide-react";

export default function AmbientSerenade() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const stepRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Romantic music box notes (pentatonic / major chords: F4, A4, C5, E5, G5, etc.)
  const notes = [
    349.23, 440.0, 523.25, 659.25, 523.25, 440.0, // F - A - C - E - C - A
    392.0, 493.88, 587.33, 698.46, 587.33, 493.88, // G - B - D - F - D - B
    329.63, 392.0, 493.88, 587.33, 493.88, 392.0,  // E - G - B - D - B - G
    261.63, 329.63, 392.0, 523.25, 659.25, 523.25, // C - E - G - C - E - C
  ];

  const playNote = useCallback((freq: number) => {
    if (!audioCtxRef.current || isMuted) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Warm music box envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.6);
  }, [isMuted]);

  const toggleMusic = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }

    if (isPlaying) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      isPlayingRef.current = true;
      setIsPlaying(true);

      timerRef.current = setInterval(() => {
        if (!isPlayingRef.current) return;
        const note = notes[stepRef.current % notes.length];
        playNote(note);
        stepRef.current += 1;
      }, 420);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
      <div className="flex items-center gap-3 rounded-full border border-warm-beige/80 bg-warm-white/95 px-4 py-2 shadow-[0_8px_25px_rgba(158,61,44,0.12)] backdrop-blur-md transition-all duration-300 hover:shadow-lg">
        {/* Spinning Vinyl Icon */}
        <button
          onClick={toggleMusic}
          className="flex items-center gap-2 text-xs font-medium text-charcoal hover:text-burgundy cursor-pointer"
          title={isPlaying ? "Pause Anniversary Music" : "Play Anniversary Music"}
        >
          <Disc
            className={`h-5 w-5 text-burgundy transition-transform ${
              isPlaying ? "animate-spin [animation-duration:4s]" : ""
            }`}
          />
          <div className="hidden flex-col text-left sm:flex">
            <span className="font-heading text-sm font-semibold text-burgundy leading-none">
              {isPlaying ? "Mom & Dad's Waltz" : "Play Our Song"}
            </span>
            <span className="text-[10px] text-soft-brown">
              {isPlaying ? "Playing Romantic Melody" : "Tap for Music"}
            </span>
          </div>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={toggleMusic}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-peach-100 text-burgundy transition-transform hover:scale-110 active:scale-95 cursor-pointer"
        >
          {isPlaying ? (
            <span className="h-2 w-2 rounded-xs bg-burgundy" />
          ) : (
            <Music className="h-3.5 w-3.5" />
          )}
        </button>

        {/* Mute Button */}
        {isPlaying && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-soft-brown transition-colors hover:text-burgundy cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4 text-burgundy" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

