"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  User,
  Lock,
  Trash2,
  RefreshCw,
  LogOut,
  ExternalLink,
  MessageCircle,
  Heart,
  Trophy,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { instagramPosts } from "@/data/instagramPosts";
import {
  adminLogin,
  verifyAdminToken,
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

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:3000";

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adminToken, setAdminToken] = useState("");
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshAllData = useCallback(async (token: string = adminToken) => {
    if (!token) return;
    setIsLoadingData(true);
    try {
      const [statsRes, commentsRes, wishesRes, triviaRes] = await Promise.all([
        adminGetStats(token),
        adminGetComments(token, 200),
        adminGetWishes(token, 200),
        adminGetTrivia(token, 200),
      ]);

      if (statsRes.success && statsRes.stats) setStats(statsRes.stats);
      if (commentsRes.success) setComments(commentsRes.comments);
      if (wishesRes.success) setWishes(wishesRes.wishes);
      if (triviaRes.success) setTriviaScores(triviaRes.scores);
    } catch (err) {
      console.warn("Error refreshing admin data:", err);
    }
    setIsLoadingData(false);
  }, [adminToken]);

  // Auto-login from saved token
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const savedToken = localStorage.getItem("saa_admin_token");
        if (savedToken) {
          setIsVerifying(true);
          const res = await verifyAdminToken(savedToken);
          if (res.success) {
            setAdminToken(savedToken);
            setIsAuthenticated(true);
            await refreshAllData(savedToken);
          } else {
            localStorage.removeItem("saa_admin_token");
          }
          setIsVerifying(false);
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshAllData]);

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setIsVerifying(true);
    setAuthError("");

    const res = await adminLogin(username.trim(), password.trim());
    if (res.success && res.token) {
      setIsAuthenticated(true);
      setAdminToken(res.token);
      try {
        localStorage.setItem("saa_admin_token", res.token);
      } catch {}
      await refreshAllData(res.token);
    } else {
      setIsAuthenticated(false);
      setAuthError(res.error || "Invalid username or password. Please try again.");
    }
    setIsVerifying(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminToken("");
    setPassword("");
    try {
      localStorage.removeItem("saa_admin_token");
    } catch {}
  };

  // Delete Actions
  const handleDeleteComment = async (id: number) => {
    if (!confirm(`Are you sure you want to permanently delete Comment #${id}?`)) return;

    const res = await adminDeleteComment(id, adminToken);
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

    const res = await adminDeleteWish(id, adminToken);
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

    const res = await adminDeleteTrivia(id, adminToken);
    if (res.success) {
      setTriviaScores((prev) => prev.filter((t) => t.id !== id));
      showToast(`Trivia score #${id} deleted`);
      refreshAllData();
    } else {
      alert(res.error || "Failed to delete trivia score");
    }
  };

  // Filtered lists based on search
  const [selectedPostFilter, setSelectedPostFilter] = useState<string>("all");

  const filteredComments = comments.filter(
    (c) =>
      c.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.post_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group comments post-wise
  const postGroups = useMemo(() => {
    const postsToDisplay =
      selectedPostFilter === "all"
        ? instagramPosts
        : instagramPosts.filter((p) => p.id === selectedPostFilter);

    return postsToDisplay.map((post) => {
      const postComments = filteredComments.filter((c) => c.post_id === post.id);
      return {
        post,
        comments: postComments,
      };
    });
  }, [selectedPostFilter, filteredComments]);

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
  // 1. LOGIN SCREEN (Username & Password)
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
            25 Years of Us — Sign in with your admin credentials
          </p>

          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
            {/* Username Input */}
            <div className="relative text-left">
              <label className="block text-xs font-semibold text-soft-brown mb-1">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (authError) setAuthError("");
                  }}
                  placeholder="Enter admin username..."
                  required
                  autoComplete="username"
                  className="w-full rounded-2xl border-2 border-warm-beige bg-champagne/30 pl-10 pr-4 py-3 text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:bg-warm-white focus:outline-hidden"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soft-brown/50 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative text-left">
              <label className="block text-xs font-semibold text-soft-brown mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError("");
                  }}
                  placeholder="Enter admin password..."
                  required
                  autoComplete="current-password"
                  className="w-full rounded-2xl border-2 border-warm-beige bg-champagne/30 pl-10 pr-4 py-3 text-sm text-charcoal placeholder:text-soft-brown/50 focus:border-burgundy focus:bg-warm-white focus:outline-hidden"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-soft-brown/50 pointer-events-none" />
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
              disabled={isVerifying || !username.trim() || !password.trim()}
              className="w-full rounded-2xl bg-burgundy py-3 text-sm font-semibold text-warm-white shadow-md hover:bg-deep-burgundy transition-all disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? "Verifying..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-warm-beige/40">
            <a
              href={FRONTEND_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-soft-brown hover:text-burgundy transition-colors"
            >
              <span>Go to Anniversary Website</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // 2. AUTHENTICATED DASHBOARD (Clean Admin UI)
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

      {/* Clean Admin Header */}
      <header className="sticky top-0 z-40 bg-warm-white/95 backdrop-blur-md border-b border-warm-beige px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-burgundy/10 text-burgundy font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-heading text-lg sm:text-xl font-bold text-charcoal leading-none">
              Admin Moderation Portal
            </h1>
            <span className="text-[10px] text-soft-brown font-medium">
              Bujji & Satya — 25 Years of Us
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={FRONTEND_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-warm-beige bg-warm-white px-3.5 py-1.5 text-xs font-medium text-charcoal hover:bg-champagne/40 transition-all"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3 w-3 text-soft-brown" />
          </a>

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
              <span className="text-xs font-semibold uppercase tracking-wider">Trivia Plays</span>
              <Trophy className="h-4 w-4 text-gold" />
            </div>
            <p className="font-heading text-2xl sm:text-3xl font-bold text-charcoal">
              {stats?.total_trivia_players ?? triviaScores.length}
            </p>
          </div>
        </div>

        {/* Tab Controls & Search Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-warm-beige/70 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("comments")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "comments"
                  ? "bg-burgundy text-warm-white shadow-xs"
                  : "bg-warm-white text-soft-brown hover:bg-champagne/60 border border-warm-beige"
              }`}
            >
              Post Comments ({comments.length})
            </button>

            <button
              onClick={() => setActiveTab("wishes")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "wishes"
                  ? "bg-burgundy text-warm-white shadow-xs"
                  : "bg-warm-white text-soft-brown hover:bg-champagne/60 border border-warm-beige"
              }`}
            >
              Guest Wishes ({wishes.length})
            </button>

            <button
              onClick={() => setActiveTab("trivia")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "trivia"
                  ? "bg-burgundy text-warm-white shadow-xs"
                  : "bg-warm-white text-soft-brown hover:bg-champagne/60 border border-warm-beige"
              }`}
            >
              Trivia Leaderboard ({triviaScores.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-soft-brown/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by author or keyword..."
              className="w-full sm:w-64 rounded-xl border border-warm-beige bg-warm-white pl-9 pr-3 py-1.5 text-xs text-charcoal placeholder:text-soft-brown/40 focus:border-burgundy focus:outline-hidden"
            />
          </div>
        </div>

        {/* TAB 1: COMMENTS MODERATION (Grouped Post-Wise) */}
        {activeTab === "comments" && (
          <div className="mt-6 space-y-6">
            {/* Filter by Post Dropdown */}
            <div className="flex items-center justify-between bg-warm-white p-3.5 rounded-2xl border border-warm-beige shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-soft-brown">
                <Filter className="h-4 w-4 text-burgundy" />
                <span>Filter by Post:</span>
              </div>
              <select
                value={selectedPostFilter}
                onChange={(e) => setSelectedPostFilter(e.target.value)}
                className="rounded-xl border border-warm-beige bg-champagne/30 px-3 py-1.5 text-xs font-medium text-charcoal focus:border-burgundy focus:outline-hidden"
              >
                <option value="all">All Posts ({instagramPosts.length} posts)</option>
                {instagramPosts.map((post) => {
                  const count = comments.filter((c) => c.post_id === post.id).length;
                  return (
                    <option key={post.id} value={post.id}>
                      {post.year} • {post.title} ({count} {count === 1 ? "comment" : "comments"})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Post Groups Display */}
            {postGroups.every((g) => g.comments.length === 0) ? (
              <div className="rounded-2xl border border-warm-beige bg-warm-white p-12 text-center text-soft-brown">
                <MessageCircle className="mx-auto h-8 w-8 text-gold mb-2 opacity-50" />
                <p className="font-heading text-lg font-semibold">No comments found</p>
                <p className="text-xs mt-1">
                  {searchQuery ? "Try clearing your search query" : "No user has left a comment on these posts yet."}
                </p>
              </div>
            ) : (
              postGroups.map((group) => {
                if (group.comments.length === 0) return null;

                return (
                  <div
                    key={group.post.id}
                    className="rounded-2xl border border-warm-beige bg-warm-white shadow-xs overflow-hidden"
                  >
                    {/* Post Header Banner */}
                    <div className="bg-champagne/60 px-5 py-3 border-b border-warm-beige flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-burgundy/10 text-burgundy px-2 py-0.5 text-xs font-bold font-sans">
                          {group.post.year}
                        </span>
                        <h3 className="font-heading text-base font-bold text-charcoal">
                          {group.post.title}
                        </h3>
                      </div>
                      <span className="text-xs font-medium text-soft-brown/80 bg-warm-white px-2.5 py-0.5 rounded-full border border-warm-beige">
                        {group.comments.length} {group.comments.length === 1 ? "comment" : "comments"}
                      </span>
                    </div>

                    {/* Post Comments Table */}
                    <div className="divide-y divide-warm-beige/40">
                      {group.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-4 flex items-start justify-between gap-4 hover:bg-peach-50/40 transition-colors"
                        >
                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-sans text-xs font-bold text-charcoal">
                                @{comment.author_name}
                              </span>
                              <span className="text-[10px] text-soft-brown/60">
                                {comment.created_at}
                              </span>
                              <span className="text-[10px] bg-champagne text-soft-brown px-1.5 py-0.2 rounded-sm border border-warm-beige/60">
                                ID #{comment.id}
                              </span>
                            </div>
                            <p className="mt-1 text-xs sm:text-sm text-charcoal/90 leading-relaxed">
                              {comment.text}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="flex items-center gap-1 rounded-xl bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 text-xs font-semibold hover:bg-red-100 transition-colors shrink-0 cursor-pointer"
                            title="Delete comment permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: GUEST WISHES */}
        {activeTab === "wishes" && (
          <div className="mt-6 space-y-3">
            {filteredWishes.length === 0 ? (
              <div className="rounded-2xl border border-warm-beige bg-warm-white p-12 text-center text-soft-brown">
                <Sparkles className="mx-auto h-8 w-8 text-gold mb-2 opacity-50" />
                <p className="font-heading text-lg font-semibold">No guest wishes yet</p>
                <p className="text-xs mt-1">Wishes submitted via the Guest Wishes Wall will appear here.</p>
              </div>
            ) : (
              filteredWishes.map((wish) => (
                <div
                  key={wish.id}
                  className="rounded-2xl border border-warm-beige bg-warm-white p-4 shadow-xs flex items-start justify-between gap-4 hover:border-gold/50 transition-all"
                >
                  <div className="flex items-start gap-3 flex-1 text-left">
                    <span className="text-2xl p-2 rounded-xl bg-champagne/60 shrink-0">
                      {wish.emoji || "💐"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-base font-bold text-charcoal">
                          {wish.author_name}
                        </span>
                        {wish.relation && (
                          <span className="text-[10px] font-semibold text-burgundy bg-peach-100 px-2 py-0.5 rounded-full">
                            {wish.relation}
                          </span>
                        )}
                        <span className="text-[10px] text-soft-brown/60">
                          {wish.created_at}
                        </span>
                      </div>
                      <p className="mt-1 text-xs sm:text-sm text-charcoal/90 leading-relaxed italic font-heading">
                        &ldquo;{wish.message}&rdquo;
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteWish(wish.id)}
                    className="flex items-center gap-1 rounded-xl bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 text-xs font-semibold hover:bg-red-100 transition-colors shrink-0 cursor-pointer"
                    title="Delete wish permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: TRIVIA LEADERBOARD */}
        {activeTab === "trivia" && (
          <div className="mt-6">
            {filteredTrivia.length === 0 ? (
              <div className="rounded-2xl border border-warm-beige bg-warm-white p-12 text-center text-soft-brown">
                <Trophy className="mx-auto h-8 w-8 text-gold mb-2 opacity-50" />
                <p className="font-heading text-lg font-semibold">No trivia scores yet</p>
                <p className="text-xs mt-1">Scores recorded by family members will appear here.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-warm-beige bg-warm-white shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-champagne/60 border-b border-warm-beige text-soft-brown font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Accuracy</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-beige/40">
                    {filteredTrivia.map((entry, index) => (
                      <tr key={entry.id} className="hover:bg-peach-50/40">
                        <td className="py-3 px-4 font-bold text-burgundy">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                        </td>
                        <td className="py-3 px-4 font-bold text-charcoal">
                          {entry.player_name}
                        </td>
                        <td className="py-3 px-4 font-semibold text-charcoal">
                          {entry.score} / {entry.total}
                        </td>
                        <td className="py-3 px-4">
                          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                            {entry.percentage}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-soft-brown/70">
                          {entry.created_at}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteTrivia(entry.id)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 p-1 cursor-pointer"
                            title="Delete score"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
