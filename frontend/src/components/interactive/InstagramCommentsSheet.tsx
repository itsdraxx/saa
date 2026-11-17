"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { X, Heart, CheckCircle2, Check, User, Sparkles, Trash2 } from "lucide-react";
import type { InstagramPost, InstagramComment } from "@/data/instagramPosts";
import { useLanguage } from "@/context/LanguageContext";
import { instagramPostsTelugu } from "@/data/translations";

interface InstagramCommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  post: InstagramPost;
  comments: InstagramComment[];
  onAddComment: (text: string, userName: string) => void;
  onDeleteComment?: (commentId: string) => void;
  currentUserName: string;
  onOpenNameModal: () => void;
}

export default function InstagramCommentsSheet({
  isOpen,
  onClose,
  post,
  comments,
  onAddComment,
  onDeleteComment,
  currentUserName,
  onOpenNameModal,
}: InstagramCommentsSheetProps) {
  const { isTelugu } = useLanguage();
  const tePost = isTelugu ? instagramPostsTelugu[post.id] : undefined;
  const displayCaption = tePost?.caption || post.caption;

  const [commentText, setCommentText] = useState("");
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [justPosted, setJustPosted] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check admin key
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const key = localStorage.getItem("saa_admin_token") || localStorage.getItem("saa_admin_key");
        if (key) setHasAdminAccess(true);
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Load comment likes when opened
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(`saa_comment_likes_${post.id}`);
        if (stored) {
          setCommentLikes(JSON.parse(stored));
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen, post.id]);

  // Auto-focus input when sheet opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
      // Lock body scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleToggleCommentLike = (commentId: string) => {
    const isCurrentlyLiked = !!commentLikes[commentId];
    const newLikes = { ...commentLikes, [commentId]: !isCurrentlyLiked };
    setCommentLikes(newLikes);

    const currentCount = likeCounts[commentId] || 0;
    setLikeCounts({
      ...likeCounts,
      [commentId]: isCurrentlyLiked ? Math.max(0, currentCount - 1) : currentCount + 1,
    });

    try {
      localStorage.setItem(`saa_comment_likes_${post.id}`, JSON.stringify(newLikes));
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!currentUserName.trim()) {
      onOpenNameModal();
      return;
    }

    onAddComment(commentText.trim(), currentUserName);
    setCommentText("");
    setJustPosted(true);
    setTimeout(() => setJustPosted(false), 2000);

    // Scroll to bottom of comments list
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 150);
  };

  const handleAddEmoji = (emoji: string) => {
    setCommentText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const quickEmojis = ["❤️", "🙌", "🔥", "😍", "🎉", "👏", "🌸", "🥹"];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-charcoal/65 backdrop-blur-xs cursor-pointer"
          />

          {/* Sheet / Modal Container (Instagram Bottom Sheet on Mobile, Centered Modal on Tablet/Desktop) */}
          <motion.div
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="relative z-10 flex flex-col w-full max-w-lg h-[82vh] sm:h-[75vh] max-h-[640px] bg-warm-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-warm-beige"
          >
            {/* Mobile Drag Handle Bar */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-warm-beige/90" />
            </div>

            {/* Header */}
            <header className="relative flex items-center justify-between px-4 py-3 border-b border-warm-beige/50 bg-warm-white/95">
              <div className="w-8" /> {/* spacer to center title */}
              <div className="flex flex-col items-center text-center">
                <h3 className="font-sans text-sm sm:text-base font-bold text-charcoal tracking-tight">
                  {isTelugu ? "కామెంట్లు" : "Comments"}
                </h3>
                <span className="text-[11px] text-soft-brown/70 font-medium">
                  {comments.length} {comments.length === 1 ? (isTelugu ? "కామెంట్" : "comment") : (isTelugu ? "కామెంట్లు" : "comments")}
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-charcoal hover:bg-champagne/80 transition-colors cursor-pointer"
                aria-label="Close comments"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Scrollable Comments List */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-4 divide-y divide-warm-beige/30"
            >
              {/* Pinned Original Post Caption at the top */}
              <div className="flex items-start gap-3 pb-3">
                {/* Bujji & Satya Story Avatar */}
                <div className="relative p-[1.5px] rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-peach-50 border border-warm-white overflow-hidden">
                    <Image
                      src="/images/art/couple_sittinga_and_welcoming.png"
                      alt="Bujji & Satya"
                      width={36}
                      height={36}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-sans text-xs sm:text-sm font-bold text-charcoal">
                      bujji_weds_satya
                    </span>
                    <CheckCircle2 className="h-3.5 w-3.5 fill-[#0095F6] text-white shrink-0" />
                    <span className="text-[10px] text-soft-brown/60">•</span>
                    <span className="text-[10px] font-semibold text-burgundy bg-peach-100/80 px-2 py-0.2 rounded-full">
                      {isTelugu ? "రచయిత" : "Author"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs sm:text-sm text-charcoal leading-relaxed">
                    <span className="font-semibold text-burgundy mr-1">
                      {post.title} —
                    </span>
                    <span>{displayCaption}</span>
                  </p>

                  <div className="mt-1.5 flex items-center gap-3 text-[11px] text-soft-brown/70 font-medium">
                    <span>{post.dateStr}</span>
                    <span>{post.location}</span>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-soft-brown/70">
                  <Sparkles className="h-8 w-8 text-gold mb-2" />
                  <p className="font-heading text-lg font-semibold text-charcoal">
                    No comments yet
                  </p>
                  <p className="text-xs max-w-xs mt-1">
                    Be the very first family member to leave loving blessings for Bujji & Satya!
                  </p>
                </div>
              ) : (
                comments.map((comment) => {
                  const isCommentLiked = !!commentLikes[comment.id];
                  const extraLikes = likeCounts[comment.id] || 0;

                  return (
                    <div
                      key={comment.id}
                      className="pt-3 flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-2.5 sm:gap-3 flex-1 text-left">
                        {/* User Avatar Circle */}
                        <div
                          className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-white font-bold text-xs shrink-0 shadow-2xs ${
                            comment.avatarBg || "bg-gradient-to-br from-burgundy to-peach-500"
                          }`}
                        >
                          {comment.avatarText ||
                            comment.username.slice(0, 2).toUpperCase()}
                        </div>

                        {/* Comment Content */}
                        <div className="flex-1">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="font-sans text-xs sm:text-sm font-bold text-charcoal">
                              {comment.username}
                            </span>
                            {comment.isCurrentUser && (
                              <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                                You
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 text-xs sm:text-sm text-charcoal leading-relaxed">
                            {comment.text}
                          </p>

                          {/* Timestamp and Reply */}
                          <div className="mt-1 flex items-center gap-3 text-[10px] text-soft-brown/70 font-medium">
                            <span>{comment.timestamp}</span>
                            {extraLikes > 0 && (
                              <span className="font-semibold text-burgundy">
                                {extraLikes} {extraLikes === 1 ? (isTelugu ? "లైక్" : "like") : (isTelugu ? "లైకులు" : "likes")}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setCommentText(`@${comment.username} `);
                                inputRef.current?.focus();
                              }}
                              className="font-semibold hover:text-charcoal cursor-pointer"
                            >
                              {isTelugu ? "స్పందించండి" : "Reply"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        {/* Only the author of the comment (or Admin) can delete it */}
                        {onDeleteComment &&
                          (hasAdminAccess ||
                            comment.isCurrentUser ||
                            (currentUserName &&
                              comment.username.toLowerCase() ===
                                currentUserName.toLowerCase().replace(/\s+/g, "_"))) && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete your comment?")) {
                                  onDeleteComment(comment.id);
                                }
                              }}
                              className="text-red-400 hover:text-red-600 p-0.5 hover:scale-115 active:scale-95 transition-all cursor-pointer opacity-70 hover:opacity-100"
                              title={hasAdminAccess ? "Admin: Delete Comment" : "Delete your comment"}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        {/* Comment Like Heart — anyone can like any comment! */}
                        <button
                          onClick={() => handleToggleCommentLike(comment.id)}
                          className="text-soft-brown/60 hover:scale-115 active:scale-95 transition-transform cursor-pointer"
                          aria-label="Like comment"
                        >
                          <Heart
                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                              isCommentLiked
                                ? "fill-[#ED4956] text-[#ED4956]"
                                : "text-soft-brown/50 hover:text-burgundy"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Emoji Reaction Pill Bar (Above Input, Instagram style) */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-champagne/40 border-t border-warm-beige/50 overflow-x-auto no-scrollbar gap-1">
              {quickEmojis.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => handleAddEmoji(emoji)}
                  className="text-base sm:text-lg hover:scale-125 transition-transform active:scale-95 p-1 rounded-full hover:bg-white/60 cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Bottom Fixed Comment Input Form */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2.5 px-3.5 py-3 border-t border-warm-beige/70 bg-warm-white"
            >
              {/* Current User Avatar with change-name trigger */}
              <button
                type="button"
                onClick={onOpenNameModal}
                title="Change your comment name"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-burgundy text-white font-bold text-xs shrink-0 shadow-2xs hover:scale-105 transition-transform cursor-pointer"
              >
                {currentUserName ? currentUserName.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
              </button>

              {/* Input Field */}
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    currentUserName
                      ? (isTelugu ? `${currentUserName} గా కామెంట్ రాయండి...` : `Add a comment as ${currentUserName}...`)
                      : (isTelugu ? "కామెంట్ రాయండి..." : "Add a comment...")
                  }
                  className="w-full text-xs sm:text-sm bg-transparent border-none text-charcoal placeholder:text-soft-brown/50 focus:outline-hidden pr-2"
                />
              </div>

              {/* Post Button */}
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="text-xs sm:text-sm font-bold text-burgundy disabled:opacity-30 disabled:cursor-not-allowed hover:text-deep-burgundy cursor-pointer shrink-0 transition-all flex items-center gap-1"
              >
                {justPosted ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <Check className="h-3.5 w-3.5" /> {isTelugu ? "పోస్ట్ అయింది" : "Posted"}
                  </span>
                ) : (
                  <span>{isTelugu ? "పోస్ట్ చేయండి" : "Post"}</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

