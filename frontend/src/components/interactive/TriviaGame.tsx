"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { triviaQuestions } from "@/data/trivia";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Home,
  User,
  Medal,
  Lock,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  fetchTriviaLeaderboard,
  submitTriviaScore,
  checkTriviaStatus,
  getVisitorId,
} from "@/lib/api";
import type { TriviaLeaderboardEntry } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { translations, triviaTelugu } from "@/data/translations";

export default function TriviaGame() {
  const { language, isTelugu } = useLanguage();
  const t = translations[language].trivia;
  const [gameState, setGameState] = useState<"intro" | "playing" | "results">("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showReview, setShowReview] = useState(false);

  // Time tracking
  const [startTime, setStartTime] = useState<number>(0);

  // Name & Leaderboard state
  const [playerName, setPlayerName] = useState("");
  const [isScoreSubmitted, setIsScoreSubmitted] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<TriviaLeaderboardEntry[]>([]);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize & check if trivia was already answered / in progress
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedName = localStorage.getItem("saa_user_name");
        if (savedName) setPlayerName(savedName);

        // 1. Check if already completed locally
        const completed = localStorage.getItem("saa_trivia_completed") === "true";
        if (completed) {
          const savedScore = Number(localStorage.getItem("saa_trivia_score") || "0");
          const savedAnswers = localStorage.getItem("saa_trivia_answers");
          const savedRank = localStorage.getItem("saa_trivia_rank");
          const submitted = localStorage.getItem("saa_trivia_submitted") === "true";

          setScore(savedScore);
          if (savedAnswers) {
            try {
              setUserAnswers(JSON.parse(savedAnswers));
            } catch {}
          }
          if (savedRank) setUserRank(Number(savedRank));
          setIsScoreSubmitted(submitted);
          setGameState("results");
          return;
        }

        // 2. Check if in progress (to prevent refreshing to re-answer a question)
        const inProgress = localStorage.getItem("saa_trivia_in_progress");
        if (inProgress) {
          try {
            const parsed = JSON.parse(inProgress);
            if (typeof parsed.currentIndex === "number" && parsed.answers) {
              setCurrentIndex(parsed.currentIndex);
              setScore(parsed.score || 0);
              setUserAnswers(parsed.answers);
              if (parsed.answers[parsed.currentIndex] !== undefined) {
                setSelectedOption(parsed.answers[parsed.currentIndex]);
                setIsAnswered(true);
              }
              setStartTime(parsed.startTime || 0);
              setGameState("playing");
            }
          } catch {}
        }

        // 3. Query backend with visitor_id to prevent retakes across sessions
        const visitorId = getVisitorId();
        checkTriviaStatus(visitorId).then((status) => {
          if (status.completed && status.entry) {
            setScore(status.entry.score);
            setPlayerName(status.entry.player_name);
            setUserRank(status.rank || null);
            setIsScoreSubmitted(true);
            setGameState("results");
            try {
              localStorage.setItem("saa_trivia_completed", "true");
              localStorage.setItem("saa_trivia_score", String(status.entry.score));
              localStorage.setItem("saa_trivia_submitted", "true");
              if (status.rank) localStorage.setItem("saa_trivia_rank", String(status.rank));
            } catch {}
          }
        });
      } catch {}
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Fetch leaderboard when reaching results
  useEffect(() => {
    if (gameState === "results") {
      fetchTriviaLeaderboard().then((res) => {
        if (res.success) {
          setLeaderboard(res.leaderboard);
          setTotalPlayers(res.total_players);
        }
      });
    }
  }, [gameState]);

  const currentQ = triviaQuestions[currentIndex];

  const handleStart = () => {
    // If already completed, lock and do nothing
    if (localStorage.getItem("saa_trivia_completed") === "true") {
      setGameState("results");
      return;
    }

    setGameState("playing");
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setUserAnswers({});
    setIsScoreSubmitted(false);
    setUserRank(null);
    const start = Date.now();
    setStartTime(start);

    try {
      localStorage.setItem(
        "saa_trivia_in_progress",
        JSON.stringify({
          currentIndex: 0,
          score: 0,
          answers: {},
          startTime: start,
        })
      );
    } catch {}
  };

  const handleSelectOption = (index: number) => {
    // Strict lock: once answered, cannot re-answer this question!
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = currentQ.options[index].isCorrect;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(newScore);
    }

    const newAnswers = { ...userAnswers, [currentIndex]: index };
    setUserAnswers(newAnswers);

    // Persist immediately in localStorage so refreshing cannot undo the answer
    try {
      localStorage.setItem(
        "saa_trivia_in_progress",
        JSON.stringify({
          currentIndex,
          score: newScore,
          answers: newAnswers,
          startTime,
        })
      );
    } catch {}
  };

  const handleNext = () => {
    if (currentIndex + 1 < triviaQuestions.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      if (userAnswers[nextIndex] !== undefined) {
        setSelectedOption(userAnswers[nextIndex]);
        setIsAnswered(true);
      } else {
        setSelectedOption(null);
        setIsAnswered(false);
      }

      try {
        localStorage.setItem(
          "saa_trivia_in_progress",
          JSON.stringify({
            currentIndex: nextIndex,
            score,
            answers: userAnswers,
            startTime,
          })
        );
      } catch {}
    } else {
      // Completed all questions — lock in results permanently!
      setGameState("results");
      try {
        localStorage.setItem("saa_trivia_completed", "true");
        localStorage.setItem("saa_trivia_score", String(score));
        localStorage.setItem("saa_trivia_answers", JSON.stringify(userAnswers));
        localStorage.removeItem("saa_trivia_in_progress");
      } catch {}
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      localStorage.setItem("saa_user_name", playerName.trim());
    } catch {}

    const timeTaken = startTime > 0 ? Math.round((Date.now() - startTime) / 1000) : 60;
    const percentage = Math.round((score / triviaQuestions.length) * 100);

    const res = await submitTriviaScore({
      player_name: playerName.trim(),
      score,
      total: triviaQuestions.length,
      percentage,
      time_taken: timeTaken,
      visitor_id: getVisitorId(),
    });

    if (res.success) {
      setIsScoreSubmitted(true);
      if (res.rank) {
        setUserRank(res.rank);
        try {
          localStorage.setItem("saa_trivia_rank", String(res.rank));
        } catch {}
      }
      try {
        localStorage.setItem("saa_trivia_submitted", "true");
      } catch {}

      // Refresh leaderboard
      const lbRes = await fetchTriviaLeaderboard();
      if (lbRes.success) {
        setLeaderboard(lbRes.leaderboard);
        setTotalPlayers(lbRes.total_players);
      }
    }
    setIsSubmitting(false);
  };

  const getResultsFeedback = () => {
    const percentage = (score / triviaQuestions.length) * 100;
    if (percentage === 100) {
      return {
        badge: isTelugu ? "🏆 నూటికి నూరు శాతం!" : "🏆 Perfect Score!",
        title: t.perfectTitle,
        desc: isTelugu
          ? "అమ్మ, నాన్నల గురించి వారి కంటే మీకే ఎక్కువ తెలుసు! వారి 25 ఏళ్ల ప్రయాణంలోని ప్రతి చిన్న విషయాన్ని ఎంతో శ్రద్ధగా గుర్తుపెట్టుకున్నారు."
          : "You know Mom & Dad better than they know themselves! You've paid attention to every detail of their 25-year journey.",
      };
    } else if (percentage >= 70) {
      return {
        badge: isTelugu ? "🌟 అద్భుతమైన ప్రతిభ!" : "🌟 Amazing Job!",
        title: t.greatTitle,
        desc: isTelugu
          ? "వారి అందమైన కథ మరియు మధుర క్షణాల గురించి మీకు ఎంతో బాగా తెలుసు. కుటుంబానికి నిజమైన మూలస్తంభం!"
          : "You know so much about their beautiful story and shared moments. A true pillar of the family circle!",
      };
    } else {
      return {
        badge: isTelugu ? "❤️ ప్రేమతో కూడిన జ్ఞాపకాలు" : "❤️ Made with Love",
        title: t.goodTitle,
        desc: isTelugu
          ? "ప్రతి సమాధానం అమ్మ, నాన్నల 25 ఏళ్ల ప్రయాణం నుండి మరొక మధురమైన జ్ఞాపకాన్ని తెలుసుకునే అవకాశం!"
          : "Every answer is a chance to learn another beautiful anecdote from Mom and Dad's 25 years together!",
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
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-champagne/70 text-gold shadow-xs">
            <Trophy className="h-10 w-10 text-gold" />
          </div>

          <h2 className="mt-6 font-heading text-3xl font-semibold text-charcoal sm:text-4xl">
            {t.gameTitle}
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-soft-brown sm:text-base">
            {t.gameSubtitle}
          </p>

          <div className="my-6 inline-flex items-center gap-3 rounded-full border border-warm-beige bg-champagne/30 px-5 py-2 text-xs text-soft-brown">
            <span>📝 {isTelugu ? `${triviaQuestions.length} ప్రశ్నలు` : `${triviaQuestions.length} Questions`}</span>
            <span>•</span>
            <span>⏱️ {isTelugu ? "సమయ పరిమితి లేదు" : "No Time Limit"}</span>
            <span>•</span>
            <span>🔒 {t.oneTimeNotice || "One-time Attempt"}</span>
          </div>

          <div>
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-full bg-burgundy px-8 py-3.5 text-sm font-semibold text-warm-white shadow-md transition-all duration-300 hover:bg-deep-burgundy hover:shadow-lg active:scale-95 cursor-pointer"
            >
              <span>{t.beginQuiz}</span>
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
                {isTelugu
                  ? `${t.questionLabel} ${currentIndex + 1} / ${triviaQuestions.length}`
                  : `Question ${currentIndex + 1} of ${triviaQuestions.length}`}
              </span>
              <span>{t.scoreLabel}: {score}</span>
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
          <div className="flex items-center justify-between">
            <span className="inline-block rounded-full bg-champagne/60 px-3 py-1 text-[11px] font-semibold text-soft-brown uppercase tracking-wider">
              {isTelugu && triviaTelugu[currentQ.id]?.category ? triviaTelugu[currentQ.id].category : currentQ.category}
            </span>
            {isAnswered && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warm-beige/40 px-2.5 py-0.5 text-[11px] font-semibold text-soft-brown">
                <Lock className="h-3 w-3" /> {t.answerLocked}
              </span>
            )}
          </div>

          <h3 className="mt-3 font-heading text-2xl font-semibold text-charcoal sm:text-3xl">
            {isTelugu && triviaTelugu[currentQ.id]?.question ? triviaTelugu[currentQ.id].question : currentQ.question}
          </h3>

          {/* Options */}
          <div className="mt-6 space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const optText = (isTelugu && triviaTelugu[currentQ.id]?.options?.[idx])
                ? triviaTelugu[currentQ.id].options[idx]
                : opt.text;
              let btnClass = "border-warm-beige bg-warm-white text-charcoal hover:border-gold hover:bg-champagne/20 cursor-pointer";

              if (isAnswered) {
                if (opt.isCorrect) {
                  btnClass = "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-xs cursor-not-allowed";
                } else if (isSelected) {
                  btnClass = "border-rose-400 bg-rose-50 text-rose-950 cursor-not-allowed";
                } else {
                  btnClass = "border-warm-beige/30 bg-warm-white/40 text-charcoal/40 cursor-not-allowed";
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
                  <span>{optText}</span>
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
                  {currentQ.options[selectedOption!].isCorrect ? t.correctBanner : t.incorrectBanner}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-soft-brown">
                  {isTelugu && triviaTelugu[currentQ.id]?.explanation ? triviaTelugu[currentQ.id].explanation : currentQ.explanation}
                </p>

                <div className="mt-4 text-right">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-2.5 text-xs font-semibold tracking-wider text-warm-white uppercase shadow-xs transition-all hover:bg-deep-burgundy active:scale-95 cursor-pointer"
                  >
                    <span>{currentIndex + 1 === triviaQuestions.length ? t.seeFinalScore : t.nextQuestion}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* RESULTS SCREEN (Locked: Cannot re-answer) */}
      {gameState === "results" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border-2 border-gold/40 bg-warm-white p-8 text-center shadow-xl sm:p-12"
        >
          {(() => {
            const feedback = getResultsFeedback();
            return (
              <>
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gold/30 to-champagne/80 text-4xl shadow-md">
                  {score >= 10 ? "👑" : score >= 7 ? "💖" : "✨"}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <div className="rounded-full border border-gold/40 bg-warm-white px-4 py-1 text-xs font-semibold text-gold">
                    {feedback.badge}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
                    <Lock className="h-3.5 w-3.5" />
                    <span>{t.answerLocked}</span>
                  </div>
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

                {/* Score Submission Form or Submitted Rank Badge */}
                <div className="mt-6 mx-auto max-w-md">
                  {!isScoreSubmitted ? (
                    <form
                      onSubmit={handleSubmitScore}
                      className="rounded-2xl border-2 border-gold/40 bg-champagne/30 p-4 sm:p-5 text-left"
                    >
                      <div className="flex items-center gap-2 text-burgundy font-semibold text-sm">
                        <Trophy className="h-4 w-4 text-gold shrink-0" />
                        <span>{t.addNameToLeaderboard}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder={t.playerNamePlaceholder}
                            maxLength={35}
                            required
                            className="w-full rounded-xl border border-warm-beige bg-warm-white px-3.5 py-2.5 text-xs sm:text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:outline-hidden"
                          />
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-soft-brown/40 pointer-events-none" />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting || !playerName.trim()}
                          className="rounded-xl bg-burgundy px-4 py-2.5 text-xs sm:text-sm font-semibold text-warm-white hover:bg-deep-burgundy transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                        >
                          {isSubmitting ? (t.savingRank || "Saving...") : (t.submitRank || "Submit Rank")}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-2xl border border-emerald-300 bg-emerald-50/80 p-4 text-center shadow-2xs">
                      <p className="font-heading text-lg font-bold text-emerald-800">
                        {isTelugu ? `🎉 బోర్డులో మీ ర్యాంక్: #${userRank || 1}!` : `🎉 Rank #${userRank || 1} on the Board!`}
                      </p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        {isTelugu ? "మీ స్కోరు ఈ పేరుతో నమోదైంది: " : "Your score is locked in as "}
                        <span className="font-semibold">{playerName}</span>!
                      </p>
                    </div>
                  )}
                </div>

                {/* Family Leaderboard */}
                {leaderboard.length > 0 && (
                  <div className="mt-8 rounded-2xl border border-warm-beige/80 bg-warm-white p-4 sm:p-6 text-left shadow-2xs">
                    <div className="flex items-center justify-between border-b border-warm-beige/50 pb-3">
                      <div className="flex items-center gap-2">
                        <Medal className="h-5 w-5 text-gold" />
                        <h3 className="font-heading text-lg font-bold text-charcoal">
                          {t.familyLeaderboard}
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold text-soft-brown/70 bg-champagne/60 px-2.5 py-0.5 rounded-full">
                        {totalPlayers} {totalPlayers === 1 ? t.playerSingle : t.playersCount}
                      </span>
                    </div>

                    <div className="mt-3 divide-y divide-warm-beige/30 max-h-60 overflow-y-auto pr-1">
                      {leaderboard.map((entry, idx) => {
                        const rankNumber = idx + 1;
                        const medal =
                          rankNumber === 1 ? "🥇" : rankNumber === 2 ? "🥈" : rankNumber === 3 ? "🥉" : `#${rankNumber}`;
                        const isCurrent = entry.player_name.toLowerCase() === playerName.trim().toLowerCase();

                        return (
                          <div
                            key={entry.id || idx}
                            className={`flex items-center justify-between py-2 text-xs sm:text-sm ${
                              isCurrent ? "font-bold text-burgundy bg-peach-50/60 rounded-lg px-2" : "text-charcoal"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="w-6 text-center font-bold text-sm shrink-0">
                                {medal}
                              </span>
                              <span className="truncate max-w-[180px] sm:max-w-[240px]">
                                {entry.player_name}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-semibold text-burgundy bg-peach-100 px-1.5 py-0.5 rounded-full shrink-0">
                                  {isTelugu ? "మీరు" : "You"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-semibold text-soft-brown">
                                {entry.score}/{entry.total}
                              </span>
                              <span className="text-[11px] text-soft-brown/60">
                                ({Math.round(entry.percentage)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* REVIEW YOUR ANSWERS ACCORDION (Locked, read-only) */}
                <div className="mt-8 text-left">
                  <button
                    type="button"
                    onClick={() => setShowReview(!showReview)}
                    className="flex w-full items-center justify-between rounded-2xl border border-warm-beige/80 bg-champagne/30 px-5 py-3 text-xs sm:text-sm font-semibold text-charcoal hover:bg-champagne/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-burgundy" />
                      <span>{showReview ? (t.hideReviewButton || "Hide Your Locked Answers") : (t.reviewAnswersButton || "Review All Answers & Memories (Read-only)")}</span>
                    </div>
                    {showReview ? <ChevronUp className="h-4 w-4 text-soft-brown" /> : <ChevronDown className="h-4 w-4 text-soft-brown" />}
                  </button>

                  <AnimatePresence>
                    {showReview && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-4 overflow-hidden"
                      >
                        {triviaQuestions.map((q, qIdx) => {
                          const chosenIdx = userAnswers[qIdx];
                          const hasChosen = chosenIdx !== undefined;
                          const wasCorrect = hasChosen && q.options[chosenIdx]?.isCorrect;
                          const teRevQ = isTelugu ? triviaTelugu[q.id] : undefined;
                          const revQuestion = teRevQ?.question || q.question;
                          const revCategory = teRevQ?.category || q.category;
                          const revExplanation = teRevQ?.explanation || q.explanation;

                          return (
                            <div
                              key={q.id}
                              className="rounded-2xl border border-warm-beige/70 bg-warm-white p-4 text-xs sm:text-sm shadow-2xs"
                            >
                              <div className="flex items-center justify-between border-b border-warm-beige/40 pb-2">
                                <span className="text-[11px] font-semibold text-burgundy uppercase">
                                  {isTelugu ? `${t.questionLabel} ${qIdx + 1}` : `Question ${qIdx + 1}`} • {revCategory}
                                </span>
                                {hasChosen ? (
                                  wasCorrect ? (
                                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                      <CheckCircle2 className="h-3.5 w-3.5" /> {isTelugu ? "సరిగ్గా సమాధానం ఇచ్చారు" : "Correct"}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                                      <XCircle className="h-3.5 w-3.5" /> {isTelugu ? "తప్పయింది" : "Missed"}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-soft-brown/60">{isTelugu ? "సమాధానం ఇవ్వలేదు" : "Unanswered"}</span>
                                )}
                              </div>

                              <p className="mt-2 font-heading text-sm sm:text-base font-semibold text-charcoal">
                                {revQuestion}
                              </p>

                              <div className="mt-3 space-y-1.5">
                                {q.options.map((opt, optIdx) => {
                                  const isSelectedByPlayer = chosenIdx === optIdx;
                                  const optRevText = teRevQ?.options?.[optIdx] || opt.text;
                                  let rowStyle = "bg-champagne/10 border-warm-beige/30 text-charcoal/70";

                                  if (opt.isCorrect) {
                                    rowStyle = "bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold";
                                  } else if (isSelectedByPlayer && !opt.isCorrect) {
                                    rowStyle = "bg-rose-50 border-rose-300 text-rose-950 line-through";
                                  }

                                  return (
                                    <div
                                      key={optIdx}
                                      className={`flex items-center justify-between rounded-xl border px-3 py-2 ${rowStyle}`}
                                    >
                                      <span>{optRevText}</span>
                                      {opt.isCorrect && (
                                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                          {isTelugu ? "✓ సరైన సమాధానం" : "✓ Correct Answer"}
                                        </span>
                                      )}
                                      {isSelectedByPlayer && !opt.isCorrect && (
                                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                                          {isTelugu ? "మీరు ఎంచుకున్నది" : "Your Choice"}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              <p className="mt-2.5 text-[11px] leading-relaxed text-soft-brown border-t border-warm-beige/30 pt-2">
                                💡 <span className="font-semibold">{isTelugu ? "జ్ఞాపకం:" : "Memory note:"}</span> {revExplanation}
                              </p>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Actions: NO "Play Again" — locked permanently */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-warm-beige/80 bg-champagne/40 px-6 py-2.5 text-xs font-semibold text-soft-brown shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{t.triviaCompletedPill || "Trivia Completed • Scores Locked"}</span>
                  </div>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white px-7 py-3 text-sm font-medium text-charcoal shadow-2xs transition-all hover:bg-champagne/30 active:scale-95"
                  >
                    <Home className="h-4 w-4" />
                    <span>{t.backHome || "Back to Anniversary Home"}</span>
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
