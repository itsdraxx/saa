"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { X, ArrowRight, User } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface InstagramNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitName: (name: string) => void;
  initialName?: string;
}

export default function InstagramNameModal({
  isOpen,
  onClose,
  onSubmitName,
  initialName = "",
}: InstagramNameModalProps) {
  const { isTelugu } = useLanguage();
  const [nameInput, setNameInput] = useState(initialName);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "";
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError("Please enter your name or relation to continue");
      return;
    }
    if (trimmed.length < 2) {
      setError("Please enter at least 2 characters");
      return;
    }

    onSubmitName(trimmed);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/70 backdrop-blur-xs cursor-pointer"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-sm rounded-3xl bg-warm-white p-6 sm:p-7 shadow-2xl border border-warm-beige text-center overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-soft-brown/70 hover:bg-champagne/80 hover:text-charcoal transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Avatar / Icon with Instagram Story Gradient Ring */}
            <div className="mx-auto flex justify-center">
              <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-md">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-peach-50 border-2 border-warm-white overflow-hidden">
                  <Image
                    src="/images/art/couple_sittinga_and_welcoming.png"
                    alt="Adhi & Satya"
                    width={64}
                    height={64}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
            </div>

            {/* Heading */}
            <h3 className="mt-4 font-heading text-xl sm:text-2xl font-bold text-charcoal">
              {isTelugu ? "కుటుంబంలోకి స్వాగతం!" : "Welcome to the Family!"}
            </h3>
            <p className="mt-1 text-xs text-soft-brown leading-relaxed px-2">
              {isTelugu
                ? "ఆది & సత్య దంపతులకు మీ ఆశీస్సులు ఎవరు అందజేశారో తెలిసేలా దయచేసి మీ పేరు లేదా బంధుత్వాన్ని నమోదు చేయండి ❤️"
                : "Please enter your name or family relation so Adhi & Satya know who left these loving blessings ❤️"}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder={isTelugu ? "ఉదా: రమేష్, ప్రియ, కిరణ్ అంకుల్..." : "e.g. Ramesh, Priya, Kiran Uncle..."}
                  maxLength={40}
                  className="w-full rounded-2xl border-2 border-warm-beige bg-champagne/30 px-4 py-3 text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:bg-warm-white focus:outline-hidden transition-all shadow-inner"
                />
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soft-brown/40 pointer-events-none" />
              </div>

              {error && (
                <p className="text-[11px] font-medium text-red-600 text-left px-1">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-burgundy via-deep-burgundy to-burgundy py-3 px-5 text-sm font-semibold tracking-wide text-warm-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-98 cursor-pointer"
              >
                <span>{isTelugu ? "కామెంట్లకు కొనసాగండి" : "Continue to Comments"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-3.5 text-[10px] text-soft-brown/60">
              {isTelugu
                ? "ఒక్కసారి మాత్రమే నమోదు చేయాలి — అన్ని జ్ఞాపకాలకు ఇది గుర్తుండిపోతుంది!"
                : "You only need to enter this once — it will be remembered for all memories!"}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

