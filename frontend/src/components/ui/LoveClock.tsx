"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { Heart, Clock, Coffee, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";

interface LoveClockProps {
  weddingDate?: string;
  align?: "center" | "left";
  className?: string;
}

const emptySubscribe = () => () => {};

export default function LoveClock({
  weddingDate = "2001-11-23T00:00:00",
  align = "center",
  className = "",
}: LoveClockProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [elapsed, setElapsed] = useState({
    days: 9131,
    hours: 14,
    minutes: 32,
    seconds: 45,
    heartbeats: 948624000,
  });

  useEffect(() => {
    const startDate = new Date(weddingDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, now - startDate);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const totalMinutes = Math.floor(diff / (1000 * 60));
      const heartbeats = totalMinutes * 72;

      setElapsed({ days, hours, minutes, seconds, heartbeats });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  const { language } = useLanguage();
  const t = translations[language].counter;

  const units = [
    { label: t.daysOfLove || t.days, value: elapsed.days.toLocaleString() },
    { label: t.hours, value: String(elapsed.hours).padStart(2, "0") },
    { label: t.minutes, value: String(elapsed.minutes).padStart(2, "0") },
    { label: t.seconds, value: String(elapsed.seconds).padStart(2, "0"), isLive: true },
  ];

  const isLeft = align === "left";

  return (
    <div className={`w-full ${className}`}>
      {/* Header Label */}
      <div className={`mb-3.5 flex items-center gap-2 ${isLeft ? "justify-center lg:justify-start" : "justify-center"}`}>
        <Sparkles className="h-3.5 w-3.5 text-peach-500 animate-pulse" />
        <span className="font-body text-xs font-bold tracking-widest text-burgundy uppercase">
          {t.liveTicker}
        </span>
        <Sparkles className="h-3.5 w-3.5 text-peach-500 animate-pulse" />
      </div>

      {/* Main Clock Grid */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3.5">
        {units.map((unit, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx, duration: 0.5 }}
            className="group relative flex flex-col items-center justify-center rounded-2xl border border-peach-200/90 bg-gradient-to-b from-warm-white via-peach-50/60 to-warm-white p-3.5 sm:p-4 text-center shadow-[0_8px_20px_rgba(158,61,44,0.06)] transition-all duration-300 hover:border-peach-400 hover:shadow-md"
          >
            {unit.isLive && mounted && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-peach-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-burgundy" />
              </span>
            )}
            <span className="font-heading text-2xl xs:text-3xl sm:text-4xl font-bold tracking-tight text-[#6A1A24]">
              {mounted ? unit.value : "--"}
            </span>
            <span className="mt-1 font-body text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#6E4238] uppercase">
              {unit.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Romantic Micro-Stats */}
      <div className={`mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs ${isLeft ? "justify-center lg:justify-start" : "justify-center"}`}>
        <div className="flex items-center gap-1.5 rounded-full border border-peach-200/90 bg-warm-white/95 px-3.5 py-1 text-[#542B24] shadow-2xs">
          <Heart className="h-3.5 w-3.5 fill-burgundy/20 text-burgundy" />
          <span>
            <strong className="text-burgundy font-bold">
              {mounted ? (elapsed.heartbeats / 1000000).toFixed(1) : "950"}M+
            </strong>{" "}
            {t.heartbeatsShared}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-peach-200/90 bg-warm-white/95 px-3.5 py-1 text-[#542B24] shadow-2xs">
          <Coffee className="h-3.5 w-3.5 text-peach-600" />
          <span>
            <strong className="text-burgundy font-bold">18,250+</strong> {t.chais}
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-peach-200/90 bg-warm-white/95 px-3.5 py-1 text-[#542B24] shadow-2xs">
          <Clock className="h-3.5 w-3.5 text-gold" />
          <span>
            <strong className="text-burgundy font-bold">1</strong> {t.unbreakableBond}
          </span>
        </div>
      </div>
    </div>
  );
}
