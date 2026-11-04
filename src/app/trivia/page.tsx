import Link from "next/link";
import TriviaGame from "@/components/interactive/TriviaGame";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Family Trivia Quiz — 25 Years of Us",
  description: "Test your knowledge of Mom & Dad's 25-year wedding journey with interactive multiple-choice questions.",
};

export default function TriviaPage() {
  return (
    <div className="min-h-screen bg-ivory py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white px-5 py-2 text-xs font-medium text-charcoal shadow-2xs transition-all hover:bg-champagne/40 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Anniversary Home</span>
          </Link>
        </div>

        {/* The Trivia Game Component */}
        <TriviaGame />
      </div>
    </div>
  );
}

