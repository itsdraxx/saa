"use client";

import { useState, useEffect, useRef } from "react";
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
  Volume2,
  VolumeX,
  Flame,
  Sparkles,
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

interface TriviaGameProps {
  autoStart?: boolean;
  embedded?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Pure Web Audio API Sound Synthesizer (Zero asset downloads)
// ─────────────────────────────────────────────────────────────
function playTone(freq: number, type: OscillatorType, duration: number, delay = 0, gain = 0.15) {
  try {
    if (typeof window === "undefined") return;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

    gainNode.gain.setValueAtTime(gain, ctx.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch {}
}

function playCorrectChime() {
  playTone(523.25, "sine", 0.12, 0, 0.18); // C5
  playTone(659.25, "sine", 0.12, 0.08, 0.18); // E5
  playTone(783.99, "sine", 0.3, 0.16, 0.22); // G5
  playTone(1046.5, "sine", 0.4, 0.26, 0.15); // C6
}

function playIncorrectBloop() {
  playTone(261.63, "triangle", 0.15, 0, 0.15); // C4
  playTone(220.0, "triangle", 0.25, 0.1, 0.15); // A3
}

function playCelebrationFanfare() {
  playTone(523.25, "sine", 0.14, 0, 0.2);
  playTone(659.25, "sine", 0.14, 0.1, 0.2);
  playTone(783.99, "sine", 0.16, 0.2, 0.22);
  playTone(1046.5, "sine", 0.45, 0.32, 0.25);
  playTone(1318.5, "sine", 0.55, 0.45, 0.2);
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function TriviaGame({ autoStart = true, embedded = false }: TriviaGameProps) {
  const { language, isTelugu } = useLanguage();
  const t = translations[language].trivia;
  const [gameState, setGameState] = useState<"intro" | "playing" | "results">(
    autoStart ? "playing" : "intro"
  );
  const [questions, setQuestions] = useState(triviaQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showReview, setShowReview] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Time tracking
  const [startTime, setStartTime] = useState<number>(0);

  // Name & Leaderboard state
  const [playerName, setPlayerName] = useState("");
  const [isScoreSubmitted, setIsScoreSubmitted] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [userRank, setUserRank] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<TriviaLeaderboardEntry[]>([]);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Initialize & check if trivia was already answered / in progress
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const soundPref = localStorage.getItem("saa_sound_enabled");
        if (soundPref !== null) setIsSoundEnabled(soundPref === "true");

        const savedName = localStorage.getItem("saa_user_name");
        if (savedName) setPlayerName(savedName);
        setStartTime((prev) => (prev > 0 ? prev : Date.now()));

        // Restore or initialize randomized question order
        const savedOrder = localStorage.getItem("saa_trivia_order");
        if (savedOrder) {
          try {
            const idOrder: number[] = JSON.parse(savedOrder);
            if (Array.isArray(idOrder) && idOrder.length === triviaQuestions.length) {
              const qMap = new Map(triviaQuestions.map((q) => [q.id, q]));
              const restored = idOrder.map((id) => qMap.get(id)).filter(Boolean) as typeof triviaQuestions;
              if (restored.length === triviaQuestions.length) {
                setQuestions(restored);
              } else {
                const shuffled = shuffleArray(triviaQuestions);
                setQuestions(shuffled);
                localStorage.setItem("saa_trivia_order", JSON.stringify(shuffled.map((q) => q.id)));
              }
            } else {
              const shuffled = shuffleArray(triviaQuestions);
              setQuestions(shuffled);
              localStorage.setItem("saa_trivia_order", JSON.stringify(shuffled.map((q) => q.id)));
            }
          } catch {
            const shuffled = shuffleArray(triviaQuestions);
            setQuestions(shuffled);
            localStorage.setItem("saa_trivia_order", JSON.stringify(shuffled.map((q) => q.id)));
          }
        } else {
          const shuffled = shuffleArray(triviaQuestions);
          setQuestions(shuffled);
          localStorage.setItem("saa_trivia_order", JSON.stringify(shuffled.map((q) => q.id)));
        }

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

        // 2. Check if in progress (to restore answers across accidental refresh)
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
              setStartTime(parsed.startTime || Date.now());
              setGameState("playing");
            }
          } catch {}
        }

        // 3. Query backend with visitor_id to detect if completed previously
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
      if (isSoundEnabled) {
        playCelebrationFanfare();
      }
    }
  }, [gameState, isSoundEnabled]);

  const scrollToCardTop = () => {
    try {
      const card = document.getElementById("trivia-card");
      if (card) {
        const yOffset = -75; // Account for fixed navigation bar
        const y = card.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      }
    } catch {}
  };

  const submitScoreWithName = async (rawName: string, customScore?: number) => {
    const cleanName = rawName.trim();
    if (!cleanName || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccessMsg("");

    try {
      localStorage.setItem("saa_user_name", cleanName);
    } catch {}

    const effectiveScore = typeof customScore === "number" ? customScore : score;
    const timeTaken = startTime > 0 ? Math.round((Date.now() - startTime) / 1000) : 45;
    const percentage = Math.round((effectiveScore / questions.length) * 100);

    try {
      const res = await submitTriviaScore({
        player_name: cleanName,
        score: effectiveScore,
        total: questions.length,
        percentage,
        time_taken: timeTaken,
        visitor_id: getVisitorId(),
      });

      if (res && res.success) {
        setIsScoreSubmitted(true);
        setIsEditingName(false);
        const assignedRank = res.rank || 1;
        setUserRank(assignedRank);
        setSubmitSuccessMsg(
          isTelugu
            ? `🎉 అద్భుతం ${cleanName}! మీ స్కోరు నమోదైంది. మీ ర్యాంక్: #${assignedRank}`
            : `🎉 Great job ${cleanName}! Your score is locked on the board at Rank #${assignedRank}!`
        );

        try {
          localStorage.setItem("saa_trivia_rank", String(assignedRank));
          localStorage.setItem("saa_trivia_submitted", "true");
        } catch {}

        // Immediately refresh leaderboard
        const lbRes = await fetchTriviaLeaderboard();
        if (lbRes.success) {
          setLeaderboard(lbRes.leaderboard);
          setTotalPlayers(lbRes.total_players);
        }
      } else {
        setSubmitError(
          res?.error ||
            (isTelugu
              ? "స్కోరు నమోదు చేయడంలో సమస్య వచ్చింది. దయచేసి మళ్లీ ప్రయత్నించండి."
              : "Failed to submit. Please try again.")
        );
      }
    } catch {
      setSubmitError(
        isTelugu
          ? "కనెక్షన్ సమస్య. దయచేసి మళ్లీ ప్రయత్నించండి."
          : "Connection error. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSound = () => {
    const nextVal = !isSoundEnabled;
    setIsSoundEnabled(nextVal);
    try {
      localStorage.setItem("saa_sound_enabled", String(nextVal));
    } catch {}
  };

  const currentQ = questions[currentIndex] || questions[0];

  const handleStart = () => {
    if (localStorage.getItem("saa_trivia_completed") === "true") {
      setGameState("results");
      return;
    }

    const shuffled = shuffleArray(triviaQuestions);
    setQuestions(shuffled);
    try {
      localStorage.setItem("saa_trivia_order", JSON.stringify(shuffled.map((q) => q.id)));
    } catch {}

    setGameState("playing");
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
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

    scrollToCardTop();
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    const isCorrect = currentQ.options[index]?.isCorrect;
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(newScore);
      setStreak((prev) => prev + 1);
      if (isSoundEnabled) playCorrectChime();
    } else {
      setStreak(0);
      if (isSoundEnabled) playIncorrectBloop();
    }

    const newAnswers = { ...userAnswers, [currentIndex]: index };
    setUserAnswers(newAnswers);

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

    // Smoothly ensure the action area is in view if on an extra small screen
    setTimeout(() => {
      try {
        const nextAction = document.getElementById("trivia-inline-action");
        if (nextAction) {
          nextAction.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      } catch {}
    }, 80);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
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

      scrollToCardTop();
    } else {
      // Completed all questions — lock in results permanently!
      setGameState("results");
      try {
        localStorage.setItem("saa_trivia_completed", "true");
        localStorage.setItem("saa_trivia_score", String(score));
        localStorage.setItem("saa_trivia_answers", JSON.stringify(userAnswers));
        localStorage.removeItem("saa_trivia_in_progress");
      } catch {}

      scrollToCardTop();

      // If name was already given (e.g. from wishes, comments or earlier), auto-submit immediately!
      const existingName =
        playerName.trim() ||
        (typeof window !== "undefined" ? localStorage.getItem("saa_user_name")?.trim() : "");
      if (existingName && existingName.length >= 1) {
        if (!playerName) setPlayerName(existingName);
        submitScoreWithName(existingName, score);
      }
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || isSubmitting) return;
    await submitScoreWithName(playerName);
  };

  const getResultsFeedback = () => {
    const percentage = Math.round((score / questions.length) * 100);
    if (percentage === 100) {
      return {
        badge: isTelugu ? "👑 రాయల్ ఫ్యామిలీ హిస్టోరియన్!" : "👑 Royal Family Historian!",
        title: isTelugu ? "నూటికి నూరు శాతం పర్ఫెక్ట్!" : "100% Perfect Memory!",
        desc: isTelugu
          ? "మీరు ఆది & సత్య గురించి ప్రతి చిన్న జ్ఞాపకాన్ని గుర్తుపెట్టుకున్నారు! మీరు నిజంగా మా కుటుంబానికి గుండెకాయ!"
          : "You know Adhi & Satya inside out! Every wedding tradition, funny quirk, and joyful memory is alive in your heart.",
      };
    } else if (percentage >= 65) {
      return {
        badge: isTelugu ? "💎 ఫ్యామిలీ ఇన్‌సైడర్!" : "💎 Family Insider!",
        title: isTelugu ? "అద్భుతమైన స్కోరు!" : "Outstanding Score!",
        desc: isTelugu
          ? "మీకు ఆది & సత్యతో ఎంతో అందమైన జ్ఞాపకాలు ఉన్నాయి! దాదాపు అన్ని ప్రశ్నలకు సరైన సమాధానం చెప్పారు!"
          : "You clearly share a very special bond with Adhi & Satya. Almost every memory hit the bullseye!",
      };
    } else {
      return {
        badge: isTelugu ? "❤️ ఆత్మీయ బంధువు!" : "❤️ Cherished Loved One!",
        title: isTelugu ? "ప్రేమతో కూడిన జ్ఞాపకాలు!" : "Memories Made with Love!",
        desc: isTelugu
          ? "స్కోరు ఎంతైనా, ఈ 25 ఏళ్ల వేడుకలో మీ ప్రేమ మరియు ఆశీస్సులు ఎంతో అమూల్యమైనవి!"
          : "It's the love that counts! Re-reading these 25 years of memories brings smiles to the whole family.",
      };
    }
  };

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div
      ref={cardRef}
      id="trivia-card"
      className="mx-auto w-full max-w-2xl"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. INTRO SCREEN (Optional, if autoStart=false)
          ───────────────────────────────────────────────────────────── */}
      {gameState === "intro" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-3xl border-2 border-gold/50 bg-gradient-to-b from-warm-white via-warm-white to-peach-50/40 p-8 text-center shadow-xl sm:p-12"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-peach-100 to-champagne text-gold shadow-md ring-2 ring-gold/40">
            <Trophy className="h-10 w-10 text-gold" />
          </div>

          <h2 className="mt-6 font-heading text-3xl font-bold text-charcoal sm:text-4xl">
            {t.gameTitle}
          </h2>
          <p className="mt-3 font-body text-sm leading-relaxed text-soft-brown sm:text-base max-w-xl mx-auto">
            {t.gameSubtitle}
          </p>

          <div className="my-6 inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 rounded-full border border-warm-beige bg-champagne/40 px-5 py-2 text-xs text-soft-brown font-medium">
            <span>📝 {isTelugu ? `${questions.length} జ్ఞాపకాలు` : `${questions.length} Memories`}</span>
            <span>•</span>
            <span>🔒 {t.oneTimeNotice || "One-time Attempt"}</span>
          </div>

          <div>
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-burgundy to-deep-burgundy px-8 py-3.5 text-sm font-bold text-warm-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer"
            >
              <span>{t.beginQuiz}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. PLAYING SCREEN (Compact, Refined, Unified Question Card)
          ───────────────────────────────────────────────────────────── */}
      {gameState === "playing" && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-b from-warm-white via-warm-white to-peach-50/20 p-4 sm:p-5 shadow-lg text-left"
        >
          {/* Top Control Bar: Milestone Pearls & Status Badges */}
          <div className="flex items-center justify-between border-b border-warm-beige/50 pb-2.5 flex-wrap gap-2">
            {/* Milestone Diamond Pearls (Compact) */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {questions.map((q, idx) => {
                const isPast = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                const userChoice = userAnswers[idx];
                const wasCorrect = userChoice !== undefined && q.options[userChoice]?.isCorrect;

                return (
                  <div
                    key={q.id}
                    title={`Question ${idx + 1}`}
                    className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all duration-200 ${
                      isPast
                        ? wasCorrect
                          ? "bg-emerald-500 text-white shadow-2xs scale-95"
                          : "bg-rose-500 text-white shadow-2xs scale-95"
                        : isCurrent
                        ? "border-2 border-gold bg-gradient-to-br from-champagne to-peach-100 text-burgundy shadow-xs ring-1 ring-gold/40 font-extrabold scale-105"
                        : "border border-warm-beige/70 bg-warm-white/70 text-soft-brown/40"
                    }`}
                  >
                    {isPast ? (wasCorrect ? "✓" : "✗") : idx + 1}
                  </div>
                );
              })}
            </div>

            {/* Right Status Badges */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {streak >= 2 && (
                <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                  <Flame className="h-2.5 w-2.5 fill-white" />
                  <span>{streak} Streak!</span>
                </div>
              )}

              <div className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-champagne/60 px-2.5 py-0.5 text-[11px] font-bold text-burgundy">
                <Sparkles className="h-3 w-3 text-gold" />
                <span>
                  {t.scoreLabel}: {score}
                </span>
              </div>

              <button
                type="button"
                onClick={toggleSound}
                className="flex h-7 w-7 items-center justify-center rounded-full border border-warm-beige bg-warm-white text-soft-brown hover:text-burgundy hover:bg-champagne/40 transition-colors cursor-pointer"
                title={isSoundEnabled ? "Mute Game Sound" : "Enable Game Sound"}
                aria-label="Toggle game audio"
              >
                {isSoundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Question Tag & Number */}
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-full border border-warm-beige/80 bg-peach-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-burgundy">
              {isTelugu && triviaTelugu[currentQ.id]?.category
                ? triviaTelugu[currentQ.id].category
                : currentQ.category}
            </span>

            <span className="text-[11px] font-semibold text-soft-brown/80">
              {isTelugu
                ? `${t.questionLabel} ${currentIndex + 1} / ${questions.length}`
                : `Question ${currentIndex + 1} of ${questions.length}`}
            </span>
          </div>

          {/* Compact Question Heading */}
          <h3 className="mt-1.5 mb-3 font-heading text-sm sm:text-base md:text-lg font-bold text-charcoal leading-snug">
            {isTelugu && triviaTelugu[currentQ.id]?.question
              ? triviaTelugu[currentQ.id].question
              : currentQ.question}
          </h3>

          {/* 4 Compact Interactive Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const letter = optionLetters[idx] || "•";
              const optText =
                isTelugu && triviaTelugu[currentQ.id]?.options?.[idx]
                  ? triviaTelugu[currentQ.id].options[idx]
                  : opt.text;

              let cardStyle =
                "border-warm-beige/80 bg-warm-white hover:border-gold hover:bg-champagne/20 cursor-pointer text-charcoal";
              let badgeStyle = "border-warm-beige bg-peach-50 text-burgundy";

              if (isAnswered) {
                if (opt.isCorrect) {
                  cardStyle =
                    "border-emerald-500 bg-emerald-50/90 text-emerald-950 font-semibold shadow-2xs ring-1 ring-emerald-400/50 cursor-default";
                  badgeStyle = "border-emerald-500 bg-emerald-600 text-white";
                } else if (isSelected && !opt.isCorrect) {
                  cardStyle =
                    "border-rose-400 bg-rose-50/90 text-rose-950 shadow-2xs cursor-default";
                  badgeStyle = "border-rose-400 bg-rose-500 text-white";
                } else {
                  cardStyle =
                    "border-warm-beige/30 bg-warm-white/40 text-charcoal/40 cursor-default opacity-50";
                  badgeStyle = "border-warm-beige/30 bg-warm-beige/20 text-charcoal/40";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`group relative flex items-center gap-2.5 rounded-xl border p-2.5 sm:p-3 text-left font-body text-xs sm:text-sm font-medium transition-all duration-150 active:scale-98 ${cardStyle}`}
                >
                  <div
                    className={`flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md border text-[10px] sm:text-xs font-bold transition-all ${badgeStyle}`}
                  >
                    {letter}
                  </div>

                  <span className="flex-1 leading-snug">{optText}</span>

                  {isAnswered && opt.isCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                  {isAnswered && isSelected && !opt.isCorrect && (
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. COMPACT INLINE MEMORY & SINGLE "NEXT MEMORY" ACTION
              (Only ONE single, elegant Next button! Clean, unified & compact)
              ───────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                id="trivia-inline-action"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
                className="mt-3 rounded-xl border border-gold/40 bg-gradient-to-r from-champagne/40 via-peach-50/50 to-champagne/30 p-3 sm:p-3.5 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Memory Story / Explanation */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm">
                        {currentQ.options[selectedOption!]?.isCorrect ? "🎉" : "💡"}
                      </span>
                      <span className="font-heading text-xs font-bold text-burgundy">
                        {currentQ.options[selectedOption!]?.isCorrect
                          ? t.correctBanner
                          : t.incorrectBanner}
                      </span>
                      <span className="text-[10px] text-soft-brown/70 font-medium">
                        • {t.answerLocked}
                      </span>
                    </div>
                    <p className="font-body text-[11px] sm:text-xs leading-relaxed text-charcoal/85 italic">
                      {isTelugu && triviaTelugu[currentQ.id]?.explanation
                        ? triviaTelugu[currentQ.id].explanation
                        : currentQ.explanation}
                    </p>
                  </div>

                  {/* Right: The ONLY Next Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-burgundy to-deep-burgundy px-5 py-2 text-xs sm:text-sm font-bold text-warm-white shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ring-1 ring-gold/40 shrink-0"
                  >
                    <span>
                      {currentIndex + 1 === questions.length
                        ? t.seeFinalScore
                        : isTelugu
                        ? "తర్వాతి జ్ఞాపకం →"
                        : "Next Memory →"}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. GRAND FINALE / RESULTS & LEADERBOARD SCREEN
          ───────────────────────────────────────────────────────────── */}
      {gameState === "results" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border-2 border-gold/50 bg-gradient-to-b from-warm-white via-warm-white to-peach-50/40 p-6 sm:p-10 text-center shadow-2xl"
        >
          {(() => {
            const feedback = getResultsFeedback();
            const percentage = Math.round((score / questions.length) * 100);

            return (
              <>
                {/* Royal Crown / Emblem */}
                <div className="mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-tr from-peach-100 via-champagne to-peach-100 text-3xl sm:text-4xl shadow-md ring-4 ring-gold/30">
                  {score === questions.length ? "👑" : score >= Math.ceil(questions.length * 0.6) ? "💎" : "❤️"}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <div className="rounded-full border border-gold/50 bg-champagne/60 px-4 py-1 text-xs font-bold text-burgundy shadow-2xs">
                    {feedback.badge}
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                    <Lock className="h-3 w-3" />
                    <span>{t.answerLocked}</span>
                  </div>
                </div>

                <h2 className="mt-3 font-heading text-2xl sm:text-4xl font-bold text-charcoal">
                  {feedback.title}
                </h2>

                {/* Score Counter */}
                <div className="my-5 flex items-baseline justify-center gap-2">
                  <span className="font-heading text-5xl sm:text-6xl font-extrabold text-burgundy drop-shadow-xs">
                    {score}
                  </span>
                  <span className="font-heading text-xl sm:text-2xl text-soft-brown font-semibold">
                    / {questions.length}
                  </span>
                  <span className="ml-2 rounded-full bg-champagne/80 px-2.5 py-0.5 text-xs font-bold text-burgundy">
                    {percentage}%
                  </span>
                </div>

                <p className="mx-auto max-w-lg font-body text-xs sm:text-sm leading-relaxed text-soft-brown">
                  {feedback.desc}
                </p>

                {/* ─────────────────────────────────────────────────────────────
                    SCORE SUBMISSION FORM (Automatic if name known, prompted otherwise)
                    ───────────────────────────────────────────────────────────── */}
                <div className="mt-6 mx-auto max-w-md">
                  {isSubmitting ? (
                    <div className="rounded-2xl border-2 border-gold/40 bg-champagne/40 p-4 text-center shadow-xs flex items-center justify-center gap-2.5">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-burgundy border-t-transparent" />
                      <span className="text-xs sm:text-sm font-bold text-burgundy">
                        {isTelugu ? "మీ స్కోరు లీడర్‌బోర్డ్‌లో భద్రపరుస్తోంది..." : "Locking your score on the leaderboard..."}
                      </span>
                    </div>
                  ) : !isScoreSubmitted || isEditingName ? (
                    <form
                      onSubmit={handleSubmitScore}
                      className="rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-champagne/40 to-peach-50/50 p-4 sm:p-5 text-left shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-burgundy font-bold text-xs sm:text-sm">
                          <Trophy className="h-4 w-4 text-gold shrink-0" />
                          <span>{isEditingName ? (isTelugu ? "పేరు మార్చండి" : "Update Your Name") : t.addNameToLeaderboard}</span>
                        </div>
                        {isEditingName && (
                          <button
                            type="button"
                            onClick={() => setIsEditingName(false)}
                            className="text-[11px] font-semibold text-soft-brown hover:text-charcoal cursor-pointer"
                          >
                            {isTelugu ? "రద్దు" : "Cancel"}
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-soft-brown mt-1">
                        {isTelugu
                          ? "మీ పేరు నమోదు చేసి ఫ్యామిలీ లీడర్‌బోర్డ్‌లో మీ స్థానాన్ని పొందండి:"
                          : "Save your name and lock your rank on the live Family Leaderboard:"}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={playerName}
                            onChange={(e) => {
                              setPlayerName(e.target.value);
                              setSubmitError("");
                            }}
                            placeholder={t.playerNamePlaceholder || "Your name (e.g. Rahul, Priya)..."}
                            maxLength={40}
                            required
                            autoFocus={isEditingName}
                            className="w-full rounded-xl border border-warm-beige bg-warm-white px-3.5 py-2.5 text-xs sm:text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:ring-1 focus:ring-burgundy focus:outline-hidden"
                          />
                          <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-soft-brown/40 pointer-events-none" />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting || !playerName.trim()}
                          className="rounded-xl bg-gradient-to-r from-burgundy to-deep-burgundy px-5 py-2.5 text-xs sm:text-sm font-bold text-warm-white shadow-md hover:scale-105 transition-all disabled:opacity-50 shrink-0 cursor-pointer active:scale-95"
                        >
                          {isSubmitting
                            ? t.savingRank || "Saving..."
                            : isEditingName
                            ? (isTelugu ? "సేవ్ చేయండి" : "Update")
                            : t.submitRank || "Submit Rank"}
                        </button>
                      </div>

                      {submitError && (
                        <p className="mt-2 text-xs font-semibold text-rose-600">{submitError}</p>
                      )}
                    </form>
                  ) : (
                    <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/90 p-4 text-center shadow-xs">
                      <p className="font-heading text-base sm:text-lg font-bold text-emerald-900">
                        {isTelugu
                          ? `🎉 బోర్డులో మీ ర్యాంక్: #${userRank || 1}!`
                          : `🎉 Rank #${userRank || 1} on the Family Board!`}
                      </p>
                      <p className="text-xs text-emerald-800 mt-1">
                        {submitSuccessMsg ||
                          (isTelugu
                            ? `మీ స్కోరు '${playerName}' పేరుతో నమోదైంది!`
                            : `Your score is locked in as ${playerName}!`)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsEditingName(true)}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 underline hover:text-emerald-900 cursor-pointer transition-colors"
                      >
                        <span>{isTelugu ? "పేరు మార్చుకోండి (Edit Name)" : "Edit Name on Leaderboard"}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* ─────────────────────────────────────────────────────────────
                    FAMILY LEADERBOARD (Live from Backend)
                    ───────────────────────────────────────────────────────────── */}
                {leaderboard.length > 0 && (
                  <div className="mt-8 rounded-2xl border border-warm-beige/80 bg-warm-white p-4 sm:p-6 text-left shadow-sm">
                    <div className="flex items-center justify-between border-b border-warm-beige/50 pb-3">
                      <div className="flex items-center gap-2">
                        <Medal className="h-5 w-5 text-gold" />
                        <h3 className="font-heading text-lg font-bold text-charcoal">
                          {t.familyLeaderboard}
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-burgundy bg-champagne/80 px-2.5 py-0.5 rounded-full">
                        {totalPlayers} {totalPlayers === 1 ? t.playerSingle : t.playersCount}
                      </span>
                    </div>

                    <div className="mt-3 divide-y divide-warm-beige/30 max-h-64 overflow-y-auto pr-1">
                      {leaderboard.map((entry, idx) => {
                        const rankNumber = idx + 1;
                        const medal =
                          rankNumber === 1 ? "🥇" : rankNumber === 2 ? "🥈" : rankNumber === 3 ? "🥉" : `#${rankNumber}`;
                        const isCurrent =
                          entry.player_name.toLowerCase() === playerName.trim().toLowerCase();

                        return (
                          <div
                            key={entry.id || idx}
                            className={`flex items-center justify-between py-2.5 text-xs sm:text-sm transition-colors ${
                              isCurrent
                                ? "font-bold text-burgundy bg-peach-50/80 rounded-xl px-2.5 border border-gold/30"
                                : "text-charcoal hover:bg-champagne/20 rounded-xl px-2.5"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="w-6 text-center font-bold text-sm shrink-0">
                                {medal}
                              </span>
                              <span className="truncate max-w-[160px] sm:max-w-[240px]">
                                {entry.player_name}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-bold text-burgundy bg-peach-100 px-1.5 py-0.5 rounded-full shrink-0">
                                  {isTelugu ? "మీరు" : "You"}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-bold text-burgundy">
                                {entry.score}/{entry.total}
                              </span>
                              <span className="text-[11px] text-soft-brown/70 font-semibold">
                                ({Math.round(entry.percentage)}%)
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ─────────────────────────────────────────────────────────────
                    REVIEW MEMORIES ACCORDION
                    ───────────────────────────────────────────────────────────── */}
                <div className="mt-8 text-left">
                  <button
                    type="button"
                    onClick={() => setShowReview(!showReview)}
                    className="flex w-full items-center justify-between rounded-2xl border border-warm-beige/80 bg-champagne/30 px-5 py-3 text-xs sm:text-sm font-bold text-charcoal hover:bg-champagne/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-burgundy" />
                      <span>
                        {showReview
                          ? t.hideReviewButton || "Hide Your Locked Answers"
                          : isTelugu
                          ? `మొత్తం ${questions.length} జ్ఞాపకాలను చూడండి`
                          : `Review All ${questions.length} Family Memories`}
                      </span>
                    </div>
                    {showReview ? (
                      <ChevronUp className="h-4 w-4 text-soft-brown" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-soft-brown" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showReview && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 space-y-4 overflow-hidden"
                      >
                        {questions.map((q, qIdx) => {
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
                                <span className="text-[11px] font-bold text-burgundy uppercase">
                                  {isTelugu ? `${t.questionLabel} ${qIdx + 1}` : `Question ${qIdx + 1}`} • {revCategory}
                                </span>
                                {hasChosen ? (
                                  wasCorrect ? (
                                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      {isTelugu ? "సరిగ్గా చెప్పారు" : "Correct"}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                                      <XCircle className="h-3.5 w-3.5" />
                                      {isTelugu ? "తప్పయింది" : "Missed"}
                                    </span>
                                  )
                                ) : (
                                  <span className="text-soft-brown/60">
                                    {isTelugu ? "సమాధానం ఇవ్వలేదు" : "Unanswered"}
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 font-heading text-sm sm:text-base font-bold text-charcoal">
                                {revQuestion}
                              </p>

                              <div className="mt-3 space-y-1.5">
                                {q.options.map((opt, optIdx) => {
                                  const isSelectedByPlayer = chosenIdx === optIdx;
                                  const optRevText = teRevQ?.options?.[optIdx] || opt.text;
                                  let rowStyle = "bg-champagne/10 border-warm-beige/30 text-charcoal/70";

                                  if (opt.isCorrect) {
                                    rowStyle = "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold";
                                  } else if (isSelectedByPlayer && !opt.isCorrect) {
                                    rowStyle = "bg-rose-50 border-rose-300 text-rose-950 line-through opacity-80";
                                  }

                                  return (
                                    <div
                                      key={optIdx}
                                      className={`flex items-center justify-between rounded-xl border px-3 py-2 ${rowStyle}`}
                                    >
                                      <span>{optRevText}</span>
                                      {opt.isCorrect && (
                                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                                          {isTelugu ? "✓ సరైనది" : "✓ Correct"}
                                        </span>
                                      )}
                                      {isSelectedByPlayer && !opt.isCorrect && (
                                        <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                                          {isTelugu ? "✗ మీ సమాధానం" : "✗ Your Guess"}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Explanation */}
                              <div className="mt-2.5 rounded-xl bg-champagne/30 p-2.5 text-xs text-soft-brown">
                                <span className="font-bold text-burgundy">
                                  {isTelugu ? "జ్ఞాపకం: " : "Memory: "}
                                </span>
                                {revExplanation}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Footer Notice */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-warm-beige/80 bg-champagne/40 px-6 py-2.5 text-xs font-semibold text-soft-brown shadow-2xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>{t.triviaCompletedPill || "Trivia Completed • Scores Locked"}</span>
                  </div>
                  {!embedded && (
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 rounded-full border border-warm-beige bg-warm-white px-7 py-3 text-sm font-medium text-charcoal shadow-2xs transition-all hover:bg-champagne/30 active:scale-95"
                    >
                      <Home className="h-4 w-4" />
                      <span>{t.backHome || "Back to Anniversary Home"}</span>
                    </Link>
                  )}
                </div>
              </>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
