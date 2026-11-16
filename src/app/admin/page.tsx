"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  KeyRound,
  Trash2,
  RefreshCw,
  LogOut,
  ArrowLeft,
  MessageCircle,
  Heart,
  Trophy,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  verifyAdminKey,
  adminGetStats,
  adminGetComments,
  adminDeleteComment,
  adminGetWishes,
  adminDeleteWish,
  adminGetTrivia,
  adminDeleteTrivia,
} from "@/lib/api";
import type {
  AdminStats,
  BackendComment,
  GuestWish,
  TriviaLeaderboardEntry,
} from "@/lib/types";

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Dashboard state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeTab, setActiveTab] = useState<"comments" | "wishes" | "trivia">("comments");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data
  const [comments, setComments] = useState<BackendComment[]>([]);
  const [wishes, setWishes] = useState<GuestWish[]>([]);
  const [triviaScores, setTriviaScores] = useState<TriviaLeaderboardEntry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Auto-login from localStorage
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("saa_admin_key");
      if (savedKey) {
        setAdminKey(savedKey);
        verifyAndLoad(savedKey);
      }
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const verifyAndLoad = async (key: string) => {
    setIsVerifying(true);
    setAuthError("");

    const res = await verifyAdminKey(key);
    if (res.success) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem("saa_admin_key", key);
      } catch {}
      await refreshAllData(key);
    } else {
      setIsAuthenticated(false);
      setAuthError(res.error || "Invalid Admin Key. Please try again.");
    }
    setIsVerifying(false);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) return;
    verifyAndLoad(adminKey.trim());
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminKey("");
    try {
      localStorage.removeItem("saa_admin_key");
    } catch {}
  };

  const refreshAllData = async (key: string = adminKey) => {
    setIsLoadingData(true);
    try {
      const [statsRes, commentsRes, wishesRes, triviaRes] = await Promise.all([
        adminGetStats(key),
        adminGetComments(key, 200),
        adminGetWishes(key, 200),
        adminGetTrivia(key, 200),
      ]);

      if (statsRes.success && statsRes.stats) setStats(statsRes.stats);
      if (commentsRes.success) setComments(commentsRes.comments);
      if (wishesRes.success) setWishes(wishesRes.wishes);
      if (triviaRes.success) setTriviaScores(triviaRes.scores);
    } catch (err) {
      console.warn("Error refreshing admin data:", err);
    }
    setIsLoadingData(false);
  };

  // Delete Actions
  const handleDeleteComment = async (id: number) => {
    if (!confirm(`Are you sure you want to permanently delete Comment #${id}?`)) return;

    const res = await adminDeleteComment(id, adminKey);
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.id !== id));
      showToast(`Comment #${id} deleted`);
      refreshAllData();
    } else {
      alert(res.error || "Failed to delete comment");
    }
  };

  const handleDeleteWish = async (id: number) => {
    if (!confirm(`Are you sure you want to permanently delete Wish #${id}?`)) return;

    const res = await adminDeleteWish(id, adminKey);
    if (res.success) {
      setWishes((prev) => prev.filter((w) => w.id !== id));
      showToast(`Wish #${id} deleted`);
      refreshAllData();
    } else {
      alert(res.error || "Failed to delete wish");
    }
  };

  const handleDeleteTrivia = async (id: number) => {
    if (!confirm(`Are you sure you want to permanently delete Trivia Score #${id}?`)) return;

    const res = await adminDeleteTrivia(id, adminKey);
    if (res.success) {
      setTriviaScores((prev) => prev.filter((t) => t.id !== id));
      showToast(`Trivia score #${id} deleted`);
      refreshAllData();
    } else {
      alert(res.error || "Failed to delete trivia score");
    }
  };

  // Filtered lists based on search
  const filteredComments = comments.filter(
    (c) =>
      c.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.post_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredWishes = wishes.filter(
    (w) =>
      w.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.relation && w.relation.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTrivia = triviaScores.filter((t) =>
    t.player_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ──────────────────────────────────────────────
  // 1. LOGIN SCREEN
  // ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-peach-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border-2 border-gold/40 bg-warm-white p-8 sm:p-10 shadow-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-peach-100 text-burgundy shadow-sm mb-4">
            <ShieldCheck className="h-8 w-8 text-burgundy" />
          </div>

          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
            Admin Moderation Portal
          </h2>
          <p className="mt-1 text-xs text-soft-brown">
            25 Years of Us — Manage and moderate comments, wishes, and leaderboard entries
          </p>

          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
            <div className="relative text-left">
              <label className="block text-xs font-semibold text-soft-brown mb-1">
                Admin Secret Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => {
                    setAdminKey(e.target.value);
                    if (authError) setAuthError("");
                  }}
                  placeholder="Enter secret key (e.g. BujjiSatya25!)..."
                  required
                  className="w-full rounded-2xl border-2 border-warm-beige bg-champagne/30 px-4 py-3 text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:bg-warm-white focus:outline-hidden"
                />
                <KeyRound className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soft-brown/40 pointer-events-none" />
              </div>
            </div>

            {authError && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 text-left bg-red-50 p-2.5 rounded-xl border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !adminKey.trim()}
              className="w-full rounded-2xl bg-burgundy py-3 text-sm font-semibold text-warm-white shadow-md hover:bg-deep-burgundy transition-all disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? "Verifying..." : "Unlock Dashboard"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-warm-beige/40">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-soft-brown hover:text-burgundy transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Anniversary Website</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // 2. AUTHENTICATED DASHBOARD
  // ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-peach-50/50 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-2xl bg-charcoal text-white px-4 py-2.5 text-xs font-semibold shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 bg-warm-white/95 backdrop-blur-md border-b border-warm-beige px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-champagne/70 text-charcoal hover:bg-champagne hover:scale-105 transition-all"
            title="Return to site"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-charcoal leading-none">
              Admin Moderation
            </h1>
            <span className="text-[10px] text-soft-brown font-medium">
              Bujji & Satya — 25 Years of Us
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refreshAllData()}
            className="flex items-center gap-1.5 rounded-full border border-warm-beige bg-warm-white px-3 py-1.5 text-xs font-medium text-charcoal hover:bg-champagne/40 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingData ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 text-xs font-semibold hover:bg-red-100 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-warm-beige bg-warm-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-burgundy mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Comments</span>
              <MessageCircle className="h-4 w-4 text-gold" />
            </div>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
              {stats?.total_comments ?? comments.length}
            </p>
          </div>

          <div className="rounded-2xl border border-warm-beige bg-warm-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-burgundy mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Shared Likes</span>
              <Heart className="h-4 w-4 text-rose-500" />
            </div>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
              {stats?.total_likes ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-warm-beige bg-warm-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-burgundy mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Guest Wishes</span>
              <Sparkles className="h-4 w-4 text-amber-500" />
            </div>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
              {stats?.total_wishes ?? wishes.length}
            </p>
          </div>

          <div className="rounded-2xl border border-warm-beige bg-warm-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-burgundy mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Quiz Players</span>
              <Trophy className="h-4 w-4 text-gold" />
            </div>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
              {stats?.total_trivia_players ?? triviaScores.length}
            </p>
          </div>
        </div>

        {/* Tab Buttons & Search */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center rounded-2xl bg-champagne/50 p-1 border border-warm-beige self-start">
            <button
              type="button"
              onClick={() => setActiveTab("comments")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "comments"
                  ? "bg-warm-white text-burgundy shadow-xs"
                  : "text-soft-brown hover:text-charcoal"
              }`}
            >
              Comments ({comments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("wishes")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "wishes"
                  ? "bg-warm-white text-burgundy shadow-xs"
                  : "text-soft-brown hover:text-charcoal"
              }`}
            >
              Wishes ({wishes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("trivia")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                activeTab === "trivia"
                  ? "bg-warm-white text-burgundy shadow-xs"
                  : "text-soft-brown hover:text-charcoal"
              }`}
            >
              Trivia Scores ({triviaScores.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or keyword..."
              className="w-full rounded-2xl border border-warm-beige bg-warm-white px-3.5 py-2 pl-9 text-xs text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:outline-hidden shadow-2xs"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-soft-brown/50" />
          </div>
        </div>

        {/* Content Panels */}
        <div className="mt-6 rounded-3xl border border-warm-beige bg-warm-white shadow-md overflow-hidden">
          {/* TAB 1: COMMENTS */}
          {activeTab === "comments" && (
            <div>
              <div className="px-6 py-4 border-b border-warm-beige/50 bg-champagne/20 flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal">
                  All Post Comments ({filteredComments.length})
                </span>
                <span className="text-[11px] text-soft-brown">
                  Click the red trash icon to permanently remove any comment
                </span>
              </div>

              {filteredComments.length === 0 ? (
                <div className="p-12 text-center text-soft-brown text-sm">
                  No comments found matching your search.
                </div>
              ) : (
                <div className="divide-y divide-warm-beige/40">
                  {filteredComments.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-peach-50/30 transition-colors"
                    >
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-charcoal">
                            {c.author_name}
                          </span>
                          <span className="text-[10px] font-semibold text-burgundy bg-peach-100 px-2 py-0.2 rounded-full">
                            {c.post_id}
                          </span>
                          <span className="text-[10px] text-soft-brown/60">
                            • {c.created_at}
                          </span>
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-charcoal/90 leading-relaxed">
                          {c.text}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteComment(c.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer shrink-0"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WISHES */}
          {activeTab === "wishes" && (
            <div>
              <div className="px-6 py-4 border-b border-warm-beige/50 bg-champagne/20 flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal">
                  Guest Wishes Wall ({filteredWishes.length})
                </span>
                <span className="text-[11px] text-soft-brown">
                  Manage anniversary prayers & blessings
                </span>
              </div>

              {filteredWishes.length === 0 ? (
                <div className="p-12 text-center text-soft-brown text-sm">
                  No wishes found matching your search.
                </div>
              ) : (
                <div className="divide-y divide-warm-beige/40">
                  {filteredWishes.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-peach-50/30 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1 text-left">
                        <span className="text-2xl shrink-0 pt-0.5">{w.emoji || "❤️"}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-charcoal">
                              {w.author_name}
                            </span>
                            {w.relation && (
                              <span className="text-[10px] font-semibold text-burgundy bg-peach-100 px-2 py-0.2 rounded-full">
                                {w.relation}
                              </span>
                            )}
                            <span className="text-[10px] text-soft-brown/60">
                              • {w.created_at}
                            </span>
                          </div>
                          <p className="mt-1 text-xs sm:text-sm text-charcoal/90 leading-relaxed whitespace-pre-line">
                            &ldquo;{w.message}&rdquo;
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteWish(w.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer shrink-0"
                        title="Delete wish"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRIVIA */}
          {activeTab === "trivia" && (
            <div>
              <div className="px-6 py-4 border-b border-warm-beige/50 bg-champagne/20 flex items-center justify-between">
                <span className="text-xs font-bold text-charcoal">
                  Trivia Quiz Scores ({filteredTrivia.length})
                </span>
                <span className="text-[11px] text-soft-brown">
                  Delete test or duplicate leaderboard entries
                </span>
              </div>

              {filteredTrivia.length === 0 ? (
                <div className="p-12 text-center text-soft-brown text-sm">
                  No trivia scores found matching your search.
                </div>
              ) : (
                <div className="divide-y divide-warm-beige/40">
                  {filteredTrivia.map((t, idx) => (
                    <div
                      key={t.id}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-peach-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-center font-bold text-xs text-soft-brown/70 shrink-0">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-charcoal">
                            {t.player_name}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-soft-brown/70 mt-0.5">
                            <span>Score: {t.score}/{t.total} ({Math.round(t.percentage)}%)</span>
                            {t.time_taken && <span>• {t.time_taken}s</span>}
                            <span>• {t.created_at}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTrivia(t.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer shrink-0"
                        title="Delete score"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
