"use client";

import Link from "next/link";
import TriviaGame from "@/components/interactive/TriviaGame";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TriviaPage() {
  const { isTelugu } = useLanguage();

  return (
    <div className="min-h-screen bg-ivory py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white px-5 py-2 text-xs font-medium text-charcoal shadow-2xs transition-all hover:bg-champagne/40 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isTelugu ? "తిరిగి హోమ్‌కి వెళ్ళండి" : "Back to Anniversary Home"}</span>
          </Link>
        </div>

        {/* The Trivia Game Component */}
        <TriviaGame />
      </div>
    </div>
  );
}

