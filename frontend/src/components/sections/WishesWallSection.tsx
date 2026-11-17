"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import SectionHeading from "@/components/ui/SectionHeading";
import { Send, Heart, Sparkles, Check, Trash2, User } from "lucide-react";
import { fetchWishes, postWish, adminDeleteWish } from "@/lib/api";
import type { GuestWish } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/data/translations";

const EMOJI_OPTIONS = ["❤️", "🙏", "🪔", "🎉", "🥂", "🌸", "✨", "💐", "🕊️", "💛"];

export default function WishesWallSection() {
  const { language, isTelugu } = useLanguage();
  const t = translations[language].wishes;

  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [authorName, setAuthorName] = useState("");
  const [relation, setRelation] = useState("");
  const [message, setMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("❤️");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Admin access state
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  const loadWishes = useCallback(async () => {
    setIsLoading(true);
    const res = await fetchWishes(50);
    if (res.success) {
      setWishes(res.wishes);
      setTotalCount(res.count);
    }
    setIsLoading(false);
  }, []);

  // Load initial wishes and remembered user name
  useEffect(() => {
    const timer = setTimeout(() => {
      loadWishes();
      try {
        const savedName = localStorage.getItem("saa_user_name");
        if (savedName) setAuthorName(savedName);

        const adminKey = localStorage.getItem("saa_admin_key");
        if (adminKey) setHasAdminAccess(true);
      } catch {}
    }, 0);

    return () => clearTimeout(timer);
  }, [loadWishes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !message.trim() || isSubmitting) return;

    if (authorName.trim().length < 2) {
      setError("Please enter a name with at least 2 characters");
      return;
    }
    if (message.trim().length < 5) {
      setError("Please write at least 5 characters in your message");
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

    if (res.success && res.wish) {
      setWishes((prev) => [res.wish!, ...prev]);
      setTotalCount((prev) => prev + 1);
      setMessage("");
      setJustSubmitted(true);
      setTimeout(() => setJustSubmitted(false), 3000);
    } else {
      setError(res.error || "Failed to post wish. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleDeleteWish = async (id: number) => {
    const adminKey = localStorage.getItem("saa_admin_key") || "";
    if (!adminKey) return;

    setWishes((prev) => prev.filter((w) => w.id !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));

    try {
      await adminDeleteWish(id, adminKey);
    } catch (err) {
      console.warn("Failed to delete wish:", err);
    }
  };

  return (
    <section id="wishes" className="relative py-20 sm:py-28 bg-peach-50/40 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title={t.heading}
          subtitle={t.subtitle}
        />

        {/* ── Wish Submission Box ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 mx-auto max-w-2xl rounded-3xl border-2 border-gold/40 bg-warm-white p-6 sm:p-8 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full bg-peach-100/50 pointer-events-none" />

          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-gold" />
            <h3 className="font-heading text-lg sm:text-xl font-bold text-charcoal">
              {isTelugu ? "అమ్మ & నాన్నల కోసం మీ ఆశీస్సులు రాయండి" : "Write a Blessing for Mom & Dad"}
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
                  {t.nameLabel} <span className="text-burgundy">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    maxLength={40}
                    required
                    className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:bg-warm-white focus:outline-hidden"
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-soft-brown/40 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-soft-brown mb-1">
                  {t.relationLabel} <span className="text-soft-brown/60">({isTelugu ? "ఐచ్ఛికం" : "optional"})</span>
                </label>
                <input
                  type="text"
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  placeholder={t.relationPlaceholder}
                  maxLength={30}
                  className="w-full rounded-xl border border-warm-beige bg-champagne/20 px-3.5 py-2.5 text-xs sm:text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:bg-warm-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-xs font-semibold text-soft-brown mb-1">
                {t.messageLabel} <span className="text-burgundy">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.messagePlaceholder}
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
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-soft-brown/70">
                {isTelugu ? "కుటుంబ సభ్యులందరికీ కనిపిస్తుంది ❤️" : "Visible to all family members ❤️"}
              </span>

              <button
                type="submit"
                disabled={isSubmitting || !authorName.trim() || !message.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-burgundy px-6 py-2.5 text-xs sm:text-sm font-semibold text-warm-white shadow-md transition-all hover:bg-deep-burgundy active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {justSubmitted ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span>{isTelugu ? "ఆశీస్సులు పంపబడ్డాయి!" : "Blessing Sent!"}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmitting ? (t.submitting || "Sending...") : (t.submitWish || "Post Blessing")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* ── Wishes Cards Wall ── */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">
              {isTelugu ? `ఆత్మీయుల ఆశీస్సులు (${totalCount})` : `Family Blessings (${totalCount})`}
            </h4>
            <span className="text-xs text-soft-brown font-medium">
              {isTelugu ? "కొత్తవి ముందుగా" : "Sorted newest first"}
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-soft-brown/70 text-sm">
              {isTelugu ? "ఆశీస్సులను లోడ్ చేస్తోంది..." : "Loading heartfelt blessings..."}
            </div>
          ) : wishes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-warm-beige bg-warm-white/60 p-12 text-center text-soft-brown">
              <Heart className="h-10 w-10 text-gold/60 mx-auto mb-2" />
              <p className="font-heading text-lg font-semibold text-charcoal">
                {isTelugu ? "మొదటి శుభాకాంక్షను మీరే తెలపండి!" : "Be the first to leave a blessing!"}
              </p>
              <p className="text-xs mt-1 max-w-sm mx-auto">
                {isTelugu
                  ? "బుజ్జి & సత్య దంపతులకు మీ ఆశీస్సులను పంచుకోవడానికి పై ఫారమ్‌ను పూరించండి."
                  : "Fill out the form above to share your anniversary wishes with Bujji & Satya."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {wishes.map((wish) => (
                <motion.div
                  key={wish.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative flex flex-col justify-between rounded-2xl border border-warm-beige/80 bg-warm-white p-5 shadow-xs hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Header: Avatar/Emoji + Author + Relation */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-peach-100 text-xl shrink-0 shadow-2xs">
                          {wish.emoji || "❤️"}
                        </span>
                        <div>
                          <p className="font-sans text-sm font-bold text-charcoal leading-snug">
                            {wish.author_name}
                          </p>
                          {wish.relation && (
                            <span className="inline-block text-[10px] font-semibold text-burgundy bg-peach-100/80 px-2 py-0.2 rounded-full">
                              {wish.relation}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Admin Delete Action */}
                      {hasAdminAccess && (
                        <button
                          type="button"
                          onClick={() => handleDeleteWish(wish.id)}
                          className="text-red-400 hover:text-red-600 p-1 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-70 group-hover:opacity-100"
                          title="Admin: Delete Wish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Message Body */}
                    <p className="font-body text-xs sm:text-sm text-charcoal/90 leading-relaxed whitespace-pre-line">
                      &ldquo;{wish.message}&rdquo;
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="mt-4 pt-3 border-t border-warm-beige/40 text-[10px] font-medium text-soft-brown/60">
                    {wish.created_at}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
