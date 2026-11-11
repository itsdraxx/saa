"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle2,
  Sparkles,
  Camera,
  Plane,
  Home,
} from "lucide-react";
import type { InstagramPost, InstagramComment } from "@/data/instagramPosts";
import InstagramCommentsSheet from "./InstagramCommentsSheet";
import InstagramNameModal from "./InstagramNameModal";

interface InstagramPostCardProps {
  post: InstagramPost;
}

export default function InstagramPostCard({ post }: InstagramPostCardProps) {
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);

  // Like state (persisted in localStorage)
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(post.likesCount);
  const [showHeartAnim, setShowHeartAnim] = useState(false);

  // Bookmark / Save state
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Share tooltip / toast state
  const [showShareToast, setShowShareToast] = useState(false);

  // Comments state (persisted in localStorage)
  const [comments, setComments] = useState<InstagramComment[]>(post.comments);
  const [isCommentsSheetOpen, setIsCommentsSheetOpen] = useState(false);

  // User Name state (persisted in localStorage)
  const [userName, setUserName] = useState<string>("");
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  // Caption expanded state
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);

  const lastTapRef = useRef<number>(0);

  // Hydration-safe client-side sync from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedName = localStorage.getItem("saa_user_name");
        if (savedName) setUserName(savedName);

        const storedLike = localStorage.getItem(`saa_insta_like_${post.id}`);
        if (storedLike === "true") {
          setIsLiked(true);
          setLikesCount(post.likesCount + 1);
        }

        const storedSaved = localStorage.getItem(`saa_insta_save_${post.id}`);
        if (storedSaved === "true") setIsSaved(true);

        const storedComments = localStorage.getItem(`saa_insta_comments_${post.id}`);
        if (storedComments) {
          const parsed = JSON.parse(storedComments);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setComments([...post.comments, ...parsed]);
          }
        }
      } catch {}
    }, 0);

    return () => clearTimeout(timer);
  }, [post.id, post.likesCount, post.comments]);

  // Open comments flow: asks for name if never filled, else opens comments sheet immediately!
  const handleOpenCommentsFlow = () => {
    // Check local storage fresh in case it was set on another card
    let currentName = userName;
    try {
      const stored = localStorage.getItem("saa_user_name");
      if (stored) {
        currentName = stored;
        setUserName(stored);
      }
    } catch {}

    if (!currentName || !currentName.trim()) {
      // Name has not been given yet -> Ask name first!
      setIsNameModalOpen(true);
    } else {
      // Name is already known -> Never ask again! Open comments sheet directly!
      setIsCommentsSheetOpen(true);
    }
  };

  // Called when user submits their name in the Name Modal
  const handleNameSubmitted = (submittedName: string) => {
    setUserName(submittedName);
    try {
      localStorage.setItem("saa_user_name", submittedName);
    } catch {}

    // Close name modal and immediately open comments!
    setIsNameModalOpen(false);
    setIsCommentsSheetOpen(true);
  };

  // Toggle Like
  const handleToggleLike = () => {
    const nextState = !isLiked;
    setIsLiked(nextState);
    const newCount = nextState ? likesCount + 1 : likesCount - 1;
    setLikesCount(newCount);

    try {
      localStorage.setItem(`saa_insta_like_${post.id}`, String(nextState));
    } catch {}

    if (nextState) {
      triggerHeartAnimation();
    }
  };

  // Toggle Save
  const handleToggleSave = () => {
    const nextState = !isSaved;
    setIsSaved(nextState);
    try {
      localStorage.setItem(`saa_insta_save_${post.id}`, String(nextState));
    } catch {}
  };

  // Share action
  const handleShare = async () => {
    const shareText = `Check out this 25-Year memory of Bujji & Satya: "${post.title}" (${post.year}) ❤️`;
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/#${post.id}` : "";

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bujji Weds Satya — ${post.title}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl || window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2400);
      } catch {}
    }
  };

  // Double tap / double click to like animation
  const triggerHeartAnimation = () => {
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 900);
  };

  const handleMediaDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        setIsLiked(true);
        setLikesCount(likesCount + 1);
        try {
          localStorage.setItem(`saa_insta_like_${post.id}`, "true");
        } catch {}
      }
      triggerHeartAnimation();
    }
    lastTapRef.current = now;
  };

  // Carousel controls
  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : post.images.length - 1));
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev < post.images.length - 1 ? prev + 1 : 0));
  };

  // Add Comment from Sheet
  const handleAddCommentFromSheet = (text: string, authorName: string) => {
    const newComment: InstagramComment = {
      id: `comment-${Date.now()}`,
      username: authorName.toLowerCase().replace(/\s+/g, "_"),
      text: text,
      timestamp: "Just now",
      avatarText: authorName.slice(0, 2).toUpperCase(),
      avatarBg: "bg-burgundy",
      isCurrentUser: true,
    };

    const updated = [...comments, newComment];
    setComments(updated);

    try {
      const stored = localStorage.getItem(`saa_insta_comments_${post.id}`);
      const userComments = stored ? JSON.parse(stored) : [];
      userComments.push(newComment);
      localStorage.setItem(
        `saa_insta_comments_${post.id}`,
        JSON.stringify(userComments)
      );
    } catch {}
  };

  const currentMedia = post.images[currentSlide] || post.images[0];
  const hasMultipleImages = post.images.length > 1;

  return (
    <>
      <article
        id={post.id}
        className="relative flex flex-col w-full max-w-xl mx-auto rounded-2xl sm:rounded-3xl border border-warm-beige/80 bg-warm-white shadow-[0_8px_30px_rgba(122,20,30,0.06)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgba(122,20,30,0.12)]"
      >
        {/* =========================================================
            1. INSTAGRAM POST HEADER
            ========================================================= */}
        <header className="flex items-center justify-between px-3.5 py-3 sm:px-4 sm:py-3.5 border-b border-warm-beige/50 bg-warm-white/95">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Instagram Story Gradient Ring Avatar */}
            <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-xs">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-peach-50 border-2 border-warm-white overflow-hidden">
                <Image
                  src="/images/art/couple_sittinga_and_welcoming.png"
                  alt="Bujji & Satya"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>

            {/* Account & Location Info */}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-sans text-xs sm:text-sm font-bold text-charcoal tracking-tight hover:text-burgundy transition-colors cursor-pointer">
                  bujji_weds_satya
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 fill-[#0095F6] text-white inline-block shrink-0" />
                <span className="text-[10px] text-soft-brown/60">•</span>
                <span className="text-[11px] font-semibold text-burgundy bg-peach-100/80 px-2 py-0.5 rounded-full">
                  {post.year}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-soft-brown/80 mt-0.5">
                <MapPin className="h-3 w-3 text-burgundy shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-[260px]">
                  {post.location}
                </span>
              </div>
            </div>
          </div>

          {/* Category Pill Tag */}
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-burgundy bg-champagne/80 border border-warm-beige px-2.5 py-1 rounded-full capitalize">
            {post.category}
          </span>
        </header>

        {/* =========================================================
            2. POST MEDIA / PHOTO CAROUSEL
            Double click / double tap anywhere to trigger Heart burst!
            ========================================================= */}
        <div
          className="relative aspect-4/3 sm:aspect-square w-full select-none overflow-hidden bg-gradient-to-br from-[#1A0B0E] via-[#2E0F13] to-[#1F0A0E] flex items-center justify-center cursor-pointer group"
          onClick={handleMediaDoubleTap}
          onDoubleClick={handleToggleLike}
        >
          {/* Render Image or Rich Photographic Keepsake */}
          <div className="relative h-full w-full overflow-hidden flex items-center justify-center">
            {currentMedia.src &&
            (currentMedia.src.includes(".png") ||
              currentMedia.src.includes(".jpg") ||
              currentMedia.src.includes(".jpeg")) ? (
              <div className="relative h-full w-full">
                <Image
                  src={currentMedia.src}
                  alt={currentMedia.alt || post.title}
                  fill
                  priority={post.year === 2001 || post.year === 2024}
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 100vw, 600px"
                />
                {/* Subtle Warm Photographic Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
              </div>
            ) : (
              // Aesthetic Visual Keepsake Card
              <div
                className={`relative h-full w-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br ${
                  currentMedia.themeGradient || "from-amber-200 via-rose-100 to-amber-100"
                }`}
              >
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white/85 text-burgundy shadow-lg mb-3">
                  {currentMedia.iconName === "ring" ? (
                    <Sparkles className="h-8 w-8 text-gold" />
                  ) : currentMedia.iconName === "plane" ? (
                    <Plane className="h-8 w-8 text-burgundy" />
                  ) : currentMedia.iconName === "home" ? (
                    <Home className="h-8 w-8 text-amber-700" />
                  ) : (
                    <Camera className="h-8 w-8 text-burgundy" />
                  )}
                </div>
                <h4 className="font-heading text-xl sm:text-2xl font-bold text-charcoal">
                  {post.title}
                </h4>
                <p className="mt-1 font-body text-xs sm:text-sm text-soft-brown max-w-sm italic">
                  {currentMedia.caption || post.caption}
                </p>
              </div>
            )}

            {/* Top-Right Carousel Counter Badge (e.g. "1/3") */}
            {hasMultipleImages && (
              <div className="absolute top-3 right-3 z-10 rounded-full bg-black/65 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md shadow-md">
                {currentSlide + 1}/{post.images.length}
              </div>
            )}

            {/* Bottom Caption Pill in Image */}
            {currentMedia.tag && (
              <div className="absolute bottom-3 left-3 z-10 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white/95 backdrop-blur-md">
                {currentMedia.tag}
              </div>
            )}
          </div>

          {/* Carousel Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={handlePrevSlide}
                aria-label="Previous photo"
                className="absolute left-2.5 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-warm-white/80 text-charcoal shadow-md backdrop-blur-md transition-all hover:bg-warm-white hover:scale-110 active:scale-95 cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextSlide}
                aria-label="Next photo"
                className="absolute right-2.5 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-warm-white/80 text-charcoal shadow-md backdrop-blur-md transition-all hover:bg-warm-white hover:scale-110 active:scale-95 cursor-pointer opacity-90 sm:opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Instagram Heart Burst Animation on Double Tap / Like */}
          <AnimatePresence>
            {showHeartAnim && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.3, 1, 1],
                  opacity: [0, 1, 1, 0],
                }}
                exit={{ opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
              >
                <Heart className="h-28 w-28 sm:h-32 sm:w-32 fill-white text-white drop-shadow-[0_10px_25px_rgba(237,73,86,0.7)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* =========================================================
            3. INSTAGRAM ACTION BAR (Like, Comment, Share, Save)
            ========================================================= */}
        <div className="flex items-center justify-between px-3.5 pt-3 pb-1.5 sm:px-4">
          {/* Left Actions: Like, Comment, Share */}
          <div className="flex items-center gap-4">
            {/* Like Heart Button */}
            <button
              onClick={handleToggleLike}
              className="flex items-center justify-center transition-transform hover:scale-115 active:scale-90 cursor-pointer"
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              <Heart
                className={`h-6 w-6 sm:h-6.5 sm:w-6.5 transition-colors duration-200 ${
                  isLiked
                    ? "fill-[#ED4956] text-[#ED4956]"
                    : "text-charcoal hover:text-burgundy"
                }`}
              />
            </button>

            {/* Comment Button -> Opens Instagram Comments Sheet */}
            <button
              onClick={handleOpenCommentsFlow}
              className="flex items-center justify-center text-charcoal transition-transform hover:scale-115 hover:text-burgundy active:scale-90 cursor-pointer"
              aria-label="Open comments sheet"
            >
              <MessageCircle className="h-6 w-6 sm:h-6.5 sm:w-6.5" />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center text-charcoal transition-transform hover:scale-115 hover:text-burgundy active:scale-90 cursor-pointer relative"
              aria-label="Share post"
            >
              <Send className="h-5.5 w-5.5 sm:h-6 sm:w-6 -rotate-12" />
              {showShareToast && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-charcoal px-2 py-0.5 text-[10px] font-medium text-white shadow-lg whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>
          </div>

          {/* Carousel Pagination Dots in Center */}
          {hasMultipleImages && (
            <div className="flex items-center justify-center gap-1.5">
              {post.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === idx
                      ? "w-4 bg-burgundy"
                      : "w-1.5 bg-warm-beige hover:bg-gold/60"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Right Action: Bookmark / Save */}
          <button
            onClick={handleToggleSave}
            className="flex items-center justify-center text-charcoal transition-transform hover:scale-115 hover:text-burgundy active:scale-90 cursor-pointer"
            aria-label={isSaved ? "Remove from saved" : "Save post"}
          >
            <Bookmark
              className={`h-6 w-6 sm:h-6.5 sm:w-6.5 transition-colors duration-200 ${
                isSaved
                  ? "fill-burgundy text-burgundy"
                  : "text-charcoal hover:text-burgundy"
              }`}
            />
          </button>
        </div>

        {/* =========================================================
            4. LIKES COUNT & CAPTION DESCRIPTION
            ========================================================= */}
        <div className="px-3.5 sm:px-4 text-left pb-3">
          {/* Likes Count */}
          <p className="font-sans text-xs sm:text-sm font-bold text-charcoal">
            {likesCount.toLocaleString()} likes
          </p>

          {/* Caption Description */}
          <div className="mt-1 text-xs sm:text-sm text-charcoal font-sans leading-relaxed">
            <span className="font-bold text-charcoal mr-1.5 cursor-pointer hover:underline">
              bujji_weds_satya
            </span>
            <span className="font-semibold text-burgundy mr-1">
              {post.title} —
            </span>
            <span>
              {isCaptionExpanded
                ? post.caption
                : post.caption.slice(0, 115) + (post.caption.length > 115 ? "..." : "")}
            </span>

            {post.caption.length > 115 && (
              <button
                onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                className="ml-1 text-xs font-medium text-soft-brown/70 hover:text-burgundy cursor-pointer"
              >
                {isCaptionExpanded ? "less" : "more"}
              </button>
            )}
          </div>

          {/* Hashtags */}
          <div className="mt-1 flex flex-wrap gap-1.5">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-burgundy hover:underline cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* =========================================================
              5. COMMENTS PREVIEW & OPEN BUTTON (Instagram style)
              ========================================================= */}
          <div className="mt-2.5 pt-2 border-t border-warm-beige/40">
            {/* View all comments button -> Opens Instagram Comments Sheet */}
            <button
              onClick={handleOpenCommentsFlow}
              className="text-xs font-semibold text-soft-brown/70 hover:text-burgundy transition-colors cursor-pointer py-0.5 flex items-center gap-1"
            >
              <span>View all {comments.length} comments</span>
            </button>

            {/* Latest 1-2 comment previews */}
            <div className="space-y-1 mt-1">
              {comments.slice(-2).map((comment) => (
                <div
                  key={comment.id}
                  onClick={handleOpenCommentsFlow}
                  className="flex items-start justify-between text-xs sm:text-sm leading-snug cursor-pointer group/comment hover:opacity-85"
                >
                  <div className="flex-1 text-left">
                    <span className="font-bold text-charcoal mr-1.5">
                      {comment.username}
                    </span>
                    <span className="text-charcoal/90">{comment.text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick "Add a comment..." trigger row */}
            <div
              onClick={handleOpenCommentsFlow}
              className="mt-2.5 flex items-center justify-between rounded-full bg-champagne/40 border border-warm-beige/70 px-3.5 py-2 cursor-pointer hover:bg-champagne/70 transition-all text-soft-brown/60 text-xs"
            >
              <span className="truncate">
                {userName ? `Add a comment as ${userName}...` : "Add a comment for Bujji & Satya..."}
              </span>
              <span className="text-sm">❤️</span>
            </div>
          </div>

          {/* Date Timestamp at bottom */}
          <p className="mt-2 text-[10px] font-semibold text-soft-brown/60 uppercase tracking-wider">
            {post.dateStr}
          </p>
        </div>
      </article>

      {/* =========================================================
          6. INSTAGRAM COMMENTS SLIDE-UP SHEET (Authentic Instagram Style)
          ========================================================= */}
      <InstagramCommentsSheet
        isOpen={isCommentsSheetOpen}
        onClose={() => setIsCommentsSheetOpen(false)}
        post={post}
        comments={comments}
        onAddComment={handleAddCommentFromSheet}
        currentUserName={userName}
        onOpenNameModal={() => setIsNameModalOpen(true)}
      />

      {/* =========================================================
          7. NAME PROMPT MODAL (Only prompts once, remembered forever!)
          ========================================================= */}
      <InstagramNameModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        onSubmitName={handleNameSubmitted}
        initialName={userName}
      />
    </>
  );
}
