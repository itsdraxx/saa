"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { triviaQuestions } from "@/data/trivia";
import { Trophy, CheckCircle2, XCircle, ArrowRight, RotateCcw, Home } from "lucide-react";

export default function TriviaGame() {
  const [gameState, setGameState] = useState<"intro" | "playing" | "results">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQ = triviaQuestions[currentIndex];

  const handleStart = () => {
    setGameState("playing");
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (currentQ.options[index].isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < triviaQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setGameState("results");
    }
  };

  const getResultsFeedback = () => {
    const percentage = (score / triviaQuestions.length) * 100;
    if (percentage === 100) {
      return {
        badge: "🏆 Perfect Score!",
        title: "The Ultimate Family Historian",
        desc: "You know Mom & Dad better than they know themselves! You've paid attention to every detail of their 25-year journey.",
      };
    } else if (percentage >= 70) {
      return {
        badge: "🌟 Amazing Job!",
        title: "Family Insider",
        desc: "You know so much about their beautiful story and shared moments. A true pillar of the family circle!",
      };
    } else {
      return {
        badge: "❤️ Made with Love",
        title: "Warm Heart, Fresh Memories",
        desc: "Every answer is a chance to learn another beautiful anecdote from Mom and Dad's 25 years together!",
      };
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* INTRO SCREEN */}
      {gameState === "intro" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border-2 border-gold/40 bg-warm-white p-8 text-center shadow-xl sm:p-12"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-champagne/70 text-gold shadow-sm">
            <Trophy className="h-10 w-10 text-gold" />
          </div>

          <h2 className="mt-6 font-heading text-3xl font-semibold text-charcoal sm:text-4xl">
            25 Years of Family Trivia
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-soft-brown sm:text-base">
            How well do you remember the wedding traditions, hilarious kitchen experiments, holiday mishaps, and everyday habits that make Mom & Dad so special?
          </p>

          <div className="my-6 inline-flex items-center gap-3 rounded-full border border-warm-beige bg-champagne/30 px-5 py-2 text-xs text-soft-brown">
            <span>📝 {triviaQuestions.length} Questions</span>
            <span>•</span>
            <span>⏱️ No Time Limit</span>
            <span>•</span>
            <span>❤️ 100% Fun</span>
          </div>

          <div>
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-full bg-burgundy px-8 py-3.5 text-sm font-semibold text-warm-white shadow-md transition-all duration-300 hover:bg-deep-burgundy hover:shadow-lg active:scale-95"
            >
              <span>Begin the Quiz</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === "playing" && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border-2 border-gold/40 bg-warm-white p-6 shadow-xl sm:p-10"
        >
          {/* Progress Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-semibold text-soft-brown">
              <span className="text-burgundy uppercase tracking-wider">
                Question {currentIndex + 1} of {triviaQuestions.length}
              </span>
              <span>Score: {score}</span>
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-champagne/60">
              <div
                className="h-full bg-gradient-to-r from-gold to-burgundy transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / triviaQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question Text */}
          <span className="inline-block rounded-full bg-champagne/60 px-3 py-1 text-[11px] font-semibold text-soft-brown uppercase tracking-wider">
            {currentQ.category}
          </span>
          <h3 className="mt-3 font-heading text-2xl font-semibold text-charcoal sm:text-3xl">
            {currentQ.question}
          </h3>

          {/* Options */}
          <div className="mt-6 space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              let btnClass = "border-warm-beige bg-warm-white text-charcoal hover:border-gold hover:bg-champagne/20";

              if (isAnswered) {
                if (opt.isCorrect) {
                  btnClass = "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm";
                } else if (isSelected) {
                  btnClass = "border-rose-400 bg-rose-50 text-rose-950";
                } else {
                  btnClass = "border-warm-beige/30 bg-warm-white/40 text-charcoal/40";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left font-body text-sm font-medium transition-all duration-200 ${btnClass}`}
                >
                  <span>{opt.text}</span>
                  {isAnswered && opt.isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !opt.isCorrect && (
                    <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6 rounded-2xl border border-gold/40 bg-champagne/30 p-4"
              >
                <p className="font-heading text-base font-semibold text-burgundy">
                  {currentQ.options[selectedOption!].isCorrect ? "Correct! 🎉" : "Not quite! 😊"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-soft-brown">
                  {currentQ.explanation}
                </p>

                <div className="mt-4 text-right">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-2.5 text-xs font-semibold tracking-wider text-warm-white uppercase shadow-sm transition-all hover:bg-deep-burgundy active:scale-95"
                  >
                    <span>{currentIndex + 1 === triviaQuestions.length ? "See Final Score" : "Next Question"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* RESULTS SCREEN */}
      {gameState === "results" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border-2 border-gold/40 bg-warm-white p-8 text-center shadow-xl sm:p-12"
        >
          {(() => {
            const feedback = getResultsFeedback();
            return (
              <>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-champagne/80 text-4xl shadow-md">
                  {score >= 8 ? "👑" : score >= 5 ? "💖" : "✨"}
                </div>

                <div className="mt-4 inline-block rounded-full border border-gold/40 bg-warm-white px-4 py-1 text-xs font-semibold text-gold">
                  {feedback.badge}
                </div>

                <h2 className="mt-3 font-heading text-3xl font-semibold text-charcoal sm:text-4xl">
                  {feedback.title}
                </h2>

                <div className="my-6">
                  <span className="font-heading text-6xl font-bold text-burgundy">
                    {score}
                  </span>
                  <span className="font-heading text-2xl text-soft-brown">
                    {" "}/ {triviaQuestions.length}
                  </span>
                </div>

                <p className="mx-auto max-w-md font-body text-sm leading-relaxed text-soft-brown">
                  {feedback.desc}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleStart}
                    className="inline-flex items-center gap-2 rounded-full bg-burgundy px-7 py-3 text-sm font-medium text-warm-white shadow-md transition-all hover:bg-deep-burgundy active:scale-95"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Play Again</span>
                  </button>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white px-7 py-3 text-sm font-medium text-charcoal shadow-xs transition-all hover:bg-champagne/30 active:scale-95"
                  >
                    <Home className="h-4 w-4" />
                    <span>Back to Anniversary Home</span>
                  </Link>
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}

