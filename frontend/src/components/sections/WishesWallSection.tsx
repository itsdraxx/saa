"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import { Send, Heart, Sparkles, Check, User, HeartHandshake } from "lucide-react";
import { postWish } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";

const EMOJI_OPTIONS = ["❤️", "🙏", "🪔", "🎉", "🥂", "🌸", "✨", "💐", "🕊️", "💛"];

export default function WishesWallSection() {
  const { language, isTelugu } = useLanguage();
  const t = translations[language].wishes;

  // Form state
  const [authorName, setAuthorName] = useState("");
  const [relation, setRelation] = useState("");
  const [message, setMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("❤️");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedAuthorName, setSubmittedAuthorName] = useState("");
  const [error, setError] = useState("");

  // Load remembered user name
  useEffect(() => {
    try {
      const savedName = localStorage.getItem("saa_user_name");
      if (savedName) setAuthorName(savedName);
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim() || isSubmitting) return;

    if (authorName.trim().length < 2) {
      setError(
        isTelugu
          ? "దయచేసి కనీసం 2 అక్షరాలతో మీ పేరును నమోదు చేయండి"
          : "Please enter a name with at least 2 characters"
      );
      return;
    }
    if (message.trim().length < 5) {
      setError(
        isTelugu
          ? "దయచేసి మీ సందేశంలో కనీసం 5 అక్షరాలు రాయండి"
          : "Please write at least 5 characters in your message"
      );
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      localStorage.setItem("saa_user_name", authorName.trim());
    } catch {}

    const res = await postWish({
      author_name: authorName.trim(),
      relation: relation.trim() || undefined,
      message: message.trim(),
      emoji: selectedEmoji,
    });

    if (res.success) {
      setSubmittedAuthorName(authorName.trim());
      setIsSuccess(true);
      setMessage("");
    } else {
      setError(
        res.error ||
          (isTelugu
            ? "ఆశీస్సులు పంపడంలో లోపం జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి."
            : "Failed to post wish. Please try again.")
      );
    }
    setIsSubmitting(false);
  };

  const handleResetForAnother = () => {
    setIsSuccess(false);
    setMessage("");
    setError("");
  };

  return (
    <section id="wishes" className="relative py-20 sm:py-28 bg-peach-50/40 overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t.heading || (isTelugu ? "ఆత్మీయుల ఆశీస్సులు & దీవెనలు" : "Heartfelt Blessings & Prayers")}
          subtitle={
            t.subtitle ||
            (isTelugu
              ? "ఆది & సత్య రజతోత్సవం సందర్భంగా మీ హృదయపూర్వక ఆశీస్సులు మరియు దీవెనలు ఇక్కడ పంచుకోండి."
              : "Leave your prayers, congratulations, and warmest blessings for Adhi & Satya as they celebrate their 25th Wedding Anniversary.")
          }
        />

        {/* ── Wish Submission Box with Animated Success State ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 mx-auto max-w-2xl rounded-3xl border-2 border-gold/40 bg-warm-white p-6 sm:p-10 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-peach-100/50 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 rounded-full bg-champagne/40 pointer-events-none" />

          <AnimatePresence mode="wait">
            {isSuccess ? (
              // ── PROMINENT JOYFUL SUCCESS MESSAGE ──
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                className="py-6 sm:py-8 text-center relative z-10"
              >
                {/* Celebratory Icon */}
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-peach-100 via-rose-100 to-amber-100 text-burgundy shadow-inner mb-5 border-2 border-gold/40">
                  <HeartHandshake className="h-10 w-10 text-burgundy animate-pulse" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-peach-100/80 border border-warm-beige text-xs font-semibold text-burgundy mb-3">
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{isTelugu ? "విజయవంతంగా పంపబడింది" : "Delivered Successfully"}</span>
                </div>

                <h3 className="font-heading text-2xl sm:text-3xl font-bold text-burgundy tracking-tight">
                  {isTelugu ? "మీ ఆశీస్సులు చేరాయి! 🙏" : "Blessing Sent with Love! ❤️"}
                </h3>

                <p className="mt-3 text-sm sm:text-base font-body text-charcoal/90 leading-relaxed max-w-md mx-auto">
                  {isTelugu
                    ? `ధన్యవాదాలు ${submittedAuthorName} గారు! మీ మధురమైన ఆశీస్సులు, శుభాకాంక్షలు మరియు ప్రార్థనలు ఆది & సత్య దంపతులకు ప్రేమతో చేరాయి.`
                    : `Thank you, ${submittedAuthorName}! Your heartfelt congratulations, prayers, and blessings have been delivered straight to Adhi & Satya.`}
                </p>

                <div className="mt-8 pt-6 border-t border-warm-beige/60 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleResetForAnother}
                    className="inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-2.5 text-xs sm:text-sm font-semibold text-warm-white shadow-md transition-all hover:bg-deep-burgundy active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{isTelugu ? "ఇంకొక శుభాకాంక్షను పంపండి" : "Send Another Blessing"}</span>
                  </button>
                </div>
              </motion.div>
            ) : (
              // ── BLESSING SUBMISSION FORM ──
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative z-10"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-gold" />
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-charcoal">
                    {isTelugu ? "ఆది & సత్యల కోసం మీ ఆశీస్సులు రాయండి" : "Write a Blessing for Adhi & Satya"}
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Emoji Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-soft-brown mb-1.5">
                      {isTelugu ? "శుభ చిహ్నాన్ని ఎంచుకోండి:" : "Choose a celebration symbol:"}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setSelectedEmoji(emoji)}
                          className={`h-9 w-9 rounded-full text-base transition-all cursor-pointer ${
                            selectedEmoji === emoji
                              ? "bg-peach-100 border-2 border-burgundy scale-110 shadow-xs"
                              : "bg-champagne/40 hover:bg-champagne/80 hover:scale-105"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Relation Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-soft-brown mb-1">
                        {t.nameLabel || (isTelugu ? "మీ పేరు" : "Your Name")} <span className="text-burgundy">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder={t.namePlaceholder || (isTelugu ? "ఉదా: ఆనంద్, ప్రియ, సురేష్" : "e.g. Anand, Priya, Suresh")}
                          maxLength={40}
                          required
                          className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:bg-warm-white focus:outline-hidden"
                        />
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-soft-brown/40 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-soft-brown mb-1">
                        {t.relationLabel || (isTelugu ? "మీ బంధుత్వం" : "Your Relation or Family Tie")}{" "}
                        <span className="text-soft-brown/60">({isTelugu ? "ఐచ్ఛికం" : "optional"})</span>
                      </label>
                      <input
                        type="text"
                        value={relation}
                        onChange={(e) => setRelation(e.target.value)}
                        placeholder={t.relationPlaceholder || (isTelugu ? "ఉదా: చెల్లి, స్నేహితుడు, తమ్ముడు" : "e.g. Sister, Family Friend, Brother")}
                        maxLength={30}
                        className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:bg-warm-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <label className="block text-xs font-semibold text-soft-brown mb-1">
                      {t.messageLabel || (isTelugu ? "మీ ఆశీర్వాద సందేశం" : "Your Heartfelt Blessing")}{" "}
                      <span className="text-burgundy">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        isTelugu
                          ? "ఆది, సత్యల కోసం మీ మధురమైన ఆశీస్సులను ఇక్కడ రాయండి..."
                          : "Write your warm congratulations and prayers for Adhi & Satya..."
                      }
                      rows={3}
                      maxLength={500}
                      required
                      className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:bg-warm-white focus:outline-hidden resize-none"
                    />
                    <div className="text-right text-[10px] text-soft-brown/60 mt-0.5">
                      {message.length}/500
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs text-red-600 font-medium">
                      {error}
                    </p>
                  )}

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <span className="text-[11px] text-soft-brown/80 flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5 text-burgundy fill-burgundy shrink-0" />
                      <span>{isTelugu ? "ఆది & సత్య దంపతులకు ప్రేమతో చేరుతుంది" : "Delivered straight with love to Adhi & Satya"}</span>
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmitting || !authorName.trim() || !message.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-burgundy px-7 py-2.5 text-xs sm:text-sm font-semibold text-warm-white shadow-md transition-all hover:bg-deep-burgundy active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{isSubmitting ? (isTelugu ? "పంపుతోంది..." : "Sending...") : (isTelugu ? "ఆశీస్సులు పంపండి" : "Send Blessing")}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
