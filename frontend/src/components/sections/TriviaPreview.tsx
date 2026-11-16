"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import SectionHeading from "@/components/ui/SectionHeading";
import { triviaQuestions } from "@/data/trivia";
import { CheckCircle2, XCircle, ArrowRight, HelpCircle, Trophy } from "lucide-react";

export default function TriviaPreview() {
  const sampleQuestion = triviaQuestions[2] || triviaQuestions[0]; // The funny restaurant question!
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const handleSelect = (index: number) => {
    if (answered) return;
    setSelectedOption(index);
    setAnswered(true);
  };

  const isCorrect = selectedOption !== null && sampleQuestion.options[selectedOption].isCorrect;

  return (
    <section id="trivia" className="w-full bg-champagne/30 py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl text-center">
        <SectionHeading
          title="Family Trivia"
          subtitle="Think you know the anniversary couple best? Take a guess at this memory, then challenge yourself with the full quiz!"
        />

        {/* Quiz Sample Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 overflow-hidden rounded-3xl border-2 border-gold/40 bg-warm-white p-6 text-left shadow-lg sm:p-8"
        >
          {/* Question Tag */}
          <div className="flex items-center justify-between border-b border-warm-beige/60 pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-burgundy uppercase tracking-wider">
              <HelpCircle className="h-4 w-4" />
              <span>Sample Question • {sampleQuestion.category}</span>
            </div>
            <span className="rounded-full bg-champagne/70 px-3 py-1 text-xs text-soft-brown">
              1 of {triviaQuestions.length} Questions
            </span>
          </div>

          {/* Question Title */}
          <h3 className="mt-6 font-heading text-2xl font-semibold text-charcoal sm:text-3xl">
            {sampleQuestion.question}
          </h3>

          {/* Options */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sampleQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              let btnClass = "border-warm-beige bg-warm-white text-charcoal hover:border-gold hover:bg-champagne/20";

              if (answered) {
                if (option.isCorrect) {
                  btnClass = "border-emerald-500 bg-emerald-50 text-emerald-900";
                } else if (isSelected) {
                  btnClass = "border-rose-400 bg-rose-50 text-rose-900";
                } else {
                  btnClass = "border-warm-beige/40 opacity-50 bg-warm-white text-charcoal";
                }
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(index)}
                  disabled={answered}
                  className={`flex items-center justify-between rounded-2xl border-2 p-4 text-left font-body text-sm font-medium transition-all duration-200 ${btnClass}`}
                >
                  <span>{option.text}</span>
                  {answered && option.isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  )}
                  {answered && isSelected && !option.isCorrect && (
                    <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Reveal Feedback */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.4 }}
                className="mt-6 overflow-hidden rounded-2xl border border-warm-beige bg-champagne/40 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{isCorrect ? "🎉" : "😅"}</span>
                  <p className="font-heading text-lg font-semibold text-burgundy">
                    {isCorrect ? "Spot on!" : "Nice try!"}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-soft-brown">
                  {sampleQuestion.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* CTA to Full Game */}
        <div className="mt-10">
          <Link
            href="/trivia"
            className="inline-flex items-center gap-2 rounded-full bg-burgundy px-8 py-3.5 text-sm font-medium text-warm-white shadow-md transition-all duration-300 hover:bg-deep-burgundy hover:shadow-lg active:scale-95"
          >
            <Trophy className="h-4 w-4 text-gold" />
            <span>Play the Full Family Quiz ({triviaQuestions.length} Questions)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

